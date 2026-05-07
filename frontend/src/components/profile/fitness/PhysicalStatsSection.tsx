import React from 'react';

import { FITNESS_GOALS, FITNESS_LEVELS, GENDERS } from '../../../config/onboarding.constant';
import { cn } from '../../../lib/utils';
import type { FitnessProfile } from '../../../services/fitness.service';
import { calcAge, calcBMI, getBMICategory, getBMIColor } from '../../../utils/fitness.utils';
import { formatNumber } from '../../../utils/number';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PhysicalStatsSectionProps {
  data: FitnessProfile;
  errors: Partial<Record<keyof FitnessProfile, string>>;
  onChange: <K extends keyof FitnessProfile>(key: K, value: FitnessProfile[K]) => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="block w-6 h-px bg-on-surface-variant/50" />
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
      {children}
    </span>
  </div>
);

interface FieldProps {
  label: string;
  icon: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, error, children }) => (
  <div className="flex flex-col gap-1.5" data-error={!!error}>
    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant ml-0.5">
      {label}
    </label>
    <div
      className={cn(
        'bg-surface-container border rounded-xl flex items-center gap-2.5 px-3.5 h-[52px] transition-colors',
        error
          ? 'border-error focus-within:border-error'
          : 'border-white/10 focus-within:border-primary',
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

// ── Main Component ─────────────────────────────────────────────────────────────

const PhysicalStatsSection: React.FC<PhysicalStatsSectionProps> = ({ data, errors, onChange }) => {
  const canShowBMI = data.weightKg >= 20 && data.heightCm >= 50;
  const bmi = canShowBMI ? calcBMI(data.weightKg, data.heightCm) : null;
  const bmiCategory = bmi !== null ? getBMICategory(bmi) : null;
  const age = data.dateOfBirth ? calcAge(data.dateOfBirth) : null;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
            monitor_weight
          </span>
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Physical Stats</h2>
          <p className="text-[11px] text-on-surface-variant">
            Cân nặng, chiều cao, mục tiêu cá nhân
          </p>
        </div>
      </div>

      {/* Section 1: Physical Data */}
      <SectionLabel>Chỉ số cơ thể</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <Field label="Ngày sinh" icon="calendar_month" error={errors.dateOfBirth}>
          <input
            type="date"
            value={data.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full"
          />
        </Field>

        <Field label="Cân nặng (KG)" icon="monitor_weight" error={errors.weightKg}>
          <input
            type="number"
            value={data.weightKg || ''}
            placeholder="00.0"
            min={20}
            max={300}
            step={0.5}
            onChange={(e) => onChange('weightKg', parseFloat(e.target.value))}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </Field>

        <Field label="Chiều cao (CM)" icon="height" error={errors.heightCm}>
          <input
            type="number"
            value={data.heightCm || ''}
            placeholder="000"
            min={50}
            max={250}
            step={1}
            onChange={(e) => onChange('heightCm', parseInt(e.target.value))}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </Field>
      </div>

      {/* BMI live preview */}
      {(bmi !== null || (age !== null && age > 0)) && (
        <div className="flex items-center gap-4 mb-6 px-1">
          {bmi !== null && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                BMI
              </span>
              <span className={cn('text-[15px] font-black', getBMIColor(bmi))}>
                {formatNumber(bmi, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-on-surface-variant">— {bmiCategory}</span>
            </div>
          )}
          {bmi !== null && age !== null && (
            <span className="text-on-surface-variant/30 text-[10px]">·</span>
          )}
          {age !== null && age > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Tuổi
              </span>
              <span className="text-[15px] font-black text-on-surface">{age}</span>
            </div>
          )}
        </div>
      )}
      {bmi === null && (age === null || age <= 0) && <div className="mb-6" />}

      {/* Section 2: Gender */}
      <SectionLabel>Giới tính</SectionLabel>
      <div className="flex gap-2 mb-6">
        {GENDERS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange('gender', g.value)}
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
            {g.label}
          </button>
        ))}
      </div>

      {/* Section 3: Fitness Level */}
      <SectionLabel>Cấp độ hiện tại</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {FITNESS_LEVELS.map((lvl) => {
          const selected = data.fitnessLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => onChange('fitnessLevel', lvl.value)}
              className={cn(
                'relative bg-surface-container border rounded-xl px-4 py-3 text-left transition-all hover:border-primary/30',
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
                {lvl.label}
              </p>
              <p className="text-[11px] text-on-surface-variant/60 font-medium pr-6">{lvl.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Section 4: Fitness Goal */}
      <SectionLabel>Mục tiêu chính</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {FITNESS_GOALS.map((goal) => {
          const selected = data.fitnessGoal === goal.value;
          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => onChange('fitnessGoal', goal.value)}
              className={cn(
                'bg-surface-container border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/30',
                selected ? 'border-primary bg-primary/5' : 'border-white/8',
              )}
            >
              <span className="text-2xl leading-none">{goal.icon}</span>
              <p
                className={cn(
                  'text-[11px] font-black uppercase tracking-wide text-center',
                  selected ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {goal.label}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PhysicalStatsSection;
