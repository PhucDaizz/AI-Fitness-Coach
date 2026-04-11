import { Router } from 'express';
import { getProfile, createProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */
router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', updateProfile);

export default router;