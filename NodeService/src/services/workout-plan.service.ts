import { Types } from 'mongoose';
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
  CompleteDayDto,
} from '../validations/workout-plan.valid';
import { buildPagination } from '../utils/response';

// ─── Response shapes ─────────────────────────────────────────────────────────────

export type CalendarEntry = {
  dayId: string;
  dayOfWeek: string;
  muscleFocus: string;
  scheduledDate: string;        // ngày tập theo kế hoạch "YYYY-MM-DD"
  loggedDate: string | null;    // ngày user thực tế log, null nếu chưa tập
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
      const scheduledDate = dayDto.scheduledDate 
      ? normalizeToUTCMidnight(dayDto.scheduledDate) 
      : resolveDayDate(dto.startsAt, dayDto.dayOfWeek);

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
        notes: ex.notes ?? undefined,
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
   *
   * Fix: so sánh theo dayId thay vì date string.
   * Lý do: loggedDate = ngày user thực tế log, không nhất thiết bằng
   * scheduledDate trong plan → so sánh date string sai.
   * dayId là khóa chính xác định buổi tập, luôn đúng.
   */
  async getPlanCalendar(userId: string, planId: string): Promise<CalendarEntry[]> {
    const plan = await this._assertPlanOwner(userId, planId);

    const days = await workoutPlanRepository.findDaysByPlanId(planId);

    // Lấy tất cả log của plan này → build 2 map:
    //   loggedDayIds : Set<dayId string>  — để check "đã log chưa"
    //   logDateByDay : Map<dayId, date>   — để trả về loggedDate cho FE
    const { logs } = await workoutLogRepository.findByUserAndDateRange(
      userId,
      new Date('2000-01-01'),   // from rất xa để lấy toàn bộ lịch sử
      new Date(new Date().setUTCHours(23, 59, 59, 999)),
      0,
      1000,
    );

    const loggedDayIds  = new Set<string>();
    const logDateByDay  = new Map<string, string>();

    for (const log of logs) {
      if (String(log.planId) !== planId) continue;
      const dayIdStr = String(log.dayId);
      loggedDayIds.add(dayIdStr);
      logDateByDay.set(dayIdStr, toDateString(log.loggedDate));
    }

    const today = toDateString(new Date());

    return days.map<CalendarEntry>((day) => {
      const dayIdStr    = String(day._id);
      const isLogged    = loggedDayIds.has(dayIdStr);
      const scheduledStr = toDateString(day.scheduledDate);

      let status: CalendarEntry['status'];
      if (isLogged) {
        status = 'completed';
      } else if (scheduledStr < today) {
        status = 'missed';
      } else {
        status = 'upcoming';
      }

      return {
        dayId:        dayIdStr,
        dayOfWeek:    day.dayOfWeek,
        muscleFocus:  day.muscleFocus,
        scheduledDate: scheduledStr,
        loggedDate:   logDateByDay.get(dayIdStr) ?? null,
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

  /**
   * POST /workout-plans/:planId/days/:dayId/complete
   * Quick-log: mark 1 ngày là "done" → tự động tạo WorkoutLog + ExerciseLog
   *
   * ExerciseLog được tạo từ dữ liệu plan:
   *   - setsDone  = sets trong plan
   *   - repsDone  = reps trong plan (VD: "10-12")
   *   - weightKg  = undefined (không biết user tập nặng bao nhiêu)
   *   - isCompleted = true
   *
   * Nếu ngày đã được log → trả về 409 (idempotency — tránh double-log).
   */
  async completeDay(
    userId: string,
    planId: string,
    dayId: string,
    dto: CompleteDayDto,
  ) {
    // 1. Validate plan ownership
    await this._assertPlanOwner(userId, planId);

    // 2. Validate day thuộc plan
    const day = await workoutPlanRepository.findDayById(dayId);
    if (!day || String(day.planId) !== planId) {
      throw new AppError(
        'dayId không hợp lệ hoặc không thuộc plan này',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // 3. Normalize loggedDate — mặc định hôm nay UTC nếu không truyền
    const loggedDate = normalizeToUTCMidnight(dto.loggedDate ?? new Date());

    // 4. Kiểm tra đã log ngày này chưa
    const existing = await workoutLogRepository.findByUserDayAndDate(
      userId,
      dayId,
      loggedDate,
    );
    if (existing) {
      throw new AppError(
        'Ngày tập này đã được log rồi',
        HTTP_STATUS.CONFLICT,
      );
    }

    // 5. Lấy danh sách bài tập trong ngày từ plan
    const exercises = await workoutPlanRepository.findExercisesByDayId(dayId);
    if (exercises.length === 0) {
      throw new AppError(
        'Ngày tập này chưa có bài tập nào trong plan',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // 6. Tạo WorkoutLog
    const log = await workoutLogRepository.create({
      userId,
      planId: new Types.ObjectId(planId) as any,
      dayId:  new Types.ObjectId(dayId) as any,
      loggedDate,
      difficultyFeedback: dto.difficultyFeedback as any,
      notes: dto.notes,
    });

    // 7. Tạo ExerciseLogs — lấy sets/reps từ plan, weightKg = null
    const exerciseRecords = exercises.map((ex) => ({
      logId:       log._id as any,
      exerciseId:  ex.exerciseId,
      setsDone:    ex.sets,
      repsDone:    ex.reps,   // giữ nguyên format "10-12" từ plan
      weightKg:    undefined,
      isCompleted: true,
    }));

    await workoutLogRepository.createExerciseLogs(exerciseRecords);

    return {
      ...log,
      dayOfWeek:   day.dayOfWeek,
      muscleFocus: day.muscleFocus,
      exercises:   exerciseRecords,
    };
  }

  /**
   * DELETE /workout-plans/:id
   * Xóa plan nếu:
   * - Thuộc user hiện tại
   * - Chưa có WorkoutLog nào (user chưa tập)
   *
   * Không cascade — WorkoutDay + ExerciseInDay giữ nguyên.
   */
  async deletePlan(
    userId: string, 
    planId: string
  ): Promise<void> {
    await this._assertPlanOwner(userId, planId);

    await workoutPlanRepository.softDeletePlan(userId, planId);
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
 * Normalize về UTC midnight — dùng cho quick-log.
 * Tách riêng khỏi workout-log.service để tránh circular import.
 */
function normalizeToUTCMidnight(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
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