import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getProfile, createProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

// ─── Tất cả profile routes đều yêu cầu JWT ─────────────────────────────────────
router.use(authenticate);

router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', updateProfile);

export default router;