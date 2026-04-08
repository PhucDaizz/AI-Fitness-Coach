import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { createProfileSchema, updateProfileSchema } from '../validations/profile.valid';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';
import { MESSAGES } from '../constants';

const profileService = new ProfileService();

// ─── GET /profile ────────────────────────────────────────────────────────────────
/**
 * @openapi
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Lấy hồ sơ người dùng hiện tại
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Hồ sơ người dùng kèm ngày rảnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Chưa có hồ sơ
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await profileService.getProfile(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── POST /profile ───────────────────────────────────────────────────────────────
/**
 * @openapi
 * /profile:
 *   post:
 *     tags: [Profile]
 *     summary: Tạo hồ sơ lần đầu (onboarding 4 bước)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gender
 *               - dateOfBirth
 *               - weightKg
 *               - heightCm
 *               - environment
 *               - fitnessGoal
 *               - fitnessLevel
 *               - availableDays
 *             properties:
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-08-15"
 *               weightKg:
 *                 type: number
 *                 example: 70
 *               heightCm:
 *                 type: number
 *                 example: 175
 *               environment:
 *                 type: string
 *                 enum: [gym, home, outdoor]
 *               fitnessGoal:
 *                 type: string
 *                 enum: [weight_loss, muscle_gain, endurance, flexibility, maintenance]
 *               fitnessLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               sessionMinutes:
 *                 type: integer
 *                 example: 60
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Dumbbell", "Pull-up bar"]
 *               injuries:
 *                 type: string
 *                 example: "Đau đầu gối trái"
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 example: ["Monday", "Wednesday", "Friday"]
 *     responses:
 *       201:
 *         description: Tạo hồ sơ thành công
 *       409:
 *         description: Hồ sơ đã tồn tại
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
export async function createProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    // Zod parse — nếu lỗi sẽ throw ZodError → errorHandler bắt tự động
    const dto = createProfileSchema.parse(req.body);
    const data = await profileService.createProfile(userId, dto);
    sendCreated(res, data, 'Tạo hồ sơ thành công');
  } catch (error) {
    next(error);
  }
}

// ─── PUT /profile ────────────────────────────────────────────────────────────────
/**
 * @openapi
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Cập nhật hồ sơ người dùng (partial update)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Gửi bất kỳ field nào cần cập nhật
 *             properties:
 *               weightKg:
 *                 type: number
 *               heightCm:
 *                 type: number
 *               fitnessGoal:
 *                 type: string
 *                 enum: [weight_loss, muscle_gain, endurance, flexibility, maintenance]
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Chưa có hồ sơ
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const dto = updateProfileSchema.parse(req.body);
    const data = await profileService.updateProfile(userId, dto);
    sendSuccess(res, data, MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
}