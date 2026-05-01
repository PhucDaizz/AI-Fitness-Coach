// ─── BMI ────────────────────────────────────────────────────────────────────
import type { ActivityLevel, FitnessGoal, Gender } from '../config/constants';

/**
 * Calculate Body Mass Index
 * @param weightKg  Weight in kilograms
 * @param heightCm  Height in centimetres
 * @example calcBMI(70, 175) => 22.9
 */
export function calcBMI(
    weightKg: number, 
    heightCm: number
): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category label 
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
}

// ─── Age ─────────────────────────────────────────────────────────────────────

/**
 * Calculate age from date of birth
 */
export function calcAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// ─── BMR ─────────────────────────────────────────────────────────────────────

/**
 * Calculate Basal Metabolic Rate using Mifflin–St Jeor equation
 * @returns calories/day at complete rest
 */
export function calcBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? Math.round(base - 161) : Math.round(base + 5);
}

// ─── TDEE ────────────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // desk job, no exercise
  light: 1.375, // 1–3 days/week
  moderate: 1.55, // 3–5 days/week
  active: 1.725, // 6–7 days/week
  very_active: 1.9, // twice/day or physical job
};

/**
 * Calculate Total Daily Energy Expenditure
 * @example calcTDEE(70, 175, 25, 'male', 'moderate') => 2798
 */
export function calcTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel = 'moderate',
): number {
  const bmr = calcBMR(weightKg, heightCm, age, gender);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ─── Macro split ─────────────────────────────────────────────────────────────

export interface MacroSplit {
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

/**
 * Calculate recommended macro split based on TDEE and fitness goal
 *
 * fat_loss    → 20% deficit, high protein
 * muscle_gain → 10% surplus, high protein + carb
 * maintain    → maintenance calories, balanced
 * endurance   → maintenance, high carb
 * health      → maintenance, balanced
 */
export function calcMacros(
    tdee: number, 
    goal: FitnessGoal, 
    weightKg: number
): MacroSplit {
  const goalConfig: Record<FitnessGoal, { calMod: number; proteinPerKg: number; fatPct: number }> =
    {
      fat_loss: { calMod: 0.8, proteinPerKg: 2.4, fatPct: 0.25 },
      muscle_gain: { calMod: 1.1, proteinPerKg: 2.2, fatPct: 0.25 },
      endurance: { calMod: 1.0, proteinPerKg: 1.6, fatPct: 0.2 },
      maintain: { calMod: 1.0, proteinPerKg: 1.8, fatPct: 0.28 },
      health: { calMod: 1.0, proteinPerKg: 1.6, fatPct: 0.28 },
    };

  const { calMod, proteinPerKg, fatPct } = goalConfig[goal];
  const targetCal = Math.round(tdee * calMod);

  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((targetCal * fatPct) / 9);
  const carbG = Math.round((targetCal - proteinG * 4 - fatG * 9) / 4);

  return { calories: targetCal, proteinG, carbG, fatG };
}

// ─── Volume ──────────────────────────────────────────────────────────────────

/**
 * Calculate total volume lifted in a session
 * @example calcVolume(4, 10, 80) => 3200 (kg)
 */
export function calcVolume(
  sets: number,
  reps: number,
  weightKg: number
): number {
  return sets * reps * weightKg;
}

/**
 * Estimate 1 Rep Max using Epley formula
 * @example calc1RM(100, 8) => 122
 */
export function calc1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}
