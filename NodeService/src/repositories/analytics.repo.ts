import { Types } from 'mongoose';
import { WorkoutLogModel, ExerciseLogModel } from '../models/workout-log.model';
import { WorkoutDayModel, WorkoutPlanModel } from '../models/workout-plan.model';

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

// ─── Admin output types ────────────────────────────────────

export type DifficultyBucket = {
  count: number;
  percentage: number;
};
 
export type DifficultyDistributionResult = {
  easy: DifficultyBucket;
  ok: DifficultyBucket;
  hard: DifficultyBucket;
  total: number;   // tổng số log CÓ điền difficultyFeedback
};
 
export type PlanCompletionResult = {
  completed: number;
  active: number;
  archived: number;
  total: number;
  rate: number;    // % = completed / total × 100
};

// ─── AnalyticsRepository ─────────────────────────────────────────────────────────

export class AnalyticsRepository {
  /**
   * Đếm số buổi tập trong khoảng [from, to]
   */
  async countSessions(
    userId: string, 
    from: Date, 
    to: Date
  ): Promise<number> {
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
    const result = await WorkoutLogModel.aggregate<{ 
      _id: string; 
      count: number 
    }>([
      {
        $match: { userId, loggedDate: { $gte: from, $lte: to }, },
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

  async getDifficultyDistribution(): Promise<DifficultyDistributionResult> {
    type BucketRaw = { _id: 'easy' | 'ok' | 'hard'; count: number };
 
    const buckets = await WorkoutLogModel.aggregate<BucketRaw>([
      {
        // Bỏ qua log không có đánh giá
        $match: {
          difficultyFeedback: { $in: ['easy', 'ok', 'hard'] },
        },
      },
      {
        $group: {
          _id: '$difficultyFeedback',
          count: { $sum: 1 },
        },
      },
    ]);
 
    // Build map để lookup nhanh
    const countMap: Record<string, number> = { easy: 0, ok: 0, hard: 0 };
    for (const b of buckets) {
      countMap[b._id] = b.count;
    }
 
    const total = countMap.easy + countMap.ok + countMap.hard;
 
    const pct = (count: number): number =>
      total > 0 ? Math.round((count / total) * 100) : 0;
 
    return {
      easy:  { count: countMap.easy,  percentage: pct(countMap.easy)  },
      ok:    { count: countMap.ok,    percentage: pct(countMap.ok)    },
      hard:  { count: countMap.hard,  percentage: pct(countMap.hard)  },
      total,
    };
  }

  async getPlanCompletionRate(): Promise<PlanCompletionResult> {
    type StatusBucket = { 
      _id: 'active' | 'completed' | 'archived'; 
      count: number 
    };
 
    const buckets = await WorkoutPlanModel.aggregate<StatusBucket>([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
 
    const countMap: Record<string, number> = { active: 0, completed: 0, archived: 0 };
    for (const b of buckets) {
      countMap[b._id] = b.count;
    }
 
    const total = countMap.active + countMap.completed + countMap.archived;
    const rate = total > 0 ? Math.round((countMap.completed / total) * 100) : 0;
 
    return {
      completed: countMap.completed,
      active: countMap.active,
      archived: countMap.archived,
      total,
      rate,
    };
  }

  async getAvgSetsPerUser(): Promise<number> {
    type UserSets = { _id: string; totalSets: number };
    type AvgResult = { avgSets: number };
 
    const result = await ExerciseLogModel.aggregate<AvgResult>([
      // ── Stage 1: Join → lấy userId ──────────────────────────────────────────
      {
        $lookup: {
          from: 'workoutlogs',
          localField: 'logId',
          foreignField: '_id',
          as: 'log',
        },
      },
      { $unwind: '$log' },
 
      // ── Stage 2: Group by userId → sum sets ─────────────────────────────────
      {
        $group: {
          _id: '$log.userId',
          totalSets: { $sum: '$setsDone' },
        },
      },
 
      // ── Stage 3: Average across all users ───────────────────────────────────
      {
        $group: { _id: null, avgSets: { $avg: '$totalSets' }, },
      },
      {
        $project: { _id: 0, avgSets: { $round: ['$avgSets', 1] }, },
      },
    ]);
 
    return result[0]?.avgSets ?? 0;
  }
}

export const analyticsRepository = new AnalyticsRepository();