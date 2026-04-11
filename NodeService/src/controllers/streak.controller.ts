import { Request, Response, NextFunction } from 'express';
import { streakService } from '../services/streak.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

// ─── GET /streak ─────────────────────────────────────────────────────────────────
/**
 * @openapi
 * /streak:
 *   get:
 *     tags: [Streak]
 *     summary: Lấy current streak và longest streak
 *     description: |
 *       **Lenient mode**: cho phép 1 ngày grace period.
 *       Streak chỉ bị reset nếu ngày tập gần nhất < hôm qua.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin streak
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
 *                         lastLoggedDate:
 *                           type: string
 *                           format: date
 *                           nullable: true
 *                           example: "2026-04-10"
 */
export async function getStreak(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await streakService.getStreak(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}