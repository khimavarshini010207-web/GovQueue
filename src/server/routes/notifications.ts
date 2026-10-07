import { Router } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await db.getNotifications(req.user!.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await db.markNotificationRead(req.params.id, req.user!.id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Notification marked as read' },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const updatedCount = await db.markAllNotificationsRead(req.user!.id);
    res.json({
      success: true,
      data: { updatedCount },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
