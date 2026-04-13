import { Request } from 'express';
import { Role } from '../constants';

// ─── Raw claims do .NET Identity phát hành trong JWT ───────────────────────────
// .NET dùng URI dài thay vì tên ngắn như "sub" / "email" / "role"
export interface RawDotNetClaims {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;  // userId
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;    // email
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;          // "Customer" | "Admin"
  exp?: number;
  iss?: string;
  aud?: string;
}

// ─── JWT Payload (normalized — dùng trong toàn bộ NodeService) ─────────────────
// Middleware auth.middleware.ts sẽ map RawDotNetClaims → JwtPayload
export interface JwtPayload {
  sub: string;       // user ID (từ nameidentifier)
  email: string;     // email
  role: Role;        // đã map: "Customer" → "user", "Admin" → "admin"
  iat?: number;
  exp?: number;
}

// ─── Custom Express Request với user đã xác thực ───────────────────────────────
export interface AuthRequest extends Request {
  user: JwtPayload;
}

// ─── Standard API Response ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationMeta;
}

// ─── Pagination ─────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── RabbitMQ Event Payloads ────────────────────────────────────────────────────
export interface PlanGeneratedEvent {
  userId: string;
  planId: string;
  planData: Record<string, unknown>;
}

export interface PlanAdjustedEvent {
  userId: string;
  planId: string;
  changes: Record<string, unknown>;
}