import { Router } from 'express';
import {
  createWorkoutPlan,
  listWorkoutPlans,
  getWorkoutPlanDays,
  getWorkoutPlanCalendar,
  updateWorkoutPlanStatus,
} from '../controllers/workout-plan.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */

// POST /workout-plans          — tạo plan mới từ .NET AI
router.post('/', createWorkoutPlan);

// GET  /workout-plans          — danh sách plan (mặc định active)
router.get('/', listWorkoutPlans);

// GET  /workout-plans/:id/days — chi tiết ngày tập + bài tập
router.get('/:id/days', getWorkoutPlanDays);

// GET  /workout-plans/:id/calendar — calendar view (completed/missed/upcoming)
router.get('/:id/calendar', getWorkoutPlanCalendar);

// PATCH /workout-plans/:id/status — update status
router.patch('/:id/status', updateWorkoutPlanStatus);

export default router;