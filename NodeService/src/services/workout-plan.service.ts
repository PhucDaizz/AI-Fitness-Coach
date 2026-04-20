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
  scheduledDate: string;
  loggedDate: string | null;
  status: 'completed' | 'missed' | 'upcoming';
};

// ─── WorkoutPlanService ──────────────────────────────────────────────────────────

export class WorkoutPlanService {
  /**
   * POST /workout-plans
   * Nhận plan JSON từ .NET AI và lưu vào MongoDB.
   * scheduledDate của mỗi WorkoutDay được tính từ startsAt + dayOfWeek.
   */
  async createPlan(userId: string, dto: CreateWorkoutPlanDto) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
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

        for (const dayDto of dto.days) {
          // ── Tính ngày thực tế từ startsAt + dayOfWeek ─────────────────────────
          const scheduledDate = resolveDayDate(dto.startsAt, dayDto.dayOfWeek);

          const day = await workoutPlanRepository.createDay(
            {
              planId,
              dayOfWeek: dayDto.dayOfWeek as any,
              muscleFocus: dayDto.muscleFocus,
              orderIndex: dayDto.orderIndex,
              scheduledDate,
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
   * Dùng day.scheduledDate trực tiếp — không cần tính lại từ startsAt.
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
      // Dùng scheduledDate đã lưu sẵn — không tính lại mỗi lần query
      const dayDateStr = toDateString(day.scheduledDate);

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
        scheduledDate: dayDateStr,
        loggedDate: loggedDates.has(dayDateStr) ? dayDateStr : null,
        status,
      };
    });
  }

  /**
   * PATCH /workout-plans/:id/status
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

// ─── Utilities ───────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Tính ngày thực tế của một WorkoutDay dựa trên ngày bắt đầu plan.
 * VD: plan startsAt = Monday 21/04 → day Thursday → 24/04
 *
 * Export để RescheduleService tái dùng nếu cần.
 */
export function resolveDayDate(startsAt: Date, dayOfWeek: string): Date {
  const DAY_INDEX: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
    Friday: 5, Saturday: 6, Sunday: 0,
  };

  const startDay = startsAt.getUTCDay();
  const targetDay = DAY_INDEX[dayOfWeek] ?? 0;

  let diff = targetDay - startDay;
  if (diff < 0) diff += 7;

  const result = new Date(startsAt);
  result.setUTCDate(result.getUTCDate() + diff);
  result.setUTCHours(0, 0, 0, 0);

  return result;
}