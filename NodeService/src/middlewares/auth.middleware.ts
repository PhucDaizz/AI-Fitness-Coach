import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HTTP_STATUS, MESSAGES, ROLES } from '../constants';
import { AuthRequest, JwtPayload, RawDotNetClaims } from '../types';

// ─── Tên claim URI của .NET Identity ───────────────────────────────────────────
const CLAIM_NAME_IDENTIFIER =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_EMAIL =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const CLAIM_ROLE =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// ─── Map .NET role string → Role của NodeService ───────────────────────────────
// .NET AuthService dùng "Customer" / "Admin",
// NodeService dùng "user" / "admin"
function mapRole(dotNetRole: string): JwtPayload['role'] {
  if (dotNetRole?.toLowerCase() === 'admin') return ROLES.ADMIN;
  return ROLES.USER; // "Customer" và mọi giá trị khác → "user"
}

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
    // verify() xác nhận chữ ký + hạn token
    const raw = jwt.verify(token, env.JWT_SECRET) as RawDotNetClaims;

    // Map sang JwtPayload chuẩn của NodeService
    const payload: JwtPayload = {
      sub:   raw[CLAIM_NAME_IDENTIFIER],
      email: raw[CLAIM_EMAIL],
      role:  mapRole(raw[CLAIM_ROLE]),
      exp:   raw.exp,
    };

    (req as AuthRequest).user = payload;
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