import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HTTP_STATUS, MESSAGES, ROLES } from '../constants';
import { AuthRequest, JwtPayload } from '@/types';

// ─── Middleware xác thực JWT ────────────────────────────────────────────────────
// Token được ký bởi .NET Auth Service, Node.js chỉ verify bằng JWT_SECRET chung
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? 'Token đã hết hạn — vui lòng đăng nhập lại'
        : 'Token không hợp lệ';

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message,
    });
  }
}

// ─── Middleware phân quyền theo role (RBAC) ─────────────────────────────────────
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;

    if (!user || !roles.includes(user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
      return;
    }

    next();
  };
}

// ─── Shortcut: chỉ admin ────────────────────────────────────────────────────────
export const adminOnly = authorize(ROLES.ADMIN);