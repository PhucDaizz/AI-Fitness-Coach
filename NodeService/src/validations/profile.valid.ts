import { z } from 'zod';
import { GENDER, FITNESS_GOAL, FITNESS_LEVEL, ENVIRONMENT, DAY_OF_WEEK } from '../constants';

const toEnum = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [string, ...string[]];

// ─── Create Profile (onboarding — gửi 1 lần sau 4 bước) ────────────────────────
export const createProfileSchema = z.object({
  gender: z.enum(toEnum(GENDER), {
    message: `gender phải là: ${Object.values(GENDER).join(', ')}`,
  }),

  dateOfBirth: z.coerce.date({
    message: 'dateOfBirth phải là ngày hợp lệ (vd: "1995-08-15")',
  }),

  weightKg: z
    .number({ message: 'weightKg phải là số' })
    .min(20, 'Cân nặng tối thiểu 20 kg')
    .max(300, 'Cân nặng tối đa 300 kg'),

  heightCm: z
    .number({ message: 'heightCm phải là số' })
    .min(50, 'Chiều cao tối thiểu 50 cm')
    .max(250, 'Chiều cao tối đa 250 cm'),

  environment: z.enum(toEnum(ENVIRONMENT), {
    message: `environment phải là: ${Object.values(ENVIRONMENT).join(', ')}`,
  }),

  fitnessGoal: z.enum(toEnum(FITNESS_GOAL), {
    message: `fitnessGoal phải là: ${Object.values(FITNESS_GOAL).join(', ')}`,
  }),

  fitnessLevel: z.enum(toEnum(FITNESS_LEVEL), {
    message: `fitnessLevel phải là: ${Object.values(FITNESS_LEVEL).join(', ')}`,
  }),

  sessionMinutes: z
    .number()
    .int('sessionMinutes phải là số nguyên')
    .min(15, 'Buổi tập tối thiểu 15 phút')
    .max(180, 'Buổi tập tối đa 180 phút')
    .default(60),

  equipment: z.array(z.string()).default([]),

  injuries: z.string().optional(),

  // Ngày rảnh — tối thiểu 1 ngày
  availableDays: z
    .array(z.enum(toEnum(DAY_OF_WEEK)))
    .min(1, 'Cần chọn ít nhất 1 ngày rảnh trong tuần')
    .refine(
      (days) => new Set(days).size === days.length,
      'availableDays không được trùng lặp',
    ),
});

// ─── Update Profile (tất cả fields đều optional, ít nhất 1 field bắt buộc) ──────
export const updateProfileSchema = createProfileSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Cần cung cấp ít nhất 1 field để cập nhật',
  );

//
export const updateAvailableDaysSchema = z.object({
  days: z
    .array(z.enum(toEnum(DAY_OF_WEEK), {
      message: `Mỗi ngày phải là: ${Object.values(DAY_OF_WEEK).join(', ')}`,
    }))
    .min(1, 'Cần chọn ít nhất 1 ngày rảnh trong tuần')
    .refine(
      (days) => new Set(days).size === days.length,
      'availableDays không được trùng lặp',
    ),
})

// ─── TypeScript types từ schema ─────────────────────────────────────────────────
export type CreateProfileDto = z.infer<typeof createProfileSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdateAvailableDaysDto = z.infer<typeof updateAvailableDaysSchema>;