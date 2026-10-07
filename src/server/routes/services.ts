import { Router } from 'express';
import { db } from '../db/database.js';
import { createServiceSchema, updateServiceSchema } from '../../shared/schemas.js';
import { authMiddleware, requireAuth, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { Service } from '../../shared/types.js';

const router = Router();

// GET /api/services
router.get('/', async (req, res, next) => {
  try {
    const { search, category, department, activeOnly, sort } = req.query;

    let services = await db.getServices();

    if (activeOnly !== 'false') {
      services = services.filter(s => s.isActive);
    }

    if (category && typeof category === 'string' && category !== 'All') {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (department && typeof department === 'string' && department !== 'All') {
      services = services.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      services = services.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    if (sort === 'duration-asc') {
      services.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    } else if (sort === 'duration-desc') {
      services.sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);
    } else {
      services.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res, next) => {
  try {
    const service = await db.getServiceById(req.params.id);
    if (!service) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found.' },
      });
      return;
    }

    // Attach service centers where this service is available
    const centers = await db.getCenters();
    const activeCenters = centers.filter(c => c.isActive);

    res.json({
      success: true,
      data: {
        ...service,
        availableCenters: activeCenters,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/services (Admin only)
router.post('/', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const now = new Date().toISOString();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newService: Service = {
      id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      department: data.department,
      estimatedMinutes: data.estimatedMinutes,
      requiredDocuments: data.requiredDocuments,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    };

    await db.createService(newService);

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'CREATE_SERVICE',
      entityType: 'SERVICE',
      entityId: newService.id,
      metadata: { name: newService.name },
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      data: newService,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/services/:id (Admin only)
router.patch('/:id', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateServiceSchema.parse(req.body);
    const updated = await db.updateService(req.params.id, data);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found.' },
      });
      return;
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'UPDATE_SERVICE',
      entityType: 'SERVICE',
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

// DELETE /api/services/:id (Admin only - soft delete / deactivation)
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await db.deleteService(req.params.id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found.' },
      });
      return;
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user!.id,
      action: 'DELETE_SERVICE',
      entityType: 'SERVICE',
      entityId: req.params.id,
      metadata: { action: 'deactivated' },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: { message: 'Service deactivated successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
