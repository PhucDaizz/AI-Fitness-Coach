import { z } from 'zod';
import { DAY_OF_WEEK, PLAN_STATUS } from '../constants';

const toEnum = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [string, ...string[]];

// ─── ExerciseInDay (lồng trong WorkoutDay) ──────────────────────────────────────

const exerciseInDaySchema = z.object({
  exerciseId: z.coerce.string().min(1, 'exerciseId không được để trống'),
  sets: z.number().int().min(1, 'sets tối thiểu 1'),
  reps: z.string().min(1, 'reps không được để trống'),   // "8-12" hoặc "10"
  restSeconds: z.number().int().min(0).default(60),
  notes: z.string().nullish(),
  orderIndex: z.number().int().min(1, 'orderIndex tối thiểu 1'),
});

// ─── WorkoutDay (lồng trong WorkoutPlan) ────────────────────────────────────────

const workoutDaySchema = z.object({
  dayOfWeek: z.enum(toEnum(DAY_OF_WEEK), {
    message: `dayOfWeek phải là: ${Object.values(DAY_OF_WEEK).join(', ')}`,
  }),
  muscleFocus: z.string().min(1, 'muscleFocus không được để trống'),
  orderIndex: z.number().int().min(1, 'orderIndex tối thiểu 1'),
  scheduledDate: z.coerce.date({ message: 'scheduleDate phải là ngày hợp lệ (YYYY-MM-DD)' }).optional(),
  exercises: z
    .array(exerciseInDaySchema)
    .min(1, 'Mỗi ngày cần ít nhất 1 bài tập'),
});

// ─── POST /workout-plans ─────────────────────────────────────────────────────────

export const createWorkoutPlanSchema = z.object({
  title: z.string().min(1, 'title không được để trống').trim(),
  planType: z.enum(['weekly', 'monthly'], {
    message: 'planType phải là: weekly, monthly',
  }),
  weekNumber: z
    .number()
    .int()
    .min(1, 'weekNumber tối thiểu 1')
    .max(4, 'weekNumber tối đa 4'),
  aiModelUsed: z.string().min(1, 'aiModelUsed không được để trống').trim(),
  startsAt: z.coerce.date({ message: 'startsAt phải là ngày hợp lệ' }),
  days: z
    .array(workoutDaySchema)
    .min(1, 'Plan cần ít nhất 1 ngày tập'),
});

// ─── PATCH /workout-plans/:id/status ────────────────────────────────────────────

export const updatePlanStatusSchema = z.object({
  status: z.enum(toEnum(PLAN_STATUS), {
    message: `status phải là: ${Object.values(PLAN_STATUS).join(', ')}`,
  }),
});

// ─── Query params GET /workout-plans ────────────────────────────────────────────

export const listWorkoutPlansQuerySchema = z.object({
  status: z.enum(toEnum(PLAN_STATUS)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const completeDaySchema = z.object({
  loggedDate: z.coerce
    .date({ message: 'loggedDate phải là ngày hợp lệ (YYYY-MM-DD)' })
    .optional(),
  difficultyFeedback: z
    .enum(['easy', 'ok', 'hard'], {
      message: 'difficultyFeedback phải là: easy, ok, hard',
    })
    .optional(),
  notes: z.string().optional(),
})

// ─── TypeScript types ────────────────────────────────────────────────────────────

export type CreateWorkoutPlanDto = z.infer<typeof createWorkoutPlanSchema>;
export type UpdatePlanStatusDto = z.infer<typeof updatePlanStatusSchema>;
export type ListWorkoutPlansQuery = z.infer<typeof listWorkoutPlansQuerySchema>;
export type CompleteDayDto = z.infer<typeof completeDaySchema>;
