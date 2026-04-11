import { Router } from 'express';
import { getStreak } from '../controllers/streak.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */

// GET /streak — current streak + longest streak
router.get('/', getStreak);

export default router;