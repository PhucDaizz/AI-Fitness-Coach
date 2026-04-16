import { analyticsRepository, MuscleVolumeEntry } from '../repositories/analytics.repo';
import { streakService } from './streak.service';
import { workoutPlanRepository } from '../repositories/workout-plan.repo';

// ─── Result types ─────────────────────────────────────────────────────────────────

export type SummaryResult = {
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
  totalVolumeKg: number;
  completionRate: number;        // 0–100
  activePlanId: string | null;   // null nếu user chưa có plan active
};

export type WeeklySessionsResult = {
  weekStart: string;   // "YYYY-MM-DD" — thứ Hai của tuần
  weekEnd: string;     // "YYYY-MM-DD" — Chủ nhật của tuần
  weekLabel: string;   // "W1"…"W4" — FE dùng làm X-axis label
  sessions: number;
};

// ─── AnalyticsService ─────────────────────────────────────────────────────────────

export class AnalyticsService {
  /**
   * GET /analytics/summary
   * 4 metric tổng quan: streak, buổi tập tuần này, tổng volume, completion rate
   *
   * Thiết kế cho cache sau: service trả về pure data.
   * Phase 6 chỉ cần wrap thêm Redis layer ở controller, không sửa logic ở đây.
   *
   * Parallel calls:
   *   streak + sessionsThisWeek + muscleVolumes + activePlan (song song)
   *   → completionRate (phụ thuộc activePlan → chạy tiếp theo)
   */
  async getSummary(userId: string): Promise<SummaryResult> {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const [streakData, sessionsThisWeek, muscleVolumes, activePlan] = await Promise.all([
      streakService.getStreak(userId),
      analyticsRepository.countSessions(userId, weekStart, weekEnd),
      analyticsRepository.getMuscleVolume(userId),
      workoutPlanRepository.findActiveByUserId(userId),
    ]);

    // Tổng volume = sum tất cả nhóm cơ (tránh thêm aggregation riêng)
    const totalVolumeKg = Math.round(
      muscleVolumes.reduce((sum, m) => sum + m.totalVolume, 0),
    );

    // Completion rate chỉ tính khi có plan active; trả 0 nếu không có
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
   * Số buổi tập trong 4 tuần gần nhất (cho line chart)
   *
   * Luồng:
   *   1. Tính 4 khoảng tuần [Mon, Sun]
   *   2. Lấy daily sessions trong khoảng đó bằng 1 query duy nhất
   *   3. Bin daily data vào từng tuần trong service
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
        weekLabel: `W${idx + 1}`, // W1 = cũ nhất, W4 = tuần hiện tại
        sessions,
      };
    });
  }

  /**
   * GET /analytics/muscle-volume
   * Volume theo nhóm cơ (cho bar chart)
   * Kết quả đã sort theo totalVolume giảm dần (repo đảm bảo)
   */
  async getMuscleVolume(userId: string): Promise<MuscleVolumeEntry[]> {
    return analyticsRepository.getMuscleVolume(userId);
  }

  /**
   * GET /analytics/heatmap
   * Số buổi tập theo từng ngày trong N ngày gần nhất (kiểu GitHub contribution)
   * Ngày không có buổi tập → không xuất hiện trong kết quả (FE hiểu = 0)
   *
   * @param days - Số ngày nhìn lại, mặc định 365
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

/** Thứ Hai đầu tuần của ngày bất kỳ (UTC midnight) */
function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();             // 0 = Sun, 1 = Mon...
  const diff = day === 0 ? -6 : 1 - day; // shift về thứ Hai
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Chủ nhật cuối tuần (UTC 23:59:59.999) */
function getWeekEnd(date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

/**
 * Trả về 4 tuần gần nhất theo thứ tự tăng dần (cũ → mới)
 * Index 0 = 3 tuần trước, Index 3 = tuần hiện tại
 */
function getLast4Weeks(): Array<{ start: Date; end: Date }> {
  return Array.from({ length: 4 }, (_, i) => {
    const anchor = new Date();
    anchor.setUTCDate(anchor.getUTCDate() - (3 - i) * 7);
    return {
      start: getWeekStart(anchor),
      end: getWeekEnd(anchor),
    };
  });
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}