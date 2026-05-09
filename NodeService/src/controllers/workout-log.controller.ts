import { Request, Response, NextFunction } from 'express';
import { workoutLogService, LogStatusResult, ListLogResult } from '../services/workout-log.service';
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
 *     summary: Lấy lịch sử buổi tập
 *     description: |
 *       **Hai mode hoạt động — chỉ dùng 1 trong 2:**
 *
 *       **[1] planId mode** — truyền `planId`:
 *       - Trả về TOÀN BỘ log của plan đó, không phân trang
 *       - Sort theo `loggedDate` tăng dần (cũ → mới)
 *       - Validate plan thuộc user hiện tại
 *       - Response **không có** `pagination` field
 *       - Không được dùng cùng `week` hoặc `month`
 *
 *       **[2] date mode** — truyền `week` hoặc `month` (hoặc không truyền gì):
 *       - Filter theo tuần (`week`) hoặc tháng (`month`)
 *       - Mặc định tuần hiện tại nếu không truyền tham số nào
 *       - Có phân trang (`page` / `limit`)
 *       - Response **có** `pagination` field
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: planId
 *         description: |
 *           ID của workout plan. Trả về toàn bộ log của plan đó.
 *           Không dùng cùng week hoặc month.
 *         schema:
 *           type: string
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
 *         description: |
 *           Danh sách log.
 *           - planId mode: không có `pagination`
 *           - date mode: có `pagination`
 *       403:
 *         description: Plan không thuộc user
 *       404:
 *         description: Không tìm thấy plan (khi dùng planId mode)
 *       422:
 *         description: Dùng planId cùng week/month, hoặc dùng cả week lẫn month
 */
export async function listWorkoutLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const query = listWorkoutLogsQuerySchema.parse(req.query);
    const result: ListLogResult = await workoutLogService.listLogs(userId, query);
    
    if (result.mode === 'plan') {
      // planId mode: trả về toàn bộ log, không có pagination
      sendSuccess(res, result.logs, 'Lấy lịch sử buổi tập thành công', 200);
    } else {
      // date mode: có pagination
      sendSuccess(res, result.logs, 'Lấy lịch sử buổi tập thành công', 200, result.pagination);
    }
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