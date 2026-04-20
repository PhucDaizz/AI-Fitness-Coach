import { userProfileRepository } from '../repositories/user.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';

// ─── Result types ─────────────────────────────────────────────────────────────────

export type MacroResult = {
  grams: number;
  calories: number;
  percentage: number;  // % so với targetCalories
};

export type TdeeResult = {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  targetCalories: number;   // sau khi điều chỉnh theo goal (deficit / surplus)
  macros: {
    protein: MacroResult;
    carbs: MacroResult;
    fat: MacroResult;
  };
  metadata: {
    age: number;
    weightKg: number;
    heightCm: number;
    gender: string;
    fitnessLevel: string;
    environment: string;
    fitnessGoal: string;
  };
};

// ─── NutritionService ─────────────────────────────────────────────────────────────

export class NutritionService {
  /**
   * GET /nutrition/tdee
   * Tính TDEE + macro split dựa trên UserProfile.
   *
   * Công thức: Mifflin-St Jeor BMR × activity multiplier
   * Macro: protein + fat tính theo g/kg body weight, carbs lấy phần còn lại
   *
   * Thiết kế cho cache sau: trả về pure data, không ghi vào DB.
   * Phase 6 có thể cache kết quả này với TTL ngắn nếu cần.
   */
  async getTdee(userId: string): Promise<TdeeResult> {
    const profile = await userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng hoàn thành onboarding qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const age = calcAge(profile.dateOfBirth);
    const bmr = calcBMR(profile.gender, profile.weightKg, profile.heightCm, age);
    const activityMultiplier = getActivityMultiplier(
      profile.fitnessLevel,
      profile.environment,
    );
    const tdee = Math.round(bmr * activityMultiplier);
    const macros = calcMacros(tdee, profile.fitnessGoal, profile.weightKg);

    return {
      bmr: Math.round(bmr),
      tdee,
      activityMultiplier,
      targetCalories: macros.targetCalories,
      macros: {
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      },
      metadata: {
        age,
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        gender: profile.gender,
        fitnessLevel: profile.fitnessLevel,
        environment: profile.environment,
        fitnessGoal: profile.fitnessGoal,
      },
    };
  }
}

export const nutritionService = new NutritionService();

// ─── Pure functions — export để unit test độc lập ────────────────────────────────

/**
 * Tính tuổi từ ngày sinh (UTC-safe, tránh lỗi timezone)
 */
export function calcAge(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age--;
  }
  return Math.max(age, 0);
}

/**
 * Công thức Mifflin-St Jeor
 *   Male:   BMR = 10W + 6.25H − 5A + 5
 *   Female: BMR = 10W + 6.25H − 5A − 161
 *   Other:  trung bình của male và female
 *
 * W = weight (kg), H = height (cm), A = age (years)
 */
export function calcBMR(
  gender: string,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78; // 'other' → trung bình
}

/**
 * Activity multiplier từ fitnessLevel + environment
 *
 * Base levels (PAL chuẩn):
 *   beginner    → 1.375 (lightly active)
 *   intermediate → 1.55  (moderately active)
 *   advanced    → 1.725 (very active)
 *
 * Outdoor modifier: +0.05 (trừ beginner) — ngoài trời có xu hướng nhiều cardio hơn
 *
 * ⚠️  Có thể tinh chỉnh sau khi có dữ liệu thực tế từ users
 */
export function getActivityMultiplier(
  fitnessLevel: string,
  environment: string,
): number {
  const BASE: Record<string, number> = {
    beginner: 1.375,
    intermediate: 1.55,
    advanced: 1.725,
  };

  const base = BASE[fitnessLevel] ?? 1.375;

  if (environment === 'outdoor' && fitnessLevel !== 'beginner') {
    return parseFloat(Math.min(base + 0.05, 1.9).toFixed(3));
  }

  return base;
}

type MacroCalculation = {
  targetCalories: number;
  protein: MacroResult;
  carbs: MacroResult;
  fat: MacroResult;
};

/**
 * Tính macro split theo fitnessGoal
 *
 * Nguyên tắc:
 *   - Protein & fat: tính theo g/kg body weight (ưu tiên theo khoa học dinh dưỡng)
 *   - Carbs: targetCalories − protein_cal − fat_cal (lấy phần còn lại)
 *   - targetCalories: TDEE ± adjustment theo goal
 *
 * Calories per gram: protein = 4 kcal, carbs = 4 kcal, fat = 9 kcal
 * Minimum targetCalories = 1200 kcal (an toàn)
 */
export function calcMacros(
  tdee: number,
  goal: string,
  weightKg: number,
): MacroCalculation {
  // Mặc định: maintenance
  let targetCalories = tdee;
  let proteinPerKg = 1.6;
  let fatPerKg = 0.9;

  switch (goal) {
    case 'weight_loss':
      targetCalories = tdee - 500;  // deficit 500 kcal/ngày → giảm ~0.5 kg/tuần
      proteinPerKg = 2.0;           // protein cao để giữ cơ khi giảm calo
      fatPerKg = 0.8;
      break;

    case 'muscle_gain':
      targetCalories = tdee + 300;  // surplus nhẹ — tránh tăng mỡ quá nhiều
      proteinPerKg = 2.2;           // protein cao nhất cho việc tổng hợp cơ
      fatPerKg = 1.0;
      break;

    case 'endurance':
      proteinPerKg = 1.4;           // protein vừa, carbs cao để fuel cardio
      fatPerKg = 0.8;
      break;

    // 'maintenance', 'flexibility', 'health' → dùng default
  }

  // Đảm bảo không xuống dưới ngưỡng an toàn
  targetCalories = Math.max(Math.round(targetCalories), 1200);

  const proteinG = Math.round(proteinPerKg * weightKg);
  const fatG = Math.round(fatPerKg * weightKg);

  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = Math.max(targetCalories - proteinCal - fatCal, 0);
  const carbG = Math.round(carbCal / 4);

  return {
    targetCalories,
    protein: {
      grams: proteinG,
      calories: proteinCal,
      percentage: Math.round((proteinCal / targetCalories) * 100),
    },
    fat: {
      grams: fatG,
      calories: fatCal,
      percentage: Math.round((fatCal / targetCalories) * 100),
    },
    carbs: {
      grams: carbG,
      calories: carbCal,
      percentage: Math.round((carbCal / targetCalories) * 100),
    },
  };
}