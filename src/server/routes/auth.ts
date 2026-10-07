import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../../shared/schemas.js';
import { signToken, authMiddleware, requireAuth } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { User, SafeUser } from '../../shared/types.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await db.getUserByEmail(data.email);

    if (existing) {
      res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: 'CITIZEN',
      createdAt: now,
      updatedAt: now,
    };

    await db.createUser(newUser);

    // Audit log
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: newUser.id,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: newUser.id,
      metadata: { email: newUser.email, role: newUser.role },
      createdAt: now,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    const token = signToken(safeUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await db.getUserByEmail(data.email);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken(safeUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Audit log
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/internal-login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await db.getUserByEmail(data.email);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid administrative credentials.',
        },
      });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid administrative credentials.',
        },
      });
      return;
    }

    // Role check: Citizen accounts are strictly blocked from internal portal
    if (user.role === 'CITIZEN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INTERNAL_ACCESS',
          message: 'Access Denied: Citizen accounts are not authorized to access internal administrative portals. Please use the citizen portal.',
        },
      });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken(safeUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: 'INTERNAL_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    data: { message: 'Successfully signed out' },
  });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.json({
      success: true,
      data: { user: null },
    });
    return;
  }

  res.json({
    success: true,
    data: { user: req.user },
  });
});

router.patch('/profile', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updated = await db.updateUser(req.user!.id, {
      fullName: data.fullName,
      phone: data.phone,
    });

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({
      success: true,
      data: { user: safeUser },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
