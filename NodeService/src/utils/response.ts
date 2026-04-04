import { Response } from 'express';
import { HTTP_STATUS, MESSAGES } from '../constants';
import { ApiResponse, PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = MESSAGES.SUCCESS,
  statusCode = 200,
  pagination?: PaginationMeta,
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message: string = MESSAGES.CREATED): void {
  const body: ApiResponse<T> = { success: true, message, data };
  res.status(HTTP_STATUS.CREATED).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: string[],
): void {
  const body: ApiResponse = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
}

export function buildPagination(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}