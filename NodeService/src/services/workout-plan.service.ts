import mongoose, { Types } from 'mongoose';
import {
  workoutPlanRepository,
  WorkoutPlanLean,
  WorkoutDayWithExercises,
} from '../repositories/workout-plan.repo';
import { workoutLogRepository } from '../repositories/workout-log.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import {
  CreateWorkoutPlanDto,
  UpdatePlanStatusDto,
  ListWorkoutPlansQuery,
} from '../validations/workout-plan.valid';
import { buildPagination } from '../utils/response';

// ─── Response shapes ─────────────────────────────────────────────────────────────

export type CalendarEntry = {
  dayId: string;
  dayOfWeek: string;
  muscleFocus: string;
  loggedDate: string | null;   // ISO date string nếu đã tập, null nếu chưa
  status: 'completed' | 'missed' | 'upcoming';
};

// ─── WorkoutPlanService ──────────────────────────────────────────────────────────

export class WorkoutPlanService {
  /**
   * POST /workout-plans
   * Nhận plan JSON từ .NET AI và lưu vào MongoDB.
   * Enforce: mỗi user chỉ được có 1 plan active cùng lúc.
   * Nếu đã có plan active → tự động archive plan cũ trước khi tạo mới.
   */
  async createPlan(userId: string, dto: CreateWorkoutPlanDto) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // Archive plan active cũ (nếu có)
        const existingActive = await workoutPlanRepository.findActiveByUserId(
          userId,
          session,
        );

        if (existingActive) {
          await workoutPlanRepository.updateStatus(
            String(existingActive._id),
            'archived',
            session,
          );
        }

        // Tạo plan mới
        const plan = await workoutPlanRepository.create(
          {
            userId,
            title: dto.title,
            planType: dto.planType,
            weekNumber: dto.weekNumber,
            status: 'active',
            aiModelUsed: dto.aiModelUsed,
            startsAt: dto.startsAt,
            generatedAt: new Date(),
          },
          session,
        );

        const planId = plan._id;

        // Tạo days và exercises từng ngày tuần tự (giữ đúng orderIndex)
        for (const dayDto of dto.days) {
          const day = await workoutPlanRepository.createDay(
            {
              planId,
              dayOfWeek: dayDto.dayOfWeek as any,
              muscleFocus: dayDto.muscleFocus,
              orderIndex: dayDto.orderIndex,
            },
            session,
          );

          const exercises = dayDto.exercises.map((ex) => ({
            dayId: day._id,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds ?? 60,
            notes: ex.notes,
            orderIndex: ex.orderIndex,
          }));

          await workoutPlanRepository.createExercisesInDay(exercises, session);
        }

        return { planId: String(planId), ...plan };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * GET /workout-plans
   * Lấy danh sách plan của user (mặc định filter active).
   */
  async listPlans(userId: string, query: ListWorkoutPlansQuery) {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const { plans, total } = await workoutPlanRepository.findManyByUserId(
      userId,
      { status },
      skip,
      limit,
    );

    return {
      plans,
      pagination: buildPagination(total, page, limit),
    };
  }

  /**
   * GET /workout-plans/:id/days
   * Chi tiết từng ngày kèm danh sách bài tập.
   */
  async getPlanDays(userId: string, planId: string): Promise<WorkoutDayWithExercises[]> {
    await this._assertPlanOwner(userId, planId);
    return workoutPlanRepository.findDaysWithExercises(planId);
  }

  /**
   * GET /workout-plans/:id/calendar
   * Trả về trạng thái từng ngày tập: completed / missed / upcoming.
   *
   * Logic:
   * - completed  : ngày <= hôm nay và có WorkoutLog
   * - missed     : ngày < hôm nay và KHÔNG có WorkoutLog
   * - upcoming   : ngày > hôm nay
   */
  async getPlanCalendar(userId: string, planId: string): Promise<CalendarEntry[]> {
    const plan = await this._assertPlanOwner(userId, planId);

    const days = await workoutPlanRepository.findDaysByPlanId(planId);

    // Lấy tập ngày đã tập của plan này
    const loggedDates = await workoutLogRepository
      .findByUserAndDateRange(
        userId,
        plan.startsAt,
        // Tìm log tới tận hôm nay (hoặc xa hơn nếu user log muộn)
        new Date(new Date().setUTCHours(23, 59, 59, 999)),
        0,
        1000,
      )
      .then(({ logs }) =>
        new Set(
          logs
            .filter((l) => String(l.planId) === planId)
            .map((l) => toDateString(l.loggedDate)),
        ),
      );

    const today = toDateString(new Date());

    return days.map<CalendarEntry>((day) => {
      // Tính ngày thực tế của day dựa trên startsAt + dayOfWeek
      const dayDate = resolveDayDate(plan.startsAt, day.dayOfWeek as string);
      const dayDateStr = toDateString(dayDate);

      let status: CalendarEntry['status'];

      if (loggedDates.has(dayDateStr)) {
        status = 'completed';
      } else if (dayDateStr < today) {
        status = 'missed';
      } else {
        status = 'upcoming';
      }

      return {
        dayId: String(day._id),
        dayOfWeek: day.dayOfWeek,
        muscleFocus: day.muscleFocus,
        loggedDate: loggedDates.has(dayDateStr) ? dayDateStr : null,
        status,
      };
    });
  }

  /**
   * PATCH /workout-plans/:id/status
   * Cập nhật status: active / completed / archived.
   * Enforce: không thể set active nếu đã có plan active khác.
   */
  async updateStatus(
    userId: string,
    planId: string,
    dto: UpdatePlanStatusDto,
  ): Promise<WorkoutPlanLean> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const plan = await this._assertPlanOwner(userId, planId, session);

        if (dto.status === 'active' && plan.status !== 'active') {
          // Kiểm tra đã có plan active khác chưa
          const currentActive = await workoutPlanRepository.findActiveByUserId(
            userId,
            session,
          );
          if (currentActive && String(currentActive._id) !== planId) {
            throw new AppError(
              'Đã có plan đang active — archive plan hiện tại trước khi activate plan mới',
              HTTP_STATUS.CONFLICT,
            );
          }
        }

        const updated = await workoutPlanRepository.updateStatus(
          planId,
          dto.status,
          session,
        );

        if (!updated) {
          throw new AppError('Cập nhật thất bại', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return updated;
      });
    } finally {
      await session.endSession();
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Tìm plan và kiểm tra quyền sở hữu.
   * Ném 404 nếu không tồn tại, 403 nếu không phải chủ sở hữu.
   */
  private async _assertPlanOwner(
    userId: string,
    planId: string,
    session?: mongoose.ClientSession,
  ): Promise<WorkoutPlanLean> {
    const plan = await workoutPlanRepository.findById(planId, session);

    if (!plan) {
      throw new AppError('Không tìm thấy workout plan', HTTP_STATUS.NOT_FOUND);
    }

    if (plan.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập plan này', HTTP_STATUS.FORBIDDEN);
    }

    return plan;
  }
}

export const workoutPlanService = new WorkoutPlanService();

// ─── Utility: format Date thành "YYYY-MM-DD" ────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Tính ngày thực tế của một WorkoutDay trong tuần dựa trên ngày bắt đầu plan.
 * VD: plan startsAt = Monday 14/04 → day Wednesday → 16/04
 */
function resolveDayDate(startsAt: Date, dayOfWeek: string): Date {
  const DAY_INDEX: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
    Friday: 5, Saturday: 6, Sunday: 0,
  };

  const startDay = startsAt.getUTCDay();   // 0=Sunday, 1=Monday...
  const targetDay = DAY_INDEX[dayOfWeek] ?? 0;

  let diff = targetDay - startDay;
  if (diff < 0) diff += 7;

  const result = new Date(startsAt);
  result.setUTCDate(result.getUTCDate() + diff);
  result.setUTCHours(0, 0, 0, 0);

  return result;
}