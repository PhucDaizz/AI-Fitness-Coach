import { Types } from 'mongoose';
import { WorkoutLogModel, ExerciseLogModel } from '../models/workout-log.model';
import { WorkoutDayModel } from '../models/workout-plan.model';

// ─── Output types ────────────────────────────────────────────────────────────────

export type DailySessionEntry = {
  date: string;   // "YYYY-MM-DD"
  count: number;
};

export type VolumeByExerciseEntry = {
  exerciseId: string;
  totalVolume: number;
};

export type MuscleVolumeEntry = {
  muscleGroup: string;
  totalVolume: number;
};

// ─── AnalyticsRepository ─────────────────────────────────────────────────────────

export class AnalyticsRepository {
  /**
   * Đếm số buổi tập trong khoảng [from, to]
   */
  async countSessions(userId: string, from: Date, to: Date): Promise<number> {
    return WorkoutLogModel.countDocuments({
      userId,
      loggedDate: { $gte: from, $lte: to },
    });
  }

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
   * Tính volume theo từng exerciseId — KHÔNG lookup muscle group.
   *
   * Muscle group mapping được thực hiện ở service layer
   * bằng cách gọi .NET API qua ExerciseClient.
   *
   * Pipeline:
   *   1. Join ExerciseLog → WorkoutLog để filter theo userId
   *   2. Bỏ bodyweight (weightKg null hoặc 0)
   *   3. Parse repsDone "10,10,8" → sum reps = 28
   *   4. volume = weightKg × totalReps
   *   5. Group by exerciseId → sum volume
   */
  async getVolumeByExercise(userId: string): Promise<VolumeByExerciseEntry[]> {
    return ExerciseLogModel.aggregate<VolumeByExerciseEntry>([
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
          weightKg: { $gt: 0 }, // bỏ bodyweight
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

      // ── Stage 3: Group by exerciseId, sum volume ─────────────────────────────
      {
        $group: {
          _id: '$exerciseId',
          totalVolume: {
            $sum: { $multiply: ['$weightKg', '$totalReps'] },
          },
        },
      },
      {
        $project: {
          exerciseId: '$_id',
          totalVolume: { $round: ['$totalVolume', 1] },
          _id: 0,
        },
      },
    ]);
  }

  /**
   * Đếm số WorkoutLog thuộc plan (tử số completion rate)
   */
  async countLogsByPlan(
    userId: string, 
    planId: string
  ): Promise<number> {
    return WorkoutLogModel.countDocuments({
      userId,
      planId: new Types.ObjectId(planId),
    });
  }

  /**
   * Đếm số WorkoutDay trong plan (mẫu số completion rate)
   */
  async countDaysByPlan(planId: string): Promise<number> {
    return WorkoutDayModel.countDocuments({
      planId: new Types.ObjectId(planId),
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();