import { Request, Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutrition.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

// ─── GET /nutrition/tdee ─────────────────────────────────────────────────────────
/**
 * @openapi
 * /nutrition/tdee:
 *   get:
 *     tags: [Nutrition]
 *     summary: Tính TDEE + macro split dựa trên UserProfile
 *     description: |
 *       Công thức: **Mifflin-St Jeor** × activity multiplier
 *
 *       Activity multiplier:
 *       - beginner: 1.375 (lightly active)
 *       - intermediate: 1.55 (moderately active)
 *       - advanced: 1.725 (very active)
 *       - outdoor +0.05 (trừ beginner)
 *
 *       Macro split theo fitnessGoal:
 *       - weight_loss: deficit 500 kcal, protein 2.0g/kg
 *       - muscle_gain: surplus 300 kcal, protein 2.2g/kg
 *       - endurance: maintenance, protein 1.4g/kg, carb cao
 *       - maintenance / flexibility / health: maintenance, protein 1.6g/kg
 *
 *       Yêu cầu đã có UserProfile (POST /profile).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: TDEE + macro split
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
 *                         bmr:
 *                           type: integer
 *                           example: 1750
 *                         tdee:
 *                           type: integer
 *                           example: 2713
 *                         activityMultiplier:
 *                           type: number
 *                           example: 1.55
 *                         targetCalories:
 *                           type: integer
 *                           example: 3013
 *                         macros:
 *                           type: object
 *                           properties:
 *                             protein:
 *                               type: object
 *                               properties:
 *                                 grams:
 *                                   type: integer
 *                                   example: 154
 *                                 calories:
 *                                   type: integer
 *                                   example: 616
 *                                 percentage:
 *                                   type: integer
 *                                   example: 20
 *                             carbs:
 *                               type: object
 *                               properties:
 *                                 grams:
 *                                   type: integer
 *                                   example: 350
 *                                 calories:
 *                                   type: integer
 *                                   example: 1400
 *                                 percentage:
 *                                   type: integer
 *                                   example: 47
 *                             fat:
 *                               type: object
 *                               properties:
 *                                 grams:
 *                                   type: integer
 *                                   example: 111
 *                                 calories:
 *                                   type: integer
 *                                   example: 999
 *                                 percentage:
 *                                   type: integer
 *                                   example: 33
 *                         metadata:
 *                           type: object
 *                           description: Thông tin profile dùng để tính
 *       404:
 *         description: Chưa có hồ sơ
 */
export async function getTdee(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthRequest).user.sub;
    const data = await nutritionService.getTdee(userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}