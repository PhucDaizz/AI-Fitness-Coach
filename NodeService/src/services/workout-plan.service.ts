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
  loggedDate: string | null;
  status: 'completed' | 'missed' | 'upcoming';
};

// ─── WorkoutPlanService ──────────────────────────────────────────────────────────

export class WorkoutPlanService {
  /**
   * POST /workout-plans
   * Nhận plan JSON từ .NET AI và lưu vào MongoDB.
   * Enforce: mỗi user chỉ được có 1 plan active cùng lúc.
   * Nếu đã có plan active → tự động archive plan cũ trước khi tạo mới.
   *
   * Không dùng transaction — MongoDB standalone không hỗ trợ.
   * Thứ tự thực hiện: archive cũ → tạo plan → tạo days → tạo exercises.
   */
  async createPlan(userId: string, dto: CreateWorkoutPlanDto) {
    // 1. Archive plan active cũ (nếu có)
    const existingActive = await workoutPlanRepository.findActiveByUserId(userId);
    if (existingActive) {
      await workoutPlanRepository.updateStatus(String(existingActive._id), 'archived');
    }

    // 2. Tạo plan mới
    const plan = await workoutPlanRepository.create({
      userId,
      title: dto.title,
      planType: dto.planType,
      weekNumber: dto.weekNumber,
      status: 'active',
      aiModelUsed: dto.aiModelUsed,
      startsAt: dto.startsAt,
      generatedAt: new Date(),
    });

    const planId = plan._id;

    // 3. Tạo days và exercises tuần tự (giữ đúng orderIndex)
    for (const dayDto of dto.days) {
      const scheduledDate = resolveDayDate(dto.startsAt, dayDto.dayOfWeek);

      const day = await workoutPlanRepository.createDay({
        planId,
        dayOfWeek: dayDto.dayOfWeek as any,
        muscleFocus: dayDto.muscleFocus,
        orderIndex: dayDto.orderIndex,
        scheduledDate,
      });

      const exercises = dayDto.exercises.map((ex) => ({
        dayId: day._id,
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds ?? 60,
        notes: ex.notes,
        orderIndex: ex.orderIndex,
      }));

      await workoutPlanRepository.createExercisesInDay(exercises);
    }

    return { planId: String(planId), ...plan };
  }

  /**
   * GET /workout-plans
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
   */
  async getPlanDays(userId: string, planId: string): Promise<WorkoutDayWithExercises[]> {
    await this._assertPlanOwner(userId, planId);
    return workoutPlanRepository.findDaysWithExercises(planId);
  }

  /**
   * GET /workout-plans/:id/calendar
   */
  async getPlanCalendar(userId: string, planId: string): Promise<CalendarEntry[]> {
    const plan = await this._assertPlanOwner(userId, planId);

    const days = await workoutPlanRepository.findDaysByPlanId(planId);

    const loggedDates = await workoutLogRepository
      .findByUserAndDateRange(
        userId,
        plan.startsAt,
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
   * Không dùng transaction — MongoDB standalone không hỗ trợ.
   */
  async updateStatus(
    userId: string,
    planId: string,
    dto: UpdatePlanStatusDto,
  ): Promise<WorkoutPlanLean> {
    const plan = await this._assertPlanOwner(userId, planId);

    if (dto.status === 'active' && plan.status !== 'active') {
      const currentActive = await workoutPlanRepository.findActiveByUserId(userId);
      if (currentActive && String(currentActive._id) !== planId) {
        throw new AppError(
          'Đã có plan đang active — archive plan hiện tại trước khi activate plan mới',
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const updated = await workoutPlanRepository.updateStatus(planId, dto.status);

    if (!updated) {
      throw new AppError('Cập nhật thất bại', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return updated;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async _assertPlanOwner(
    userId: string,
    planId: string,
  ): Promise<WorkoutPlanLean> {
    const plan = await workoutPlanRepository.findById(planId);

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