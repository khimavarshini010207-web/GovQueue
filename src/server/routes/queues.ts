import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/queues
router.get('/', async (req, res, next) => {
  try {
    const { centerId, serviceId, date } = req.query;
    const queues = await db.getQueues({
      centerId: typeof centerId === 'string' ? centerId : undefined,
      serviceId: typeof serviceId === 'string' ? serviceId : undefined,
      date: typeof date === 'string' ? date : undefined,
    });

    res.json({
      success: true,
      data: queues,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queues/:id
router.get('/:id', async (req, res, next) => {
  try {
    const queue = await db.getQueueById(req.params.id);
    if (!queue) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue not found.' },
      });
      return;
    }

    const allTokens = await db.getQueueTokens(queue.id);
    const waitingTokens = allTokens.filter(t => t.status === 'WAITING');
    const servingTokens = allTokens.filter(t => t.status === 'SERVING' || t.status === 'CALLED');

    res.json({
      success: true,
      data: {
        ...queue,
        waitingCount: waitingTokens.length,
        servingCount: servingTokens.length,
        tokens: allTokens,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/queues/:id/call-next (Staff & Admin action)
router.post('/:id/call-next', authMiddleware, requireRole(['STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const queue = await db.getQueueById(req.params.id);
    if (!queue) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue not found.' },
      });
      return;
    }

    const now = new Date().toISOString();

    const result = await db.transaction(async () => {
      const allTokens = await db.getQueueTokens(queue.id);

      // 1. Any token currently marked SERVING or CALLED should be moved to COMPLETED
      // unless specified otherwise
      const currentServing = allTokens.find(t => t.status === 'SERVING' || t.status === 'CALLED');
      if (currentServing) {
        await db.updateQueueToken(currentServing.id, {
          status: 'COMPLETED',
          completedAt: now,
        });
        await db.updateAppointment(currentServing.appointmentId, {
          status: 'COMPLETED',
        });
      }

      // 2. Find next eligible waiting token: lowest tokenNumber with status WAITING
      const waitingTokens = allTokens
        .filter(t => t.status === 'WAITING')
        .sort((a, b) => a.tokenNumber - b.tokenNumber);

      if (waitingTokens.length === 0) {
        throw new Error('NO_WAITING_TOKENS: There are no citizens currently waiting in this queue.');
      }

      const nextToken = waitingTokens[0];

      // 3. Mark next token as SERVING
      const updatedToken = await db.updateQueueToken(nextToken.id, {
        status: 'SERVING',
        calledAt: now,
      });

      // Update appointment status to IN_QUEUE / CALLED
      await db.updateAppointment(nextToken.appointmentId, {
        status: 'IN_QUEUE',
      });

      // Update queue's currentNumber
      await db.updateQueue(queue.id, {
        currentNumber: nextToken.tokenNumber,
      });

      // Notify citizen
      if (nextToken.appointment) {
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: nextToken.appointment.citizenId,
          appointmentId: nextToken.appointmentId,
          type: 'TOKEN_CALLED',
          title: `Token ${nextToken.tokenCode} Called!`,
          message: `Your token ${nextToken.tokenCode} is now being served. Please proceed to the service desk immediately.`,
          isRead: false,
          createdAt: now,
        });
      }

      // Audit log
      await db.createAuditLog({
        id: `audit-${Date.now()}`,
        userId: req.user!.id,
        action: 'CALL_NEXT',
        entityType: 'QUEUE_TOKEN',
        entityId: nextToken.id,
        metadata: {
          queueId: queue.id,
          tokenCode: nextToken.tokenCode,
          tokenNumber: nextToken.tokenNumber,
        },
        createdAt: now,
      });

      const updatedQueue = await db.getQueueById(queue.id);
      return {
        queue: updatedQueue,
        calledToken: updatedToken,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message?.startsWith('NO_WAITING_TOKENS')) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_WAITING_TOKENS', message: 'No citizens are currently waiting in this queue.' },
      });
      return;
    }
    next(err);
  }
});

// POST /api/queues/:id/recall
router.post('/:id/recall', authMiddleware, requireRole(['STAFF', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const queue = await db.getQueueById(req.params.id);
    if (!queue) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Queue not found.' },
      });
      return;
    }

    const allTokens = await db.getQueueTokens(queue.id);
    const serving = allTokens.find(t => t.status === 'SERVING' || t.status === 'CALLED');

    if (!serving) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_SERVING_TOKEN', message: 'There is no token currently being served to recall.' },
      });
      return;
    }

    const now = new Date().toISOString();

    await db.updateQueueToken(serving.id, {
      calledAt: now,
    });

    if (serving.appointment) {
      await db.createNotification({
        id: `notif-${Date.now()}`,
        userId: serving.appointment.citizenId,
        appointmentId: serving.appointmentId,
        type: 'TOKEN_CALLED',
        title: `Reminder: Token ${serving.tokenCode} Called Again`,
        message: `Your token ${serving.tokenCode} is being recalled. Please proceed to the service counter.`,
        isRead: false,
        createdAt: now,
      });
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'RECALL_TOKEN',
      entityType: 'QUEUE_TOKEN',
      entityId: serving.id,
      metadata: { tokenCode: serving.tokenCode },
      createdAt: now,
    });

    const refreshed = await db.getQueueTokenById(serving.id);

    res.json({
      success: true,
      data: {
        recalledToken: refreshed,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
