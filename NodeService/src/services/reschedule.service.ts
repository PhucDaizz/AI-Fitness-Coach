import mongoose from 'mongoose';
import { workoutPlanRepository, WorkoutDayLean } from '../repositories/workout-plan.repo';
import { workoutLogRepository } from '../repositories/workout-log.repo';
import { userProfileRepository } from '../repositories/user.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import { RescheduleDto } from '../validations/reschedule.valid';

// ─── RescheduleService ────────────────────────────────────────────────────────────

export class RescheduleService {
  /**
   * POST /workout-plans/:id/reschedule
   */
  async reschedule(
    userId: string, 
    planId: string, 
    dto: RescheduleDto
  ) {
    // 1. Plan tồn tại + quyền sở hữu
    const plan = await workoutPlanRepository.findById(planId);
    if (!plan) throw new AppError('Không tìm thấy workout plan', HTTP_STATUS.NOT_FOUND);
    if (plan.userId !== userId) {
      throw new AppError('Bạn không có quyền truy cập plan này', HTTP_STATUS.FORBIDDEN);
    }
    if (plan.status !== 'active') {
      throw new AppError('Chỉ có thể dời lịch của plan đang active', HTTP_STATUS.BAD_REQUEST);
    }

    const currentDate = toUTCDate(dto.currentDay);
    const targetDate = toUTCDate(dto.targetDay);

    // 2. Tìm WorkoutDay tại currentDay
    const currentWD = await workoutPlanRepository.findDayByScheduledDate(planId, currentDate);
    if (!currentWD) {
      throw new AppError(
        `Không tìm thấy buổi tập nào vào ngày ${dto.currentDay} trong plan này`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // 3. currentDay đã log → từ chối
    const currentLogged = await workoutLogRepository.hasLogForDay(String(currentWD._id));
    if (currentLogged) {
      throw new AppError(
        `Buổi tập ngày ${dto.currentDay} đã được log — không thể dời`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // 4. Tìm WorkoutDay tại targetDay (nếu có)
    const targetWD = await workoutPlanRepository.findDayByScheduledDate(planId, targetDate);

    // 5. Simple case: targetDay trống → update 1 document, không cần strategy
    if (!targetWD) {
      return this._simpleReschedule(currentWD, targetDate);
    }

    // 6. Conflict case → phân theo strategy
    if (dto.strategy === 'SWAP') {
      return this._swap(currentWD, targetWD, currentDate, targetDate);
    }

    // SHIFT chỉ áp dụng khi dời về tương lai
    if (targetDate <= currentDate) {
      throw new AppError(
        'SHIFT chỉ dùng để dời về phía sau (targetDay phải sau currentDay) — dùng SWAP để hoán đổi',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    return this._shift(userId, planId, currentWD, targetDate);
  }

  // ─── Simple: targetDay trống — chỉ cập nhật 1 WorkoutDay ────────────────────────

  private async _simpleReschedule(
    currentWD: WorkoutDayLean, 
    targetDate: Date
  ) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await workoutPlanRepository.updateDaySchedule(
          String(currentWD._id),
          targetDate,
          getDayOfWeek(targetDate),
          session,
        );
      });
    } finally {
      await session.endSession();
    }

    const updated = await workoutPlanRepository.findDayById(String(currentWD._id));
    return { affected: [updated] };
  }

  // ─── SWAP: trao đổi scheduledDate + dayOfWeek giữa 2 WorkoutDay ─────────────────
  //
  // Exercises tự động theo vì gắn với dayId (_id không đổi).
  // muscleFocus không swap — nó mô tả nội dung bài tập, không phải ngày.
  //
  // Trước:  dayA(Thu, Chest)   dayB(Sat, Shoulders)
  // Sau:    dayA(Sat, Chest)   dayB(Thu, Shoulders)

  private async _swap(
    currentWD: WorkoutDayLean,
    targetWD: WorkoutDayLean,
    currentDate: Date,
    targetDate: Date,
  ) {
    const targetLogged = await workoutLogRepository.hasLogForDay(String(targetWD._id));
    if (targetLogged) {
      throw new AppError(
        `Buổi tập ngày ${toDateStr(targetDate)} đã được log — không thể hoán đổi`,
        HTTP_STATUS.CONFLICT,
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await workoutPlanRepository.updateDaySchedule(
          String(currentWD._id),
          targetDate,
          getDayOfWeek(targetDate),
          session,
        );
        await workoutPlanRepository.updateDaySchedule(
          String(targetWD._id),
          currentDate,
          getDayOfWeek(currentDate),
          session,
        );
      });
    } finally {
      await session.endSession();
    }

    const [updatedCurrent, updatedTarget] = await Promise.all([
      workoutPlanRepository.findDayById(String(currentWD._id)),
      workoutPlanRepository.findDayById(String(targetWD._id)),
    ]);

    return { affected: [updatedCurrent, updatedTarget].filter(Boolean) };
  }

  // ─── SHIFT: cascade dời lịch từ targetDay về cuối plan ──────────────────────────
  // Ngày gốc của currentWD bị bỏ trống (user bỏ buổi đó, lùi lịch).
  // Plan tự mở rộng thêm 1 buổi ở cuối — không mất buổi nào.

  private async _shift(
    userId: string,
    planId: string,
    currentWD: WorkoutDayLean,
    targetDate: Date,
  ) {
    // Lấy tất cả WorkoutDay sort theo scheduledDate
    const allDays = await workoutPlanRepository.findDaysSortedByDate(planId);

    // Chain = từ targetDate trở đi, bỏ qua currentWD
    const chain = allDays.filter(
      (d) =>
        d.scheduledDate >= targetDate &&
        String(d._id) !== String(currentWD._id),
    );

    // Validate: không ngày nào trong chain được phép đã log
    for (const day of chain) {
      const logged = await workoutLogRepository.hasLogForDay(String(day._id));
      if (logged) {
        throw new AppError(
          `Cascade bị chặn: buổi tập ngày ${toDateStr(day.scheduledDate)} đã được log — không thể dời`,
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    // Lấy available_days của user để tính ngày rảnh tiếp theo cho phần tử cuối chain
    const availableDays = await userProfileRepository.findAvailableDays(userId);
    if (availableDays.length === 0) {
      throw new AppError(
        'Không tìm thấy lịch rảnh của user — không thể tính ngày cascade',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Lưu dates gốc TRƯỚC khi update (tránh đọc giá trị đã bị thay đổi trong loop)
    const chainOriginalDates = chain.map((d) => d.scheduledDate);

    // Ngày mới cho phần tử cuối = ngày rảnh đầu tiên SAU ngày cuối cùng của chain
    const lastDate = chainOriginalDates[chainOriginalDates.length - 1];
    const nextDate = getNextAvailableDate(lastDate, availableDays);

    // newDates[i] = date mà chain[i] sẽ nhận sau cascade
    // chain[i] → chain[i+1]'s original date; chain[last] → nextDate
    const newDates = [...chainOriginalDates.slice(1), nextDate];

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // currentWD nhảy vào slot của chain[0] (= targetDate)
        await workoutPlanRepository.updateDaySchedule(
          String(currentWD._id),
          chainOriginalDates[0],
          getDayOfWeek(chainOriginalDates[0]),
          session,
        );

        // Cascade: chain[i] → newDates[i]
        for (let i = 0; i < chain.length; i++) {
          await workoutPlanRepository.updateDaySchedule(
            String(chain[i]._id),
            newDates[i],
            getDayOfWeek(newDates[i]),
            session,
          );
        }
      });
    } finally {
      await session.endSession();
    }

    // Trả về tất cả WorkoutDay bị ảnh hưởng (fresh từ DB)
    const affectedIds = [String(currentWD._id), ...chain.map((d) => String(d._id))];
    const updatedDays = await Promise.all(
      affectedIds.map((id) => workoutPlanRepository.findDayById(id)),
    );

    return { affected: updatedDays.filter(Boolean) };
  }
}

export const rescheduleService = new RescheduleService();

// ─── Utilities ────────────────────────────────────────────────────────────────────

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Lấy tên thứ trong tuần từ Date object (UTC-safe) */
function getDayOfWeek(date: Date): string {
  return DOW_NAMES[date.getUTCDay()];
}

/** Parse "YYYY-MM-DD" thành Date UTC midnight */
function toUTCDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z');
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Tìm ngày rảnh đầu tiên sau lastDate dựa trên available_days của user.
 *
 * Traverse tối đa 14 ngày để đảm bảo tìm được (1 chu kỳ tuần = 7 ngày).
 * Fallback +7 ngày nếu không khớp — không nên xảy ra với available_days hợp lệ.
 */
function getNextAvailableDate(lastDate: Date, availableDays: string[]): Date {
  const DAY_NUM: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  const availableNums = new Set(
    availableDays.map((d) => DAY_NUM[d]).filter((n) => n !== undefined),
  );

  const candidate = new Date(lastDate);
  for (let i = 0; i < 14; i++) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    if (availableNums.has(candidate.getUTCDay())) {
      return new Date(candidate);  // trả về copy
    }
  }

  // Fallback
  const fallback = new Date(lastDate);
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  return fallback;
}