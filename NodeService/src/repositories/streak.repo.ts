import { Types } from 'mongoose';
import { WorkoutLogModel } from '../models/workout-log.model';

// ─── StreakRepository ─────────────────────────────────────────────────────────────

export class StreakRepository {
  /**
   * Lấy danh sách ngày tập distinct của user, sắp xếp mới nhất trước.
   * Mỗi ngày chỉ cần có ít nhất 1 log là được tính.
   * Trả về mảng Date (đã normalize về UTC 00:00:00).
   */
  async findDistinctLoggedDates(userId: string): Promise<Date[]> {
    const result = await WorkoutLogModel.aggregate<{ _id: string }>([
      { $match: { userId } },
      {
        // Group theo chuỗi ngày (YYYY-MM-DD) để loại duplicate
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$loggedDate', timezone: 'UTC' },
          },
        },
      },
      { $sort: { _id: -1 } },   // mới nhất trước
    ]);

    return result.map((r) => new Date(r._id + 'T00:00:00.000Z'));
  }

  /**
   * Lấy tập các ngày tập trong khoảng thời gian của 1 plan (dùng cho calendar view).
   * Trả về Set<string> dạng "YYYY-MM-DD" để lookup nhanh.
   */
  async findLoggedDatesByPlan(
    userId: string,
    planId: string,
  ): Promise<Set<string>> {
    const result = await WorkoutLogModel.aggregate<{ _id: string }>([
      {
        $match: {
          userId,
          planId: new Types.ObjectId(planId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$loggedDate', timezone: 'UTC' },
          },
        },
      },
    ]);

    return new Set(result.map((r) => r._id));
  }
}

export const streakRepository = new StreakRepository();