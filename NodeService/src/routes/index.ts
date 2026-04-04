import { Router, Request, Response } from 'express';

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Healthcheck
 *     security: []
 *     responses:
 *       200:
 *         description: Service đang hoạt động bình thường
 */
const router = Router();

// ─── Health check (không cần auth) ─────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI Fitness Coach — Node.js Service đang hoạt động',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Mount các route module (sẽ thêm dần theo từng Phase) ─────────────────────
// Phase 2
// router.use('/profile', profileRoutes);
// router.use('/exercises', exerciseRoutes);

// Phase 3
// router.use('/workout-plans', workoutPlanRoutes);
// router.use('/workout-logs', workoutLogRoutes);
// router.use('/streak', streakRoutes);

// Phase 4
// router.use('/nutrition', nutritionRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/chat', chatRoutes);

export default router;