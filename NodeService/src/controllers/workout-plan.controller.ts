import { Request, Response, NextFunction } from "express";
import { workoutPlanService } from "../services/workout-plan.service";
import {
  createWorkoutPlanSchema,
  updatePlanStatusSchema,
  listWorkoutPlansQuerySchema,
} from "../validations/workout-plan.valid";
import { sendSuccess, sendCreated } from "../utils/response";
import { AuthRequest } from "../types";

// ─── POST /workout-plans ─────────────────────────────────────────────────────────
/**
 * @openapi
 * /workout-plans:
 *   post:
 *     tags: [Workout Plan]
 *     summary: Nhận plan JSON từ .NET AI và lưu vào MongoDB
 *     description: |
 *       Tạo mới một workout plan. Nếu user đã có plan active,
 *       plan cũ sẽ tự động được archive.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, planType, weekNumber, aiModelUsed, startsAt, days]
 *             properties:
 *               title:
 *                 type: string
 *               planType:
 *                 type: string
 *                 enum: [weekly, monthly]
 *               weekNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *               aiModelUsed:
 *                 type: string
 *               startsAt:
 *                 type: string
 *                 format: date
 *               days:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Tạo plan thành công
 *       409:
 *         description: Conflict (xử lý nội bộ — tự archive plan cũ)
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
export async function createWorkoutPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const dto = createWorkoutPlanSchema.parse(req.body);
    const data = await workoutPlanService.createPlan(userId, dto);
    sendCreated(res, data, "Tạo workout plan thành công");
  } catch (error) {
    next(error);
  }
}

// ─── GET /workout-plans ──────────────────────────────────────────────────────────
/**
 * @openapi
 * /workout-plans:
 *   get:
 *     tags: [Workout Plan]
 *     summary: Lấy danh sách plan của user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách plan có phân trang
 */
export async function listWorkoutPlans(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const query = listWorkoutPlansQuerySchema.parse(req.query);
    const { plans, pagination } = await workoutPlanService.listPlans(
      userId,
      query,
    );
    sendSuccess(
      res,
      plans,
      "Lấy danh sách workout plan thành công",
      200,
      pagination,
    );
  } catch (error) {
    next(error);
  }
}

// ─── GET /workout-plans/:id/days ─────────────────────────────────────────────────
/**
 * @openapi
 * /workout-plans/{id}/days:
 *   get:
 *     tags: [Workout Plan]
 *     summary: Chi tiết từng ngày tập kèm danh sách bài tập
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ngày tập kèm bài tập
 *       404:
 *         description: Không tìm thấy plan
 */
export async function getWorkoutPlanDays(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { id } = req.params as { id: string };
    const data = await workoutPlanService.getPlanDays(userId, id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── GET /workout-plans/:id/calendar ────────────────────────────────────────────
/**
 * @openapi
 * /workout-plans/{id}/calendar:
 *   get:
 *     tags: [Workout Plan]
 *     summary: Calendar view — trạng thái từng ngày tập
 *     description: Trả về completed / missed / upcoming cho từng ngày trong plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ngày kèm status
 */
export async function getWorkoutPlanCalendar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { id } = req.params as { id: string };
    const data = await workoutPlanService.getPlanCalendar(userId, id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── PATCH /workout-plans/:id/status ────────────────────────────────────────────
/**
 * @openapi
 * /workout-plans/{id}/status:
 *   patch:
 *     tags: [Workout Plan]
 *     summary: Cập nhật status của plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, archived]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy plan
 *       409:
 *         description: Đã có plan active khác
 */
export async function updateWorkoutPlanStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const { id } = req.params as { id: string };
    const dto = updatePlanStatusSchema.parse(req.body);
    const data = await workoutPlanService.updateStatus(userId, id, dto);
    sendSuccess(res, data, "Cập nhật status thành công");
  } catch (error) {
    next(error);
  }
}
