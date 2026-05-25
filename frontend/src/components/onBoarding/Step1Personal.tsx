import React from 'react';
import { useTranslation } from 'react-i18next';

import { FITNESS_GOALS, FITNESS_LEVELS, GENDERS } from '../../config/onboarding.constant';
import { cn } from '../../lib/utils';
import { calcAge, calcBMI, getBMICategory, getBMIColor } from '../../utils/fitness.utils';
import { formatNumber } from '../../utils/number';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Step1Data {
  dateOfBirth: string;
  weightKg: number;
  heightCm: number;
  gender: 'male' | 'female' | 'other';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'maintenance';
}

interface Step1PersonalProps {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
  errors?: Partial<Record<keyof Step1Data, string>>;
}

// ── Sub-components ─────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="block w-5 h-px bg-on-surface-variant" />
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
      {children}
    </span>
  </div>
);

interface InputFieldProps {
  label: string;
  icon: string;
  error?: string;
  children: React.ReactNode;
}
const InputField: React.FC<InputFieldProps> = ({ label, icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-0.5">
      {label}
    </label>
    <div
      className={cn(
        'bg-surface-container border rounded-xl flex items-center gap-2.5 px-3.5 h-[52px] transition-colors',
        error ? 'border-error' : 'border-white/10 focus-within:border-primary',
      )}
    >
      <span
        className="material-symbols-outlined text-on-surface-variant flex-shrink-0"
        style={{ fontSize: 18 }}
      >
        {icon}
      </span>
      {children}
    </div>
    {error && <p className="text-[11px] text-error font-semibold ml-0.5">{error}</p>}
  </div>
);

const bmiCategoryKeys: Record<string, string> = {
  'Thiếu cân': 'underweight',
  'Bình thường': 'normal',
  'Thừa cân': 'overweight',
  'Béo phì': 'obese',
};

// ── Main Component ─────────────────────────────────────────────────────────
const Step1Personal: React.FC<Step1PersonalProps> = ({ data, onChange, errors = {} }) => {
  const { t } = useTranslation();
  // Dùng fitness.utils để tính BMI live — hiển thị ngay khi user nhập đủ weight + height
  const canShowBMI = data.weightKg >= 20 && data.heightCm >= 50;
  const bmi = canShowBMI ? calcBMI(data.weightKg, data.heightCm) : null;
  const bmiCategory = bmi !== null ? getBMICategory(bmi) : null;
  const bmiCategoryText = bmiCategory
    ? t(`onboarding.step1.bmi_categories.${bmiCategoryKeys[bmiCategory] || 'normal'}`)
    : '';

  // Dùng fitness.utils để tính tuổi live
  const age = data.dateOfBirth ? calcAge(data.dateOfBirth) : null;

  return (
    <div className="relative">
      {/* Decorative step number */}
      <span className="absolute right-0 top-0 text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        01
      </span>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[40px] md:text-[48px] font-black uppercase tracking-tight leading-none">
          {t('onboarding.step1.title')}{' '}
          <span className="text-primary italic">{t('onboarding.step1.title_italic')}</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-2 font-medium max-w-lg">
          {t('onboarding.step1.subtitle')}
        </p>
      </div>

      {/* ── Section 1: Physical data ───────────────────────────────── */}
      <SectionLabel>{t('onboarding.step1.physical_data')}</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <InputField
          label={t('onboarding.step1.dob')}
          icon="calendar_month"
          error={errors.dateOfBirth}
        >
          <input
            type="date"
            value={data.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </InputField>

        <InputField label={t('onboarding.step1.weight')} icon="monitor_weight" error={errors.weightKg}>
          <input
            type="number"
            value={data.weightKg || ''}
            placeholder="00.0"
            min={20}
            max={300}
            step={0.5}
            onChange={(e) => onChange({ weightKg: parseFloat(e.target.value) })}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </InputField>

        <InputField label={t('onboarding.step1.height')} icon="height" error={errors.heightCm}>
          <input
            type="number"
            value={data.heightCm || ''}
            placeholder="000"
            min={50}
            max={250}
            step={1}
            onChange={(e) => onChange({ heightCm: parseInt(e.target.value) })}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </InputField>
      </div>

      {/* BMI live preview — dùng calcBMI + getBMICategory + formatNumber từ utils */}
      {(bmi !== null || age !== null) && (
        <div className="flex items-center gap-4 mb-7 px-1">
          {bmi !== null && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                BMI
              </span>
              <span className={cn('text-[15px] font-black', getBMIColor(bmi))}>
                {formatNumber(bmi, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-on-surface-variant">— {bmiCategoryText}</span>
            </div>
          )}
          {bmi !== null && age !== null && (
            <span className="text-on-surface-variant/30 text-[10px]">·</span>
          )}
          {age !== null && age > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                {t('onboarding.step1.age')}
              </span>
              <span className="text-[15px] font-black text-on-surface">{age}</span>
            </div>
          )}
        </div>
      )}
      {!bmi && !age && <div className="mb-7" />}

      {/* ── Section 2: Gender ──────────────────────────────────────── */}
      <SectionLabel>{t('onboarding.step1.biological_profile')}</SectionLabel>
      <div className="flex gap-2 mb-7">
        {GENDERS.map((g) => (
          <button
            key={g.value}
            onClick={() => onChange({ gender: g.value })}
            className={cn(
              'flex-1 h-11 rounded-full border text-[13px] font-bold uppercase tracking-wide transition-all',
              data.gender === g.value
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-transparent border-white/15 text-on-surface-variant hover:border-primary/40 hover:text-white',
            )}
            style={
              data.gender === g.value ? { boxShadow: '0 0 12px rgba(177,255,36,0.25)' } : undefined
            }
          >
            {t(`onboarding.step1.genders.${g.value}`)}
          </button>
        ))}
      </div>

      {/* ── Section 3: Fitness Level ───────────────────────────────── */}
      <SectionLabel>{t('onboarding.step1.current_experience')}</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {FITNESS_LEVELS.map((lvl) => {
          const selected = data.fitnessLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              onClick={() => onChange({ fitnessLevel: lvl.value })}
              className={cn(
                'relative bg-surface-container border rounded-xl px-6 py-3 text-left transition-all hover:border-primary/30',
                selected ? 'border-primary bg-primary/5' : 'border-white/8',
              )}
            >
              <span
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 right-3 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all',
                  selected ? 'bg-primary border-primary' : 'border-white/20 bg-transparent',
                )}
              >
                {selected && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="#1a2e00"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <p
                className={cn(
                  'text-[13px] font-black uppercase tracking-wide mb-1',
                  selected ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {t(`onboarding.step1.levels.${lvl.value}`)}
              </p>
              <p className="text-[11px] text-on-surface-variant/60 font-medium">
                {t(`onboarding.step1.levels.${lvl.value}_sub`)}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Section 4: Fitness Goal ────────────────────────────────── */}
      <SectionLabel>{t('onboarding.step1.primary_objective')}</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {FITNESS_GOALS.map((goal) => {
          const selected = data.fitnessGoal === goal.value;
          return (
            <button
              key={goal.value}
              onClick={() => onChange({ fitnessGoal: goal.value })}
              className={cn(
                'bg-surface-container border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/30',
                selected ? 'border-primary bg-primary/5' : 'border-white/8',
              )}
            >
              <span className="text-2xl leading-none">{goal.icon}</span>
              <p
                className={cn(
                  'text-[11px] font-black uppercase tracking-wide',
                  selected ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {t(`onboarding.step1.goals.${goal.value}`)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1Personal;
