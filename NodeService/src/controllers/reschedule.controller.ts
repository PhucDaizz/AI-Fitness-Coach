import { Request, Response, NextFunction } from 'express';
import { rescheduleService } from '../services/reschedule.service';
import { rescheduleSchema } from '../validations/reschedule.valid';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * @openapi
 * /workout-plans/{id}/reschedule:
 *   post:
 *     tags: [Workout Plan]
 *     summary: Dời hoặc hoán đổi lịch tập trong plan
 *     description: |
 *       Hai chiến lược:
 *
 *       **SWAP** — hoán đổi 2 ngày tập với nhau. Exercises tự theo vì gắn với dayId.
 *       Dùng khi: cơ thể chưa phục hồi, muốn đổi thứ tự 2 buổi trong tuần.
 *
 *       **SHIFT** — dời 1 buổi về phía sau, đẩy domino toàn bộ chuỗi kế tiếp.
 *       Dùng khi: bận một ngày, muốn lùi toàn bộ lộ trình.
 *       targetDay phải sau currentDay. Plan tự mở rộng 1 buổi ở cuối chuỗi.
 *
 *       **Điều kiện chung**: cả 2 ngày phải chưa có WorkoutLog.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentDay, targetDay, strategy]
 *             properties:
 *               currentDay:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-24"
 *                 description: Ngày tập muốn dời (YYYY-MM-DD)
 *               targetDay:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-26"
 *                 description: Ngày tập muốn chuyển đến (YYYY-MM-DD)
 *               strategy:
 *                 type: string
 *                 enum: [SHIFT, SWAP]
 *                 description: SHIFT = dời + cascade, SWAP = hoán đổi
 *     responses:
 *       200:
 *         description: Dời lịch thành công — trả về danh sách WorkoutDay đã thay đổi
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
 *                         affected:
 *                           type: array
 *                           description: Các WorkoutDay đã được cập nhật
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               dayOfWeek:
 *                                 type: string
 *                               muscleFocus:
 *                                 type: string
 *                               scheduledDate:
 *                                 type: string
 *                                 format: date
 *       404:
 *         description: Không tìm thấy plan hoặc ngày tập
 *       409:
 *         description: Buổi tập đã được log — không thể dời
 *       422:
 *         description: Dữ liệu không hợp lệ hoặc SHIFT áp dụng sai chiều
 */
export async function rescheduleWorkoutDay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { id: planId } = req.params as { id: string };
    const dto = rescheduleSchema.parse(req.body);
    const data = await rescheduleService.reschedule(userId, planId, dto);
    sendSuccess(res, data, 'Dời lịch tập thành công');
  } catch (error) {
    next(error);
  }
}