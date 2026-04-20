import { Types } from 'mongoose';
import { WorkoutLogModel, ExerciseLogModel } from '../models/workout-log.model';
import { WorkoutDayModel } from '../models/workout-plan.model';

// ─── Output types ────────────────────────────────────────────────────────────────

export type DailySessionEntry = {
  date: string;    // "YYYY-MM-DD"
  count: number;   // số buổi tập trong ngày
};

export type MuscleVolumeEntry = {
  exerciseId: any;
  muscleGroup: string;
  totalVolume: number;  // kg · reps
};

// ─── AnalyticsRepository ─────────────────────────────────────────────────────────

export class AnalyticsRepository {
  async getVolumeByExercise(userId: string): Promise<MuscleVolumeEntry[]> {
    return this.getMuscleVolume(userId);
  }
  /**
   * Đếm số buổi tập trong khoảng [from, to]
   * Dùng cho: sessionsThisWeek trong summary
   */
  async countSessions(userId: string, from: Date, to: Date): Promise<number> {
    return WorkoutLogModel.countDocuments({
      userId,
      loggedDate: { $gte: from, $lte: to },
    });
  }

  /**
   * Đếm số buổi tập theo từng ngày trong khoảng [from, to]
   *
   * Dùng chung cho 2 endpoints:
   *   - weekly: service sẽ bin kết quả vào 4 tuần
   *   - heatmap: service dùng trực tiếp
   *
   * Trả về mảng đã sort theo ngày tăng dần.
   * Ngày không có tập sẽ không xuất hiện (FE xử lý = 0).
   */
  async getDailySessions(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DailySessionEntry[]> {
    const result = await WorkoutLogModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          userId,
          loggedDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$loggedDate',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((r) => ({ date: r._id, count: r.count }));
  }

  /**
   * Tính tổng volume theo nhóm cơ chính (primary muscle group)
   *
   * Pipeline:
   * 1. Join ExerciseLog → WorkoutLog để filter theo userId
   * 2. Bỏ qua bài bodyweight (weightKg = null hoặc 0)
   * 3. Parse repsDone "10,10,8" → sum = 28
   * 4. volume per exercise = weightKg × totalReps
   * 5. Lookup exercises để lấy muscles_primary
   * 6. Group by nhóm cơ đầu tiên → sum volume
   *
   * ⚠️  $toString xử lý type mismatch:
   *     ExerciseLog.exerciseId (String) vs Exercise._id (Number từ wger)
   *     Cần xác nhận field 'muscles_primary' với Thành viên 2
   */
  async getMuscleVolume(userId: string): Promise<MuscleVolumeEntry[]> {
    return ExerciseLogModel.aggregate<MuscleVolumeEntry>([
      // ── Stage 1: Join WorkoutLog để lọc theo userId ──────────────────────────
      {
        $lookup: {
          from: 'workoutlogs',
          localField: 'logId',
          foreignField: '_id',
          as: 'log',
        },
      },
      { $unwind: '$log' },
      {
        $match: {
          'log.userId': userId,
          weightKg: { $gt: 0 }, // bỏ qua bodyweight exercise
        },
      },

      // ── Stage 2: Parse repsDone "10,10,8" → tổng reps ───────────────────────
      {
        $addFields: {
          repsArray: { $split: ['$repsDone', ','] },
        },
      },
      {
        $addFields: {
          totalReps: {
            $reduce: {
              input: '$repsArray',
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $convert: {
                      input: { $trim: { input: '$$this' } },
                      to: 'int',
                      onError: 0,
                      onNull: 0,
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          volume: { $multiply: ['$weightKg', '$totalReps'] },
        },
      },

      // ── Stage 3: Lookup Exercise để lấy nhóm cơ ─────────────────────────────
      // $toString: xử lý exerciseId (string) vs exercise._id (number)
      {
        $lookup: {
          from: 'exercises',
          let: { exId: '$exerciseId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: '$_id' }, '$$exId'] },
              },
            },
            { $project: { muscles_primary: 1, _id: 0 } },
          ],
          as: 'exerciseData',
        },
      },

      // ── Stage 4: Lấy nhóm cơ đầu tiên, fallback 'unknown' ───────────────────
      {
        $addFields: {
          muscleGroup: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: '$exerciseData' }, 0] },
                  {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            { $arrayElemAt: ['$exerciseData.muscles_primary', 0] },
                            [],
                          ],
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
              then: {
                // exerciseData[0].muscles_primary[0]
                $arrayElemAt: [
                  { $arrayElemAt: ['$exerciseData.muscles_primary', 0] },
                  0,
                ],
              },
              else: 'unknown', // exercise không tìm thấy hoặc chưa có muscle data
            },
          },
        },
      },

      // ── Stage 5: Group theo nhóm cơ, sum volume ──────────────────────────────
      {
        $group: {
          _id: '$muscleGroup',
          totalVolume: { $sum: '$volume' },
        },
      },
      {
        $project: {
          muscleGroup: '$_id',
          totalVolume: { $round: ['$totalVolume', 1] },
          _id: 0,
        },
      },
      { $sort: { totalVolume: -1 } }, // nhóm cơ tập nhiều nhất lên đầu
    ]);
  }

  /**
   * Đếm số WorkoutLog thuộc một plan (tử số của completion rate)
   */
  async countLogsByPlan(userId: string, planId: string): Promise<number> {
    return WorkoutLogModel.countDocuments({
      userId,
      planId: new Types.ObjectId(planId),
    });
  }

  /**
   * Đếm số WorkoutDay trong một plan (mẫu số của completion rate)
   */
  async countDaysByPlan(planId: string): Promise<number> {
    return WorkoutDayModel.countDocuments({
      planId: new Types.ObjectId(planId),
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();