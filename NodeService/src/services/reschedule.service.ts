import mongoose, { ClientSession } from 'mongoose';
import { workoutPlanRepository, WorkoutDayLean } from '../repositories/workout-plan.repo';
import { userProfileRepository } from '../repositories/user.repo';
import { WorkoutLogModel } from '../models/workout-log.model';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import { ReschedulePlanDto } from '../validations/reschedule.valid';

// ─── Result type ─────────────────────────────────────────────────────────────────

export type RescheduleResult = {
  strategy: 'SIMPLE_MOVE' | 'SWAP' | 'SHIFT';
  affected: number;          // số WorkoutDay bị thay đổi scheduledDate
  message: string;
};

// ─── RescheduleService ───────────────────────────────────────────────────────────

export class RescheduleService {
  async reschedule(
    userId: string,
    planId: string,
    dto: ReschedulePlanDto,
  ): Promise<RescheduleResult> {
    // 1. Validate plan ownership + status
    const plan = await workoutPlanRepository.findById(planId);
    if (!plan) throw new AppError('Không tìm thấy plan', HTTP_STATUS.NOT_FOUND);
    if (plan.userId !== userId) throw new AppError('Không có quyền truy cập plan này', HTTP_STATUS.FORBIDDEN);
    if (plan.status !== 'active') {
      throw new AppError('Chỉ có thể dời lịch của plan đang active', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Parse dates về UTC midnight
    const currentDate = parseDateUTC(dto.currentDay);
    const targetDate  = parseDateUTC(dto.targetDay);

    // 3. Tìm WorkoutDay của currentDay
    const currentWorkoutDay = await workoutPlanRepository.findDayByScheduledDate(planId, currentDate);
    if (!currentWorkoutDay) {
      throw new AppError(
        `Không tìm thấy buổi tập vào ngày ${dto.currentDay} trong plan này`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // 4. Không cho dời nếu đã log
    await assertNotLogged(userId, currentWorkoutDay, dto.currentDay);

    // 5. Tìm WorkoutDay của targetDay (có thể trống)
    const targetWorkoutDay = await workoutPlanRepository.findDayByScheduledDate(planId, targetDate);

    // 6. Route: trống → simple move, xung đột → SWAP | SHIFT
    if (!targetWorkoutDay) {
      return this._simpleMove(currentWorkoutDay, targetDate, dto.targetDay);
    }

    if (dto.strategy === 'SWAP') {
      return this._swap(userId, currentWorkoutDay, targetWorkoutDay, dto);
    }

    return this._shift(userId, planId, currentWorkoutDay, targetWorkoutDay, dto);
  }

  // ─── Nhánh 1: Target day trống ─────────────────────────────────────────────────

  private async _simpleMove(
    currentDay: WorkoutDayLean,
    targetDate: Date,
    targetStr: string,
  ): Promise<RescheduleResult> {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await workoutPlanRepository.updateDaySchedule(
          String(currentDay._id),
          targetDate,
          getDayOfWeek(targetDate),
          session,
        );
      });
      return {
        strategy: 'SIMPLE_MOVE',
        affected: 1,
        message: `Đã dời buổi tập sang ${targetStr}`,
      };
    } finally {
      await session.endSession();
    }
  }

  private async _swap(
    userId: string,
    currentDay: WorkoutDayLean,
    targetDay: WorkoutDayLean,
    dto: ReschedulePlanDto,
  ): Promise<RescheduleResult> {
    await assertNotLogged(userId, targetDay, dto.targetDay);

    const TEMP_DATE    = new Date('9999-12-31T00:00:00.000Z');
    const TEMP_DOW     = '__temp__';

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Step 1: currentDay → temp (giải phóng slot)
        await workoutPlanRepository.updateDaySchedule(
          String(currentDay._id), TEMP_DATE, TEMP_DOW, session,
        );
        // Step 2: targetDay → currentDay's original slot
        await workoutPlanRepository.updateDaySchedule(
          String(targetDay._id), currentDay.scheduledDate, currentDay.dayOfWeek, session,
        );
        // Step 3: currentDay (ở temp) → targetDay's original slot
        await workoutPlanRepository.updateDaySchedule(
          String(currentDay._id), targetDay.scheduledDate, targetDay.dayOfWeek, session,
        );
      });
      return {
        strategy: 'SWAP',
        affected: 2,
        message: `Đã hoán đổi buổi tập ${dto.currentDay} ↔ ${dto.targetDay}`,
      };
    } finally {
      await session.endSession();
    }
  }

  private async _shift(
    userId: string,
    planId: string,
    currentDay: WorkoutDayLean,
    targetDay: WorkoutDayLean,
    dto: ReschedulePlanDto,
  ): Promise<RescheduleResult> {
    // Lấy toàn bộ plan sorted by scheduledDate
    const allDays  = await workoutPlanRepository.findDaysSortedByDate(planId);
    const targetIdx = allDays.findIndex(d => String(d._id) === String(targetDay._id));

    // Chuỗi domino: targetDay đến cuối plan
    const daysToShift = allDays.slice(targetIdx);

    // Không cho dời nếu bất kỳ ngày nào trong chuỗi đã được log
    for (const day of daysToShift) {
      await assertNotLogged(userId, day, toDateStr(day.scheduledDate));
    }

    // Tính slot mới cho ngày cuối (mở rộng plan thêm 1 slot)
    const availableDays = await userProfileRepository.findAvailableDays(userId);
    const lastDay       = daysToShift[daysToShift.length - 1];
    const nextSlot      = getNextAvailableDate(lastDay.scheduledDate, availableDays);

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // 1. Ngày cuối → slot mới (chưa tồn tại, không conflict)
        await workoutPlanRepository.updateDaySchedule(
          String(lastDay._id),
          nextSlot,
          getDayOfWeek(nextSlot),
          session,
        );

        // 2. Các ngày còn lại trong daysToShift (reverse, bỏ qua phần tử cuối)
        //    daysToShift[i] → daysToShift[i+1].scheduledDate (original, không bị thay đổi)
        for (let i = daysToShift.length - 2; i >= 0; i--) {
          const newDate = daysToShift[i + 1].scheduledDate;  // original date, lấy từ snapshot
          await workoutPlanRepository.updateDaySchedule(
            String(daysToShift[i]._id),
            newDate,
            getDayOfWeek(newDate),
            session,
          );
        }

        // 3. currentDay → targetDay's original slot (cuối cùng, Sat đã được C giải phóng)
        await workoutPlanRepository.updateDaySchedule(
          String(currentDay._id),
          targetDay.scheduledDate,
          getDayOfWeek(targetDay.scheduledDate),
          session,
        );
      });

      return {
        strategy: 'SHIFT',
        affected: daysToShift.length + 1,
        message: `Đã dời buổi tập ${dto.currentDay} → ${dto.targetDay}, `
               + `${daysToShift.length} buổi tập sau bị đẩy lùi 1 slot`,
      };
    } finally {
      await session.endSession();
    }
  }
}

export const rescheduleService = new RescheduleService();

// ─── Pure helpers ─────────────────────────────────────────────────────────────────

function parseDateUTC(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z');
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayOfWeek(date: Date): string {
  return DAY_NAMES[date.getUTCDay()];
}

/**
 * Kiểm tra user đã log buổi tập này chưa.
 * Nếu rồi → throw 409, tránh dữ liệu analytics bị sai.
 */
async function assertNotLogged(
  userId: string,
  day: WorkoutDayLean,
  dateStr: string,
): Promise<void> {
  const logged = await WorkoutLogModel.exists({ userId, dayId: day._id });
  if (logged) {
    throw new AppError(
      `Buổi tập ngày ${dateStr} đã được log — không thể dời`,
      HTTP_STATUS.CONFLICT,
    );
  }
}

/**
 * Tìm ngày rảnh tiếp theo sau afterDate dựa trên available_days của user.
 * Dùng cho SHIFT để tính slot mới cho ngày cuối plan bị đẩy ra ngoài.
 *
 * Nếu user chưa có profile / availableDays rỗng → fallback +7 ngày.
 */
function getNextAvailableDate(afterDate: Date, availableDays: string[]): Date {
  const DAY_INDEX: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  const available = new Set(
    availableDays.map(d => DAY_INDEX[d] ?? -1).filter(n => n >= 0),
  );

  if (available.size === 0) {
    // Fallback: không có available_days → +7 ngày
    const fallback = new Date(afterDate);
    fallback.setUTCDate(fallback.getUTCDate() + 7);
    return fallback;
  }

  const candidate = new Date(afterDate);
  for (let i = 1; i <= 14; i++) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    if (available.has(candidate.getUTCDay())) {
      return new Date(candidate);
    }
  }

  // Fallback an toàn (không bao giờ reach nếu availableDays hợp lệ)
  const fallback = new Date(afterDate);
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  return fallback;
}