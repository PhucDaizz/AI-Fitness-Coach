import { progressApi } from './api/axiosInstances';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FitnessProfile {
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // "YYYY-MM-DD"
  weightKg: number;
  heightCm: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'maintenance';
  environment: 'gym' | 'home' | 'outdoor';
  equipment: string[];
  availableDays: string[];
  sessionMinutes: number;
  injuries?: string;
}

export type UpdateFitnessProfileDto = Partial<FitnessProfile>;

// ── Helper ─────────────────────────────────────────────────────────────────────

const handleResponse = async <T>(apiPromise: Promise<any>): Promise<T> => {
  try {
    const response = await apiPromise;
    const apiResponse = response.data;
    if (apiResponse.success) return apiResponse.data as T;
    const error = new Error(apiResponse.message || 'Operation failed');
    (error as any).errors = apiResponse.errors;
    throw error;
  } catch (err: any) {
    if (err.response?.data) {
      const apiResponse = err.response.data;
      const error = new Error(apiResponse.message || err.message);
      (error as any).errors = apiResponse.errors || [];
      throw error;
    }
    throw err;
  }
};

// ── API calls ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/profile
 * Lấy fitness profile của user hiện tại
 */
export const getFitnessProfile = async (): Promise<FitnessProfile> => {
  return handleResponse<FitnessProfile>(progressApi.get('/v1/profile'));
};

/**
 * PUT /api/v1/profile
 * Cập nhật fitness profile (partial update)
 * Nếu có availableDays → thay thế toàn bộ danh sách ngày cũ
 */
export const updateFitnessProfile = async (
  dto: UpdateFitnessProfileDto,
): Promise<FitnessProfile> => {
  return handleResponse<FitnessProfile>(progressApi.put('/v1/profile', dto));
};
