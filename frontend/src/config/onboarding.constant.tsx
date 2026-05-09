import React from 'react';

/// ── Step 1  Personal ───────────────────────────────────────────────
export const FITNESS_LEVELS = [
  { value: 'beginner' as const, label: 'Beginner', sub: '< 6 Months training' },
  { value: 'intermediate' as const, label: 'Intermediate', sub: '6–24 Months training' },
  { value: 'advanced' as const, label: 'Advanced', sub: '> 2 Years training' },
];

export const FITNESS_GOALS = [
  { value: 'weight_loss' as const, label: 'Fat Loss', icon: '🔥' },
  { value: 'muscle_gain' as const, label: 'Muscle Gain', icon: '💪' },
  { value: 'strength' as const, label: 'Strength & Power', icon: '⚡' },
  { value: 'endurance' as const, label: 'Endurance', icon: '⏱️' },
  { value: 'flexibility' as const, label: 'Flexibility & Mobility', icon: '🤸' },
  { value: 'general_fitness' as const, label: 'General Health', icon: '🛡️' },
  { value: 'maintenance' as const, label: 'Maintain', icon: '🔄' },
];

export const GENDERS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'other' as const, label: 'Other' },
];


// ── Step 2 Equipment ───────────────────────────────────────────────
export const ENVIRONMENTS = [
  {
    value: 'gym' as const,
    label: 'Full Gym',
    desc: 'Commercial facility with all equipment (barbells, machines, etc.).',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="6" y="11" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="13" y="8" width="6" height="16" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="23" y="11" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="26" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="9" y="15" width="14" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: 'home' as const,
    label: 'Home Gym',
    desc: 'Training at home with or without equipment.',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 16L16 6L28 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        <path
          d="M8 14V26H24V14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="13" y="19" width="6" height="7" rx="1" fill="currentColor" opacity="0.5" />
        <rect
          x="18"
          y="16"
          width="5"
          height="5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    value: 'outdoor' as const,
    label: 'Outdoor',
    desc: 'Bodyweight exercises, running, or outdoor park workouts.',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 26L16 10L24 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        <path
          d="M14 26L20 14L26 26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <circle cx="22" cy="9" r="3" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
];

export const EQUIPMENT_LIST = [
  { value: 'Barbell', label: 'Barbell', labelVi: 'Tạ đòn' },
  { value: 'Dumbbell', label: 'Dumbbell', labelVi: 'Tạ đơn' },
  { value: 'SZ-Bar', label: 'SZ-Bar', labelVi: 'Tạ đòn cong' },
  { value: 'Kettlebell', label: 'Kettlebell', labelVi: 'Tạ bình' },
  { value: 'Cable', label: 'Cable', labelVi: 'Cáp ròng rọc' },
  { value: 'Machine', label: 'Machine', labelVi: 'Máy tập' },
  { value: 'Bench', label: 'Bench', labelVi: 'Ghế tập' },
  { value: 'Pull-up bar', label: 'Pull-up bar', labelVi: 'Xà đơn' },
  { value: 'Resistance band', label: 'Resistance band', labelVi: 'Dây kháng lực' },
  { value: 'Swiss ball', label: 'Swiss ball', labelVi: 'Bóng tập' },
  { value: 'Gym mat', label: 'Gym mat', labelVi: 'Thảm tập' },
  { value: 'Bodyweight', label: 'Bodyweight', labelVi: 'Không dụng cụ' },
  { value: 'Other', label: 'Other', labelVi: 'Khác' },
];

// ── Step 3 Schedule ───────────────────────────────────────────────
export const DAYS = [
  { value: 'Monday', label: 'MON' },
  { value: 'Tuesday', label: 'TUE' },
  { value: 'Wednesday', label: 'WED' },
  { value: 'Thursday', label: 'THU' },
  { value: 'Friday', label: 'FRI' },
  { value: 'Saturday', label: 'SAT' },
  { value: 'Sunday', label: 'SUN' },
];

export const SESSION_OPTIONS: { value: 30 | 45 | 60 | 90; tag: string }[] = [
  { value: 30, tag: 'EXPRESS' },
  { value: 45, tag: 'BALANCED' },
  { value: 60, tag: 'ENDURANCE' },
  { value: 90, tag: 'ELITE' },
];

export const TRAINING_WINDOWS = [
  { value: 'morning' as const, label: 'MORNING' },
  { value: 'midday' as const, label: 'MIDDAY' },
  { value: 'afternoon' as const, label: 'AFTERNOON' },
  { value: 'night' as const, label: 'NIGHT' },
];