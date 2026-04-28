import { Router } from 'express';
import { 
    getProfile, 
    createProfile, 
    updateProfile, 
    checkProfileExists, 
    updateAvailableDays
} from '../controllers/profile.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */
router.get('/exists', checkProfileExists);
router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', updateProfile);
router.patch('/available-days', updateAvailableDays);

export default router;