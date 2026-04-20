import { analyticsRepository, MuscleVolumeEntry } from '../repositories/analytics.repo';
import { streakService } from './streak.service';
import { workoutPlanRepository } from '../repositories/workout-plan.repo';
import { exerciseClient } from '../utils/exercise.client';

export type SummaryResult = {
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  totalVolumeKg: number;
  completionRate: number;        // 0–100
  activePlanId: string | null;
};

export type WeeklySessionsResult = {
  weekStart: string;   // "YYYY-MM-DD"
  weekEnd: string;     // "YYYY-MM-DD"
  weekLabel: string;   // "W1"…"W4"
  sessions: number;
};

// ─── AnalyticsService ─────────────────────────────────────────────────────────────

export class AnalyticsService {
  /**
   * GET /analytics/summary
   *
   * Thiết kế cho cache sau:
   * Phase 6 chỉ cần wrap Redis ở controller, không sửa logic ở đây.
   */
  async getSummary(userId: string): Promise<SummaryResult> {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const [streakData, sessionsThisWeek, muscleVolumes, activePlan] = await Promise.all([
      streakService.getStreak(userId),
      analyticsRepository.countSessions(userId, weekStart, weekEnd),
      this.getMuscleVolume(userId),
      workoutPlanRepository.findActiveByUserId(userId),
    ]);

    const totalVolumeKg = Math.round(
      muscleVolumes.reduce((sum, m) => sum + m.totalVolume, 0),
    );

    let completionRate = 0;
    if (activePlan) {
      const planId = String(activePlan._id);
      const [loggedCount, totalDays] = await Promise.all([
        analyticsRepository.countLogsByPlan(userId, planId),
        analyticsRepository.countDaysByPlan(planId),
      ]);
      completionRate =
        totalDays > 0 ? Math.min(Math.round((loggedCount / totalDays) * 100), 100) : 0;
    }

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      sessionsThisWeek,
      totalVolumeKg,
      completionRate,
      activePlanId: activePlan ? String(activePlan._id) : null,
    };
  }

  /**
   * GET /analytics/weekly
   */
  async getWeeklySessions(userId: string): Promise<WeeklySessionsResult[]> {
    const weeks = getLast4Weeks();
    const from = weeks[0].start;
    const to = weeks[weeks.length - 1].end;

    const dailyData = await analyticsRepository.getDailySessions(userId, from, to);

    return weeks.map((week, idx) => {
      const sessions = dailyData
        .filter(({ date }) => {
          const d = new Date(date + 'T00:00:00Z');
          return d >= week.start && d <= week.end;
        })
        .reduce((sum, { count }) => sum + count, 0);

      return {
        weekStart: toDateStr(week.start),
        weekEnd: toDateStr(week.end),
        weekLabel: `W${idx + 1}`,
        sessions,
      };
    });
  }

  /**
   * GET /analytics/muscle-volume
   *
   * Luồng:
   *   1. MongoDB aggregation → volume theo từng exerciseId  (repo, pure DB)
   *   2. Unique exerciseIds → gọi .NET song song qua ExerciseClient (utils)
   *   3. Merge: map exerciseId → muscleGroup, cộng dồn volume cùng nhóm cơ
   *
   * Tách trách nhiệm rõ ràng:
   *   - Repo   : chỉ làm MongoDB, không biết .NET tồn tại
   *   - Client : chỉ làm HTTP + in-memory cache, không biết MongoDB
   *   - Service: orchestrate + merge kết quả từ 2 nguồn
   *
   * Phase 6 TODO: thay in-memory cache trong ExerciseClient bằng Redis TTL 1h
   * → chỉ sửa exercise.client.ts, không đụng service này
   */
  async getMuscleVolume(userId: string): Promise<MuscleVolumeEntry[]> {
    // Step 1: volume per exerciseId từ MongoDB
    const volumeByExercise = await analyticsRepository.getVolumeByExercise(userId);
    if (volumeByExercise.length === 0) return [];

    // Step 2: gọi .NET song song cho tất cả unique exerciseIds
    // Cache hit sẽ resolve ngay, chỉ ID mới mới thực sự gọi HTTP
    const exerciseIds = volumeByExercise.map((v) => v.exerciseId);
    const muscleInfoList = await exerciseClient.getMuscleInfoBatch(exerciseIds);

    // Step 3: build lookup map exerciseId → primaryMuscle
    const muscleMap = new Map<string, string>(
      muscleInfoList.map(({ exerciseId, primaryMuscle }) => [exerciseId, primaryMuscle]),
    );

    // Step 4: gom volume theo muscleGroup
    // (nhiều exerciseId có thể cùng nhóm cơ → cộng dồn)
    const volumeByMuscle = new Map<string, number>();
    for (const { exerciseId, totalVolume } of volumeByExercise) {
      const muscle = muscleMap.get(exerciseId) ?? 'unknown';
      volumeByMuscle.set(muscle, (volumeByMuscle.get(muscle) ?? 0) + totalVolume);
    }

    // Step 5: format + sort nhiều volume nhất lên đầu
    return Array.from(volumeByMuscle.entries())
      .map(([muscleGroup, totalVolume]) => ({
        muscleGroup,
        totalVolume: Math.round(totalVolume * 10) / 10,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }

  /**
   * GET /analytics/heatmap
   */
  async getHeatmap(userId: string, days = 365) {
    const to = new Date();
    to.setUTCHours(23, 59, 59, 999);

    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - days + 1);
    from.setUTCHours(0, 0, 0, 0);

    return analyticsRepository.getDailySessions(userId, from, to);
  }
}

export const analyticsService = new AnalyticsService();

// ─── Utility functions (UTC-safe) ────────────────────────────────────────────────

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function getLast4Weeks(): Array<{ start: Date; end: Date }> {
  return Array.from({ length: 4 }, (_, i) => {
    const anchor = new Date();
    anchor.setUTCDate(anchor.getUTCDate() - (3 - i) * 7);
    return { start: getWeekStart(anchor), end: getWeekEnd(anchor) };
  });
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}