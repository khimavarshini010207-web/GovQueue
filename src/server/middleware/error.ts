import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const issues = err.issues || [];
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
    });
    return;
  }

  const errorObj = err as { status?: number; statusCode?: number; message?: string; code?: string };
  const statusCode = errorObj.status || errorObj.statusCode || 500;
  const message = errorObj.message || 'An unexpected internal error occurred.';
  const code = errorObj.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
