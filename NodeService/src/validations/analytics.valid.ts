import { z } from 'zod';

/**
 * Query params cho GET /analytics/heatmap
 * days: số ngày nhìn lại (default 365 — 1 năm)
 */
export const heatmapQuerySchema = z.object({
  days: z.coerce
    .number()
    .int('days phải là số nguyên')
    .min(7, 'days tối thiểu 7')
    .max(365, 'days tối đa 365')
    .default(365),
});

export type HeatmapQuery = z.infer<typeof heatmapQuerySchema>;