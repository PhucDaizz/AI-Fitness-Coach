import { Router } from 'express';
import {
  createWorkoutLog,
  listWorkoutLogs,
} from '../controllers/workout-log.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */

// POST /workout-logs  — log buổi tập
router.post('/', createWorkoutLog);

// GET  /workout-logs  — lịch sử tập (filter theo tuần/tháng)
router.get('/', listWorkoutLogs);

export default router;