import { Router } from 'express';
import { db } from '../db/database.js';
import { availabilityQuerySchema } from '../../shared/schemas.js';
import type { AvailabilitySlot } from '../../shared/types.js';

const router = Router();

// GET /api/availability?centerId=...&serviceId=...&date=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const { centerId, serviceId, date } = availabilityQuerySchema.parse(req.query);

    const center = await db.getCenterById(centerId);
    if (!center || !center.isActive) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_CENTER', message: 'Selected service center is not active or not found.' },
      });
      return;
    }

    const service = await db.getServiceById(serviceId);
    if (!service || !service.isActive) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_SERVICE', message: 'Selected government service is not active or not found.' },
      });
      return;
    }

    // Determine Day of Week
    // Parsing date YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ...

    // Fetch Operating Hours
    const operatingHours = await db.getOperatingHours(centerId);
    const dayHours = operatingHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!dayHours || dayHours.isClosed) {
      res.json({
        success: true,
        data: {
          date,
          dayOfWeek,
          isClosed: true,
          reason: 'The service center is closed on this day.',
          slots: [] as AvailabilitySlot[],
        },
      });
      return;
    }

    // Active counters at center determine capacity per slot
    const counters = await db.getCounters(centerId);
    const activeCounters = counters.filter(c => c.isActive);
    const capacityPerSlot = Math.max(1, activeCounters.length);

    // Existing active appointments for that center and date
    const existingAppointments = await db.getAppointments({
      centerId,
      date,
    });
    // Filter out cancelled and no-show appointments
    const activeBookings = existingAppointments.filter(
      a => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW'
    );

    // Generate slots in 15 or 20-minute intervals from openTime to closeTime
    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const slotStep = 15; // 15-minute slot intervals

    const slots: AvailabilitySlot[] = [];

    for (let m = startMinutes; m + slotStep <= endMinutes; m += slotStep) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      // Count appointments at this exact slot
      const bookedCount = activeBookings.filter(b => b.startTime === timeStr).length;

      const isAvailable = bookedCount < capacityPerSlot;

      slots.push({
        time: timeStr,
        available: isAvailable,
        reason: isAvailable ? undefined : 'Capacity reached for this time slot',
      });
    }

    res.json({
      success: true,
      data: {
        date,
        dayOfWeek,
        isClosed: false,
        openTime: dayHours.openTime,
        closeTime: dayHours.closeTime,
        capacityPerSlot,
        slots,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
