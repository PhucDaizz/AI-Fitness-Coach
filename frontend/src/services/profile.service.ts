/* eslint-disable @typescript-eslint/no-explicit-any */
import { workoutApi } from '../services/api/axiosInstances';

// ── Types ──────────────────────────────────────────────────────────────────
export interface CreateUserProfileRequest {
  // Step 1 — all required
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // "1998-05-15"
  weightKg: number; // min: 20, max: 300
  heightCm: number; // min: 50, max: 250
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'maintenance';

  // Step 2
  environment: 'gym' | 'home' | 'outdoor';
  equipment: string[];

  // Step 3
  availableDays: string[]; // ["Monday", "Wednesday", "Friday"]
  sessionMinutes: number; // 30 | 45 | 60 | 90

  // Step 4 — optional
  injuries?: string;
}

// ── Helper ─────────────────────────────────────────────────────────────────
const handleResponse = async <T>(apiPromise: Promise<any>): Promise<T> => {
  try {
    const response = await apiPromise;
    const apiResponse = response.data;

    if (apiResponse.success) {
      return apiResponse.data as T;
    }
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

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Check if the authenticated user already has a profile.
 * Used by OnboardingRoute guard immediately after login.
 *
 * GET /api/v1/profile/exists
 * Response: { success: true, data: { exists: boolean } }
 */
export const checkProfileExists = async (): Promise<boolean> => {
  const data = await handleResponse<{ exists: boolean }>(workoutApi.get('/profile/exists'));
  return data.exists;
};

/**
 * Submit all 4 onboarding steps in a single request.
 * Called only once at Step 4 when user clicks Finish.
 *
 * POST /api/v1/profile
 */
export const createUserProfile = async (payload: CreateUserProfileRequest): Promise<void> => {
  await handleResponse(workoutApi.post('/profile', payload));
};
