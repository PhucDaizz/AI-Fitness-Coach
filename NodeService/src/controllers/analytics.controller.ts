import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { heatmapQuerySchema } from '../validations/analytics.valid';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

// ─── GET /analytics/summary ──────────────────────────────────────────────────────
/**
 * @openapi
 * /analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: 4 metric tổng quan — streak, buổi tập tuần này, tổng volume, completion rate
 *     description: |
 *       Tính realtime từ WorkoutLog.
 *       - currentStreak / longestStreak: tái dùng logic Phase 3
 *       - sessionsThisWeek: đếm WorkoutLog từ thứ Hai tuần hiện tại
 *       - totalVolumeKg: tổng volume = sets × reps × weight (kg)
 *       - completionRate: log / days trong plan active (0 nếu không có plan)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         currentStreak:
 *                           type: integer
 *                           example: 5
 *                         longestStreak:
 *                           type: integer
 *                           example: 12
 *                         sessionsThisWeek:
 *                           type: integer
 *                           example: 3
 *                         totalVolumeKg:
 *                           type: number
 *                           example: 12450
 *                         completionRate:
 *                           type: integer
 *                           example: 75
 *                         activePlanId:
 *                           type: string
 *                           nullable: true
 */
export async function getSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await analyticsService.getSummary(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── GET /analytics/weekly ───────────────────────────────────────────────────────
/**
 * @openapi
 * /analytics/weekly:
 *   get:
 *     tags: [Analytics]
 *     summary: Số buổi tập trong 4 tuần gần nhất (data cho line chart)
 *     description: |
 *       Trả về mảng 4 phần tử, thứ tự từ tuần cũ nhất đến tuần hiện tại.
 *       weekLabel: "W1"…"W4" — FE dùng làm X-axis.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly session counts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           weekStart:
 *                             type: string
 *                             format: date
 *                             example: "2026-04-07"
 *                           weekEnd:
 *                             type: string
 *                             format: date
 *                             example: "2026-04-13"
 *                           weekLabel:
 *                             type: string
 *                             example: "W4"
 *                           sessions:
 *                             type: integer
 *                             example: 4
 */
export async function getWeeklySessions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await analyticsService.getWeeklySessions(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── GET /analytics/muscle-volume ───────────────────────────────────────────────
/**
 * @openapi
 * /analytics/muscle-volume:
 *   get:
 *     tags: [Analytics]
 *     summary: Tổng volume theo nhóm cơ (data cho bar chart)
 *     description: |
 *       volume = weightKg × sum(reps)
 *       Bỏ qua bodyweight exercise (không có weightKg).
 *       Sort theo totalVolume giảm dần — nhóm cơ tập nhiều nhất lên đầu.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Volume by muscle group
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           muscleGroup:
 *                             type: string
 *                             example: "Quadriceps"
 *                           totalVolume:
 *                             type: number
 *                             example: 3200.5
 */
export async function getMuscleVolume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await analyticsService.getMuscleVolume(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── GET /analytics/heatmap ──────────────────────────────────────────────────────
/**
 * @openapi
 * /analytics/heatmap:
 *   get:
 *     tags: [Analytics]
 *     summary: Dữ liệu heatmap theo ngày tập (kiểu GitHub contribution)
 *     description: |
 *       Mỗi entry là 1 ngày có ít nhất 1 buổi tập.
 *       Ngày không tập không xuất hiện trong mảng (FE xử lý = 0).
 *       count = số WorkoutLog trong ngày đó.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 7
 *           maximum: 365
 *           default: 365
 *         description: Số ngày nhìn lại (mặc định 365 — 1 năm)
 *     responses:
 *       200:
 *         description: Heatmap data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2026-04-10"
 *                           count:
 *                             type: integer
 *                             example: 1
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
export async function getHeatmap(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { days } = heatmapQuerySchema.parse(req.query);
    const data = await analyticsService.getHeatmap(userId, days);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}