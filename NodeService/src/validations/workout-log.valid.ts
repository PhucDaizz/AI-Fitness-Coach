import { z } from 'zod';
import { DIFFICULTY_FEEDBACK } from '../constants';

const toEnum = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [string, ...string[]];

// ─── ExerciseLog (lồng trong WorkoutLog) ─────────────────────────────────────────

const exerciseLogSchema = z.object({
  exerciseId: z.string().min(1, 'exerciseId không được để trống'),
  setsDone: z.number().int().min(0, 'setsDone tối thiểu 0'),
  repsDone: z.string().min(1, 'repsDone không được để trống'),   // "10,10,8"
  weightKg: z.number().min(0, 'weightKg tối thiểu 0').optional(),
  isCompleted: z.boolean().default(false),
});

// ─── POST /workout-logs ──────────────────────────────────────────────────────────

export const createWorkoutLogSchema = z.object({
  planId: z.string().min(1, 'planId không được để trống'),
  dayId: z.string().min(1, 'dayId không được để trống'),
  loggedDate: z.coerce.date({ message: 'loggedDate phải là ngày hợp lệ' }),
  durationMinutes: z
    .number()
    .int()
    .min(1, 'durationMinutes tối thiểu 1 phút')
    .optional(),
  difficultyFeedback: z
    .enum(toEnum(DIFFICULTY_FEEDBACK), {
      message: `difficultyFeedback phải là: ${Object.values(DIFFICULTY_FEEDBACK).join(', ')}`,
    })
    .optional(),
  notes: z.string().optional(),
  exercises: z
    .array(exerciseLogSchema)
    .min(1, 'Cần log ít nhất 1 bài tập'),
});

// ─── Query params GET /workout-logs ─────────────────────────────────────────────

export const listWorkoutLogsQuerySchema = z
  .object({
    // filter theo tuần: truyền bất kỳ ngày nào trong tuần → trả về log của tuần đó
    week: z.coerce.date().optional(),
    // filter theo tháng: "YYYY-MM"
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month phải có dạng YYYY-MM')
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (data) => !(data.week && data.month),
    'Chỉ được truyền week hoặc month, không được cả hai',
  );

// ─── TypeScript types ────────────────────────────────────────────────────────────

export type CreateWorkoutLogDto = z.infer<typeof createWorkoutLogSchema>;
export type ListWorkoutLogsQuery = z.infer<typeof listWorkoutLogsQuerySchema>;