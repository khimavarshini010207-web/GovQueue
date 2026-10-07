import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import type { UserRole, SafeUser } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'govqueue_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export function signToken(user: SafeUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Try Cookie
    let token = req.cookies?.token;

    // 2. Try Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const user = await db.getUserById(decoded.id);

    if (user) {
      const { passwordHash: _, ...safeUser } = user;
      req.user = safeUser;
    }
    next();
  } catch (err) {
    // Invalid token, continue without user
    next();
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'You must be signed in to perform this action.',
      },
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be signed in to perform this action.',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}].`,
        },
      });
      return;
    }

    next();
  };
}
