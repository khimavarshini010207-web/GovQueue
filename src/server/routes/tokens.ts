import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, requireAuth, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/queue-tokens/:id
router.get('/:id', async (req, res, next) => {
  try {
    const token = await db.getQueueTokenById(req.params.id);
    if (!token) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue token not found.' },
      });
      return;
    }

    res.json({
      success: true,
      data: token,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/queue-tokens/:id/complete (Staff or Admin action)
router.post('/:id/complete', authMiddleware, requireRole(['STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const token = await db.getQueueTokenById(req.params.id);
    if (!token) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue token not found.' },
      });
      return;
    }

    const now = new Date().toISOString();

    const updated = await db.transaction(async () => {
      const tok = await db.updateQueueToken(token.id, {
        status: 'COMPLETED',
        completedAt: now,
      });

      await db.updateAppointment(token.appointmentId, {
        status: 'COMPLETED',
      });

      if (token.appointment) {
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: token.appointment.citizenId,
          appointmentId: token.appointmentId,
          type: 'APPOINTMENT_COMPLETED',
          title: 'Service Completed',
          message: `Your service session for token ${token.tokenCode} has been marked completed. Thank you for using GovQueue.`,
          isRead: false,
          createdAt: now,
        });
      }

      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: req.user!.id,
        action: 'COMPLETE_TOKEN',
        entityType: 'QUEUE_TOKEN',
        entityId: token.id,
        metadata: { tokenCode: token.tokenCode },
        createdAt: now,
      });

      return tok;
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/queue-tokens/:id/no-show (Staff or Admin action)
router.post('/:id/no-show', authMiddleware, requireRole(['STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const token = await db.getQueueTokenById(req.params.id);
    if (!token) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue token not found.' },
      });
      return;
    }

    const now = new Date().toISOString();

    const updated = await db.transaction(async () => {
      const tok = await db.updateQueueToken(token.id, {
        status: 'NO_SHOW',
      });

      await db.updateAppointment(token.appointmentId, {
        status: 'NO_SHOW',
      });

      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: req.user!.id,
        action: 'NO_SHOW',
        entityType: 'QUEUE_TOKEN',
        entityId: token.id,
        metadata: { tokenCode: token.tokenCode },
        createdAt: now,
      });

      return tok;
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
