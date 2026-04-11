import { streakRepository } from '../repositories/streak.repo';

// ─── Result type ─────────────────────────────────────────────────────────────────

export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;   // "YYYY-MM-DD"
};

// ─── StreakService ────────────────────────────────────────────────────────────────

export class StreakService {
  /**
   * GET /streak
   * Tính currentStreak + longestStreak theo Lenient mode:
   *
   * Lenient: cho phép 1 ngày grace period (hôm nay).
   * - Nếu user tập hôm nay OR hôm qua → streak vẫn được duy trì.
   * - Streak chỉ bị reset khi ngày gần nhất < hôm qua.
   *
   * VD (hôm nay Thứ 5):
   *   Tập T2,T3,T4 → streak = 3 ✅ (hôm nay T5 chưa tập nhưng còn grace period)
   *   Tập T2,T3    → streak = 0 ✅ (T4 bỏ qua → đã hết grace period)
   */
  async getStreak(userId: string): Promise<StreakResult> {
    const dates = await streakRepository.findDistinctLoggedDates(userId);

    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastLoggedDate: null };
    }

    // dates đã sắp xếp mới nhất trước (repo đảm bảo)
    const sortedDates = dates.map((d) => toDateString(d)).sort().reverse();
    const lastLoggedDate = sortedDates[0];

    const currentStreak = this._calcCurrentStreak(sortedDates);
    const longestStreak = this._calcLongestStreak(sortedDates);

    return { currentStreak, longestStreak, lastLoggedDate };
  }

  // ─── Private: tính current streak (Lenient) ──────────────────────────────────

  private _calcCurrentStreak(sortedDatesDesc: string[]): number {
    const todayStr = toDateString(new Date());
    const yesterdayStr = toDateString(subtractDays(new Date(), 1));

    const mostRecent = sortedDatesDesc[0];

    // Nếu ngày tập gần nhất không phải hôm nay hoặc hôm qua → streak = 0
    if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
      return 0;
    }

    // Đếm liên tiếp từ ngày gần nhất đi ngược
    let streak = 1;
    for (let i = 1; i < sortedDatesDesc.length; i++) {
      const expected = toDateString(subtractDays(new Date(sortedDatesDesc[i - 1] + 'T00:00:00Z'), 1));
      if (sortedDatesDesc[i] === expected) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // ─── Private: tính longest streak từ toàn bộ lịch sử ────────────────────────

  private _calcLongestStreak(sortedDatesDesc: string[]): number {
    if (sortedDatesDesc.length === 0) return 0;

    // Sắp xếp cũ nhất trước để đếm xuôi
    const asc = [...sortedDatesDesc].reverse();

    let longest = 1;
    let current = 1;

    for (let i = 1; i < asc.length; i++) {
      // expected = ngày hôm sau của asc[i-1]
      const expected = toDateString(addDays(new Date(asc[i - 1] + 'T00:00:00Z'), 1));
      if (asc[i] === expected) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }

    return longest;
  }
}

export const streakService = new StreakService();

// ─── Utilities ───────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Trừ n ngày (UTC safe) */
function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

/** Cộng n ngày (UTC safe) */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}