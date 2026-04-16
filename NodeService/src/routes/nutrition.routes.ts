import { Router } from 'express';
import { getTdee } from '../controllers/nutrition.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */

// GET /nutrition/tdee — tính TDEE + macro split từ UserProfile
router.get('/tdee', getTdee);

export default router;