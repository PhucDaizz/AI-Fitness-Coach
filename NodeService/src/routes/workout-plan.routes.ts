import { Router } from 'express';
import {
  createWorkoutPlan,
  listWorkoutPlans,
  getWorkoutPlanDays,
  getWorkoutPlanCalendar,
  updateWorkoutPlanStatus,
  completeWorkoutDay,
  deleteWorkoutPlan,
} from '../controllers/workout-plan.controller';
import { rescheduleWorkoutDay } from '../controllers/reschedule.controller';
import { checkDayLogStatus } from '../controllers/workout-log.controller';

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

// POST /workout-plans/:id/reschedule    — dời / hoán đổi lịch tập
router.post('/:id/reschedule', rescheduleWorkoutDay);

// POST /workout-plans/:planId/days/:dayId/complete — quick-log cả ngày 1 lượt
router.post('/:planId/days/:dayId/complete', completeWorkoutDay);

// GET /workout-plans/:planId/days/:dayId/log-status — check đã log chưa
router.get('/:planId/days/:dayId/log-status', checkDayLogStatus);

// DELETE /workout-plans/:id — xóa plan
router.delete('/:id', deleteWorkoutPlan);

export default router;