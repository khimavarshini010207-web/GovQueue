import { Router } from 'express';
import { db } from '../db/database.js';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../../shared/schemas.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { Appointment, QueueToken, Notification } from '../../shared/types.js';

const router = Router();

// GET /api/appointments
router.get('/', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { centerId, date, status } = req.query;

    let filter: Parameters<typeof db.getAppointments>[0] = {};

    if (user.role === 'CITIZEN') {
      filter.citizenId = user.id;
    } else {
      // Staff or Admin can filter
      if (centerId && typeof centerId === 'string') filter.centerId = centerId;
      if (date && typeof date === 'string') filter.date = date;
      if (status && typeof status === 'string') filter.status = status;
    }

    const appointments = await db.getAppointments(filter);
    // Sort descending by date and time
    appointments.sort((a, b) => {
      const cmp = b.appointmentDate.localeCompare(a.appointmentDate);
      return cmp !== 0 ? cmp : b.startTime.localeCompare(a.startTime);
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/:id
router.get('/:id', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const apt = await db.getAppointmentById(req.params.id);
    if (!apt) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    // Role check: citizens can only view their own
    if (req.user!.role === 'CITIZEN' && apt.citizenId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to view this appointment.' },
      });
      return;
    }

    res.json({
      success: true,
      data: apt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments
router.post('/', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const citizenId = req.user!.role === 'CITIZEN' ? req.user!.id : (req.body.citizenId || req.user!.id);

    const service = await db.getServiceById(data.serviceId);
    if (!service || !service.isActive) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_SERVICE', message: 'The selected service is unavailable.' },
      });
      return;
    }

    const center = await db.getCenterById(data.centerId);
    if (!center || !center.isActive) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_CENTER', message: 'The selected service center is unavailable.' },
      });
      return;
    }

    // Check existing active appointment for this user on the same date for the same service
    const existingCitizenApts = await db.getAppointments({
      citizenId,
      date: data.appointmentDate,
      serviceId: data.serviceId,
    });
    const duplicate = existingCitizenApts.find(
      a => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW'
    );
    if (duplicate) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DOUBLE_BOOKING',
          message: 'You already have an active appointment for this service on this date.',
        },
      });
      return;
    }

    // Check slot capacity
    const counters = await db.getCounters(data.centerId);
    const activeCounters = counters.filter(c => c.isActive);
    const capacityPerSlot = Math.max(1, activeCounters.length);

    const sameSlotApts = (
      await db.getAppointments({
        centerId: data.centerId,
        date: data.appointmentDate,
      })
    ).filter(
      a => a.startTime === data.startTime && a.status !== 'CANCELLED' && a.status !== 'NO_SHOW'
    );

    if (sameSlotApts.length >= capacityPerSlot) {
      res.status(400).json({
        success: false,
        error: { code: 'SLOT_FULL', message: 'This time slot is now fully booked. Please select another slot.' },
      });
      return;
    }

    // Calculate end time
    const [h, m] = data.startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + (service.estimatedMinutes || 15);
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Execute in database transaction
    const result = await db.transaction(async () => {
      const now = new Date().toISOString();
      const aptId = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingReference = `GQ-2026-${randSuffix}`;

      const newAppointment: Appointment = {
        id: aptId,
        citizenId,
        serviceId: service.id,
        centerId: center.id,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime,
        status: 'CONFIRMED',
        bookingReference,
        createdAt: now,
        updatedAt: now,
      };

      await db.createAppointment(newAppointment);

      // Link / Find or Create queue for that date and service center
      const queue = await db.findOrCreateQueue(center.id, service.id, data.appointmentDate);

      // Generate Queue Token
      const existingTokens = await db.getQueueTokens(queue.id);
      const nextTokenNum = existingTokens.length + 1;
      const tokenLetter = service.name.charAt(0).toUpperCase() || 'A';
      const tokenCode = `${tokenLetter}${nextTokenNum}`;

      const newToken: QueueToken = {
        id: `token-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        queueId: queue.id,
        appointmentId: newAppointment.id,
        tokenNumber: nextTokenNum,
        tokenCode,
        status: 'WAITING',
        checkedInAt: null,
        calledAt: null,
        completedAt: null,
        estimatedWaitMinutes: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.createQueueToken(newToken);

      // Create confirmation notification
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: citizenId,
        appointmentId: newAppointment.id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment Confirmed',
        message: `Your booking for ${service.name} at ${center.name} on ${data.appointmentDate} at ${data.startTime} is confirmed. Booking ref: ${bookingReference}, Token: ${tokenCode}.`,
        isRead: false,
        createdAt: now,
      };
      await db.createNotification(notification);

      // Audit log
      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: citizenId,
        action: 'CREATE_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: newAppointment.id,
        metadata: {
          bookingReference,
          tokenCode,
          date: data.appointmentDate,
          time: data.startTime,
          serviceName: service.name,
        },
        createdAt: now,
      });

      const hydrated = await db.getAppointmentById(newAppointment.id);
      return hydrated;
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/check-in
router.post('/:id/check-in', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const apt = await db.getAppointmentById(req.params.id);
    if (!apt) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    if (req.user!.role === 'CITIZEN' && apt.citizenId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized.' },
      });
      return;
    }

    if (apt.status === 'CHECKED_IN' || apt.status === 'IN_QUEUE') {
      res.json({
        success: true,
        data: apt,
      });
      return;
    }

    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Cannot check in an appointment with status: ${apt.status}` },
      });
      return;
    }

    const now = new Date().toISOString();

    const result = await db.transaction(async () => {
      // Update appointment status to CHECKED_IN
      await db.updateAppointment(apt.id, {
        status: 'CHECKED_IN',
      });

      // Find token and update to WAITING with checkedInAt
      if (apt.token) {
        await db.updateQueueToken(apt.token.id, {
          status: 'WAITING',
          checkedInAt: now,
        });
      }

      // Create notification
      await db.createNotification({
        id: `notif-${Date.now()}`,
        userId: apt.citizenId,
        appointmentId: apt.id,
        type: 'CHECK_IN',
        title: 'Check-In Complete',
        message: `You have successfully checked in for ${apt.service?.name}. Your queue token is ${apt.token?.tokenCode || 'active'}. Please watch the display screen.`,
        isRead: false,
        createdAt: now,
      });

      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: req.user!.id,
        action: 'CHECK_IN',
        entityType: 'APPOINTMENT',
        entityId: apt.id,
        metadata: { tokenCode: apt.token?.tokenCode },
        createdAt: now,
      });

      return await db.getAppointmentById(apt.id);
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id (Cancellation)
router.delete('/:id', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const apt = await db.getAppointmentById(req.params.id);
    if (!apt) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    if (req.user!.role === 'CITIZEN' && apt.citizenId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Unauthorized.' },
      });
      return;
    }

    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: `Appointment is already ${apt.status.toLowerCase()}.` },
      });
      return;
    }

    const now = new Date().toISOString();

    await db.transaction(async () => {
      await db.updateAppointment(apt.id, {
        status: 'CANCELLED',
      });

      if (apt.token) {
        await db.updateQueueToken(apt.token.id, {
          status: 'CANCELLED',
        });
      }

      await db.createNotification({
        id: `notif-${Date.now()}`,
        userId: apt.citizenId,
        appointmentId: apt.id,
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment Cancelled',
        message: `Your appointment for ${apt.service?.name} on ${apt.appointmentDate} has been cancelled.`,
        isRead: false,
        createdAt: now,
      });

      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: req.user!.id,
        action: 'CANCEL_APPOINTMENT',
        entityType: 'APPOINTMENT',
        entityId: apt.id,
        metadata: { bookingReference: apt.bookingReference },
        createdAt: now,
      });
    });

    res.json({
      success: true,
      data: { message: 'Appointment cancelled successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const apt = await db.getAppointmentById(req.params.id);
    if (!apt) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    // Role check: citizens cannot change status arbitrarily; only staff or admin can
    if (req.user!.role === 'CITIZEN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Citizens cannot alter appointment status directly.' },
      });
      return;
    }

    const data = updateAppointmentStatusSchema.parse(req.body);
    const updated = await db.updateAppointment(apt.id, { status: data.status });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
