import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isDev } from '../config/env';
import { HTTP_STATUS, MESSAGES } from '@/constants';

// ─── Custom AppError ────────────────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public errors?: string[],
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 404 handler — mount trước error handler ────────────────────────────────────
export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} không tồn tại`,
  });
}

// ─── Centralized error handler ──────────────────────────────────────────────────
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // 1. Zod validation error
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => `[${e.path.join('.')}] ${e.message}`);
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      errors,
    });
    return;
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // 3. Mongoose validation error
  if (err instanceof Error && err.name === 'ValidationError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      errors: [err.message],
    });
    return;
  }

  // 4. MongoDB duplicate key
  if (err instanceof Error && (err as NodeJS.ErrnoException).code === '11000') {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Dữ liệu đã tồn tại',
    });
    return;
  }

  // 5. Generic / unknown error
  console.error('🔥  Unhandled error:', err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: MESSAGES.SERVER_ERROR,
    // Chỉ trả về stack trace khi development
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
}