import mongoose, { Types } from 'mongoose';
import { workoutLogRepository } from '../repositories/workout-log.repo';
import { workoutPlanRepository } from '../repositories/workout-plan.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import {
  CreateWorkoutLogDto,
  ListWorkoutLogsQuery,
} from '../validations/workout-log.valid';
import { buildPagination } from '../utils/response';

// ─── WorkoutLogService ───────────────────────────────────────────────────────────

export class WorkoutLogService {
  /**
   * POST /workout-logs
   * Log một buổi tập kèm chi tiết từng bài.
   *
   * Validate:
   * 1. planId phải tồn tại và thuộc user
   * 2. dayId phải thuộc planId đó
   * 3. Chưa log ngày này + day này trước đó (unique per day + dayId)
   */
  async createLog(userId: string, dto: CreateWorkoutLogDto) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Validate plan thuộc user
        const plan = await workoutPlanRepository.findById(dto.planId, session);
        if (!plan) {
          throw new AppError('Không tìm thấy workout plan', HTTP_STATUS.NOT_FOUND);
        }
        if (plan.userId !== userId) {
          throw new AppError('Bạn không có quyền truy cập plan này', HTTP_STATUS.FORBIDDEN);
        }

        // 2. Validate day thuộc plan
        const day = await workoutPlanRepository.findDayById(dto.dayId, session);
        if (!day || String(day.planId) !== dto.planId) {
          throw new AppError(
            'dayId không hợp lệ hoặc không thuộc plan này',
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // 3. Normalize loggedDate về UTC 00:00:00 để so sánh chính xác
        const loggedDate = normalizeDate(dto.loggedDate);

        // 4. Kiểm tra đã log ngày này chưa
        const existing = await workoutLogRepository.findByUserDayAndDate(
          userId,
          dto.dayId,
          loggedDate,
          session,
        );
        if (existing) {
          throw new AppError(
            'Bạn đã log buổi tập này rồi — mỗi ngày chỉ được log 1 lần cho cùng 1 day',
            HTTP_STATUS.CONFLICT,
          );
        }

        // 5. Tạo WorkoutLog
        const log = await workoutLogRepository.create(
          {
            userId,
            planId: new Types.ObjectId(dto.planId) as any,
            dayId: new Types.ObjectId(dto.dayId) as any,
            loggedDate,
            durationMinutes: dto.durationMinutes,
            difficultyFeedback: dto.difficultyFeedback as any,
            notes: dto.notes,
          },
          session,
        );

        // 6. Tạo ExerciseLogs
        const exerciseRecords = dto.exercises.map((ex) => ({
          logId: log._id as any,
          exerciseId: ex.exerciseId,
          setsDone: ex.setsDone,
          repsDone: ex.repsDone,
          weightKg: ex.weightKg,
          isCompleted: ex.isCompleted ?? false,
        }));

        await workoutLogRepository.createExerciseLogs(exerciseRecords, session);

        return {
          ...log,
          exercises: exerciseRecords,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * GET /workout-logs
   * Lấy lịch sử tập với filter theo tuần hoặc tháng.
   */
  async listLogs(userId: string, query: ListWorkoutLogsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const { from, to } = resolveDateRange(query);

    const { logs, total } = await workoutLogRepository.findLogsWithExercises(
      userId,
      from,
      to,
      skip,
      limit,
    );

    return {
      logs,
      pagination: buildPagination(total, page, limit),
    };
  }
}

export const workoutLogService = new WorkoutLogService();

// ─── Utilities ───────────────────────────────────────────────────────────────────

/**
 * Normalize Date về UTC midnight (00:00:00.000Z).
 * Đảm bảo so sánh ngày không bị lệch timezone.
 */
function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Tính khoảng [from, to] dựa trên query.week hoặc query.month.
 * Mặc định: tuần hiện tại (Monday → Sunday).
 */
function resolveDateRange(query: ListWorkoutLogsQuery): { from: Date; to: Date } {
  // Filter theo tháng: "YYYY-MM"
  if (query.month) {
    const [year, month] = query.month.split('-').map(Number);
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));  // last day of month
    return { from, to };
  }

  // Filter theo tuần: truyền bất kỳ ngày nào trong tuần
  const anchor = query.week ? new Date(query.week) : new Date();
  const dayOfWeek = anchor.getUTCDay();                  // 0=Sun, 1=Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(anchor);
  monday.setUTCDate(monday.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return { from: monday, to: sunday };
}