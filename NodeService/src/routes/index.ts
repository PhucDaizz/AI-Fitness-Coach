import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

import profileRoutes from './profile.routes';
import workoutPlanRoutes from './workout-plan.routes';
import workoutLogRoutes from './workout-log.routes';
import streakRoutes from './streak.routes';
import analyticsRoutes from './analytics.routes';
import nutritionRoutes from './nutrition.routes';

const router = Router();

// ─── Tất cả routes bên dưới đều yêu cầu JWT ────────────────────────────────────
router.use(authenticate);

// ─── Phase 2 ────────────────────────────────────────────────────────────────────
router.use('/profile', profileRoutes);

// ─── Phase 2 (sau khi Exercise model sẵn sàng) ──────────────────────────────────
// router.use('/exercises', exerciseRoutes);

// ─── Phase 3 ────────────────────────────────────────────────────────────────────
router.use('/workout-plans', workoutPlanRoutes);
router.use('/workout-logs', workoutLogRoutes);
router.use('/streak', streakRoutes);

// ─── Phase 4 ────────────────────────────────────────────────────────────────────
router.use('/analytics', analyticsRoutes);
router.use('/nutrition', nutritionRoutes);

// ─── Phase 5 ────────────────────────────────────────────────────────────────────
// router.use('/chat', chatRoutes);

export default router;