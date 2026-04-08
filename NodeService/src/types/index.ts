import { Request } from 'express';
import { Role } from '../constants';

// ─── JWT Payload (do .NET Auth Service tạo) ────────────────────────────────────
export interface JwtPayload {
  sub: string;       // user ID
  email: string;
  role: Role;
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