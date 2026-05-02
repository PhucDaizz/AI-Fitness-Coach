import React from 'react';

import { cn } from '../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Step1Data {
  dateOfBirth: string; // "1998-05-15"
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

// ── Constants ──────────────────────────────────────────────────────────────
const FITNESS_LEVELS = [
  { value: 'beginner' as const, label: 'Beginner', sub: '< 6 Months training' },
  { value: 'intermediate' as const, label: 'Intermediate', sub: '6–24 Months training' },
  { value: 'advanced' as const, label: 'Advanced', sub: '> 2 Years training' },
];

const FITNESS_GOALS = [
  { value: 'weight_loss' as const, label: 'Fat Loss', icon: '🔥' },
  { value: 'muscle_gain' as const, label: 'Muscle Gain', icon: '💪' },
  { value: 'endurance' as const, label: 'Endurance', icon: '⏱️' },
  { value: 'flexibility' as const, label: 'Flexibility', icon: '🤸' },
  { value: 'maintenance' as const, label: 'Maintain', icon: '🔄' },
];

const GENDERS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'other' as const, label: 'Other' },
];

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

// ── Main Component ─────────────────────────────────────────────────────────
const Step1Personal: React.FC<Step1PersonalProps> = ({ data, onChange, errors = {} }) => {
  return (
    <div className="relative">
      {/* Decorative step number */}
      <span className="absolute right-0 top-0 text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        01
      </span>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[40px] md:text-[48px] font-black uppercase tracking-tight leading-none">
          BUILD YOUR <span className="text-primary italic">PROFILE</span>
        </h1>
        <p className="text-on-surface-variant text-sm mt-2 font-medium max-w-lg">
          Precision starts with data. Define your current state to calibrate your AI coach.
        </p>
      </div>

      {/* ── Section 1: Physical data ───────────────────────────────── */}
      <SectionLabel>Physical Data</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        <InputField label="Date of Birth" icon="calendar_month" error={errors.dateOfBirth}>
          <input
            type="date"
            value={data.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="bg-transparent border-none outline-none text-on-surface text-[15px] font-semibold w-full placeholder:text-outline"
          />
        </InputField>

        <InputField label="Weight (KG)" icon="monitor_weight" error={errors.weightKg}>
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

        <InputField label="Height (CM)" icon="height" error={errors.heightCm}>
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

      {/* ── Section 2: Gender ──────────────────────────────────────── */}
      <SectionLabel>Biological Profile</SectionLabel>
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
            {g.label}
          </button>
        ))}
      </div>

      {/* ── Section 3: Fitness Level ───────────────────────────────── */}
      <SectionLabel>Current Experience</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {FITNESS_LEVELS.map((lvl) => {
          const selected = data.fitnessLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              onClick={() => onChange({ fitnessLevel: lvl.value })}
              className={cn(
                'relative bg-surface-container border rounded-xl p-4 text-left transition-all hover:border-primary/30',
                selected ? 'border-primary bg-primary/5' : 'border-white/8',
              )}
            >
              {/* Check indicator */}
              <span
                className={cn(
                  'absolute top-3 right-3 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all',
                  selected ? 'bg-primary border-primary' : 'border-white/20 bg-transparent',
                )}
              >
                {selected && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="#1a2e00"
                      strokeWidth="2"
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
              <p className="text-[11px] text-on-surface-variant/60 font-medium">{lvl.sub}</p>
            </button>
          );
        })}
      </div>

      {/* ── Section 4: Fitness Goal ────────────────────────────────── */}
      <SectionLabel>Primary Objective</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {FITNESS_GOALS.map((goal) => {
          const selected = data.fitnessGoal === goal.value;
          return (
            <button
              key={goal.value}
              onClick={() => onChange({ fitnessGoal: goal.value })}
              className={cn(
                'relative bg-surface-container border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/30',
                selected ? 'border-primary bg-primary/5' : 'border-white/8',
              )}
            >
              <span
                className={cn(
                  'absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all',
                  selected ? 'bg-primary border-primary' : 'border-white/20 bg-transparent',
                )}
              >
                {selected && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
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
              <span className="text-2xl leading-none">{goal.icon}</span>
              <p
                className={cn(
                  'text-[11px] font-black uppercase tracking-wide',
                  selected ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {goal.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1Personal;
