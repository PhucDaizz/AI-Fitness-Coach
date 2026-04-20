import { env } from '../config/env';

type MuscleDto = {
  id: number;
  nameEN: string;
  nameVN: string;
  isFront: boolean;
};

type ExerciseDetailDto = {
  id: number;
  name: string;
  primaryMuscles: MuscleDto[];
  secondaryMuscles: MuscleDto[];
};

type DotNetResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// ─── Kết quả trả về cho service ─────────────────────────────────────────────────

export type ExerciseMuscleInfo = {
  exerciseId: string;
  primaryMuscle: string;   // nameEN của primaryMuscles[0], fallback 'unknown'
};

// ─── In-memory cache ─────────────────────────────────────────────────────────────
// Tránh gọi lặp lại cùng exerciseId trong cùng 1 request.
// Scope: process lifetime — đủ tốt cho đồ án.
//
// ⚠️  Phase 6 TODO: thay bằng Redis cache (TTL 1 giờ) để persist qua restart
// Chỉ cần thay Map bằng redisClient.get/set ở 2 chỗ được đánh dấu bên dưới,
// không cần sửa logic gọi API hay merge ở service.
const muscleCache = new Map<string, string>();

// ─── ExerciseClient ──────────────────────────────────────────────────────────────

export class ExerciseClient {
  private readonly baseUrl: string;

  constructor() {
    // Trailing slash phòng trường hợp config sai
    this.baseUrl = env.AI_SERVICE_URL.replace(/\/$/, '');
  }

  /**
   * Lấy primaryMuscle cho một exerciseId.
   * Cache hit → trả về ngay, không gọi HTTP.
   * Cache miss → gọi GET /api/exercises/{id}, lưu cache, trả về.
   * Lỗi HTTP / parse → trả về 'unknown' (không throw, tránh crash analytics).
   */
  private async fetchOneMuscle(exerciseId: string): Promise<string> {
    // ── Cache check ── (Phase 6: đổi thành await redisClient.get(cacheKey))
    const cached = muscleCache.get(exerciseId);
    if (cached !== undefined) return cached;

    try {
      const url = `${this.baseUrl}/api/exercises/${exerciseId}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Timeout 5s — tránh analytics bị block quá lâu khi .NET chậm
        signal: AbortSignal.timeout(5_000),
      });

      if (!res.ok) {
        console.warn(
          `⚠️  ExerciseClient: GET /api/exercises/${exerciseId} → HTTP ${res.status}`,
        );
        return cacheAndReturn(exerciseId, 'unknown');
      }

      const body = (await res.json()) as DotNetResponse<ExerciseDetailDto>;

      if (!body.success || !body.data) {
        console.warn(
          `⚠️  ExerciseClient: exercise ${exerciseId} → success=false hoặc data null`,
        );
        return cacheAndReturn(exerciseId, 'unknown');
      }

      // Lấy tên nhóm cơ đầu tiên (tiếng Anh)
      const muscle = body.data.primaryMuscles?.[0]?.nameEN ?? 'unknown';

      // ── Cache set ── (Phase 6: đổi thành await redisClient.set(cacheKey, muscle, 'EX', 3600))
      return cacheAndReturn(exerciseId, muscle);
    } catch (err) {
      // Network error, timeout, JSON parse error → fallback
      console.warn(`⚠️  ExerciseClient: exercise ${exerciseId} fetch failed:`, err);
      return cacheAndReturn(exerciseId, 'unknown');
    }
  }

  /**
   * Batch: lấy primaryMuscle cho nhiều exerciseId song song.
   *
   * Dùng Promise.all — các ID đã có cache sẽ resolve ngay,
   * chỉ những ID mới mới thực sự gọi HTTP.
   * Concurrency tự nhiên bị giới hạn bởi số unique IDs (thường 10–30 bài).
   */
  async getMuscleInfoBatch(exerciseIds: string[]): Promise<ExerciseMuscleInfo[]> {
    const uniqueIds = [...new Set(exerciseIds)];

    const results = await Promise.all(
      uniqueIds.map(async (id) => ({
        exerciseId: id,
        primaryMuscle: await this.fetchOneMuscle(id),
      })),
    );

    return results;
  }
}

export const exerciseClient = new ExerciseClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function cacheAndReturn(exerciseId: string, value: string): string {
  muscleCache.set(exerciseId, value);
  return value;
}