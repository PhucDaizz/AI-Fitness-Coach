import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

import profileRoutes from './profile.routes';
import workoutPlanRoutes from './workout-plan.routes';
import workoutLogRoutes from './workout-log.routes';
import streakRoutes from './streak.routes';

const router = Router();

// ─── Tất cả routes bên dưới đều yêu cầu JWT ────────────────────────────────────
router.use(authenticate);

// ─── Domain routes ──────────────────────────────────────────────────────────────
router.use('/profile', profileRoutes);
router.use('/workout-plans', workoutPlanRoutes);
router.use('/workout-logs', workoutLogRoutes);
router.use('/streak', streakRoutes);

// Phase 2: exercise routes sẽ mount ở đây
// router.use('/exercises', exerciseRoutes);

// Phase 4: nutrition, analytics, chat routes sẽ mount ở đây
// router.use('/nutrition', nutritionRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/chat', chatRoutes);

export default router;