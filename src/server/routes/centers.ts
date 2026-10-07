import { Router } from 'express';
import { db } from '../db/database.js';
import { createCenterSchema, updateCenterSchema } from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { ServiceCenter } from '../../shared/types.js';

const router = Router();

// GET /api/centers
router.get('/', async (req, res, next) => {
  try {
    const { district, state } = req.query;
    let centers = await db.getCenters();

    if (district && typeof district === 'string') {
      centers = centers.filter(c => c.district.toLowerCase() === district.toLowerCase());
    }

    if (state && typeof state === 'string') {
      centers = centers.filter(c => c.state.toLowerCase() === state.toLowerCase());
    }

    // Attach operating hours and counters
    const allOperatingHours = await db.getOperatingHours();
    const allCounters = await db.getCounters();

    const enriched = centers.map(c => ({
      ...c,
      operatingHours: allOperatingHours.filter(o => o.centerId === c.id),
      countersCount: allCounters.filter(counter => counter.centerId === c.id && counter.isActive).length,
    }));

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/centers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const center = await db.getCenterById(req.params.id);
    if (!center) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service center not found.' },
      });
      return;
    }

    const operatingHours = await db.getOperatingHours(center.id);
    const counters = await db.getCounters(center.id);
    const services = (await db.getServices()).filter(s => s.isActive);

    res.json({
      success: true,
      data: {
        ...center,
        operatingHours,
        counters,
        availableServices: services,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/centers (Admin only)
router.post('/', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createCenterSchema.parse(req.body);
    const now = new Date().toISOString();

    const newCenter: ServiceCenter = {
      id: `center-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      code: data.code,
      address: data.address,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    };

    await db.createCenter(newCenter);

    // Setup default operating hours (Mon-Sat 09:00 - 17:00)
    for (let day = 0; day <= 6; day++) {
      await db.createOperatingHour({
        id: `op-${newCenter.id}-${day}`,
        centerId: newCenter.id,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '17:00',
        isClosed: day === 0,
      });
    }

    // Default counters
    for (let i = 1; i <= 3; i++) {
      await db.createCounter({
        id: `counter-${newCenter.id}-${i}`,
        centerId: newCenter.id,
        name: `Counter ${i}`,
        counterNumber: i,
        isActive: true,
      });
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'CREATE_CENTER',
      entityType: 'SERVICE_CENTER',
      entityId: newCenter.id,
      metadata: { name: newCenter.name, code: newCenter.code },
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      data: newCenter,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/centers/:id (Admin only)
router.patch('/:id', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateCenterSchema.parse(req.body);
    const updated = await db.updateCenter(req.params.id, data);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service center not found.' },
      });
      return;
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'UPDATE_CENTER',
      entityType: 'SERVICE_CENTER',
      entityId: updated.id,
      metadata: data,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/centers/:id (Admin only)
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await db.deleteCenter(req.params.id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service center not found.' },
      });
      return;
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'DELETE_CENTER',
      entityType: 'SERVICE_CENTER',
      entityId: req.params.id,
      metadata: { action: 'deactivated' },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: { message: 'Service center deactivated successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
