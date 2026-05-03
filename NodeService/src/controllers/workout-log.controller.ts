import { Request, Response, NextFunction } from 'express';
import { workoutLogService, LogStatusResult } from '../services/workout-log.service';
import {
  createWorkoutLogSchema,
  listWorkoutLogsQuerySchema,
} from '../validations/workout-log.valid';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

// ─── POST /workout-logs ──────────────────────────────────────────────────────────
/**
 * @openapi
 * /workout-logs:
 *   post:
 *     tags: [Workout Log]
 *     summary: Log một buổi tập kèm chi tiết từng bài
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId, dayId, loggedDate, exercises]
 *             properties:
 *               planId:
 *                 type: string
 *               dayId:
 *                 type: string
 *               loggedDate:
 *                 type: string
 *                 format: date
 *               durationMinutes:
 *                 type: integer
 *               difficultyFeedback:
 *                 type: string
 *                 enum: [easy, ok, hard]
 *               notes:
 *                 type: string
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Log thành công
 *       400:
 *         description: dayId không hợp lệ
 *       404:
 *         description: Không tìm thấy plan
 *       409:
 *         description: Đã log ngày này rồi
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
export async function createWorkoutLog(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const dto = createWorkoutLogSchema.parse(req.body);
    const data = await workoutLogService.createLog(userId, dto);
    sendCreated(res, data, 'Log buổi tập thành công');
  } catch (error) {
    next(error);
  }
}

// ─── GET /workout-logs ───────────────────────────────────────────────────────────
/**
 * @openapi
 * /workout-logs:
 *   get:
 *     tags: [Workout Log]
 *     summary: Lịch sử tập — filter theo tuần hoặc tháng
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         description: Bất kỳ ngày nào trong tuần cần xem (YYYY-MM-DD). Mặc định tuần hiện tại.
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: month
 *         description: Tháng cần xem (YYYY-MM). Không dùng cùng week.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách log có phân trang
 *       422:
 *         description: Không được truyền cả week và month
 */
export async function listWorkoutLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const query = listWorkoutLogsQuerySchema.parse(req.query);
    const { logs, pagination } = await workoutLogService.listLogs(userId, query);
    sendSuccess(res, logs, 'Lấy lịch sử buổi tập thành công', 200, pagination);
  } catch (error) {
    next(error);
  }
}

// ─── GET /workout-plans/{planId}/days/{dayId}/log-status ─────────────────────────
/**
 * @openapi
 * /workout-plans/{planId}/days/{dayId}/log-status:
 *   get:
 *     tags: [Workout Log]
 *     summary: Kiểm tra user đã log buổi tập của day này chưa
 *     description: |
 *       Trả về `isLogged: true/false` kèm thông tin log nếu đã tập.
 *       Dùng để FE hiển thị trạng thái nút "Log buổi tập" / "Đã tập".
 *       Không quan tâm user log bằng cách nào (manual hay quick-log).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: dayId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái log của buổi tập
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
 *                         isLogged:
 *                           type: boolean
 *                           example: true
 *                         log:
 *                           nullable: true
 *                           type: object
 *                           properties:
 *                             logId:
 *                               type: string
 *                             loggedDate:
 *                               type: string
 *                               format: date
 *                             difficultyFeedback:
 *                               type: string
 *                               nullable: true
 *                               enum: [easy, ok, hard]
 *                             durationMinutes:
 *                               type: integer
 *                               nullable: true
 *       400:
 *         description: dayId không thuộc plan này
 *       403:
 *         description: Không có quyền truy cập plan
 *       404:
 *         description: Không tìm thấy plan
 */
export async function checkDayLogStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { planId, dayId } = req.params as { planId: string; dayId: string };
    const data = await workoutLogService.checkLogStatus(userId, planId, dayId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}