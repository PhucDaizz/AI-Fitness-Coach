import React from 'react';

import { cn } from '../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Step3Data {
  availableDays: string[];
  sessionMinutes: 30 | 45 | 60 | 90;
  trainingWindow: 'morning' | 'midday' | 'afternoon' | 'night';
}

interface Step3ScheduleProps {
  data: Step3Data;
  onChange: (data: Partial<Step3Data>) => void;
  errors?: Partial<Record<keyof Step3Data, string>>;
}

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS = [
  { value: 'Monday', label: 'MON' },
  { value: 'Tuesday', label: 'TUE' },
  { value: 'Wednesday', label: 'WED' },
  { value: 'Thursday', label: 'THU' },
  { value: 'Friday', label: 'FRI' },
  { value: 'Saturday', label: 'SAT' },
  { value: 'Sunday', label: 'SUN' },
];

const SESSION_OPTIONS: { value: 30 | 45 | 60 | 90; tag: string }[] = [
  { value: 30, tag: 'EXPRESS' },
  { value: 45, tag: 'BALANCED' },
  { value: 60, tag: 'ENDURANCE' },
  { value: 90, tag: 'ELITE' },
];

const TRAINING_WINDOWS = [
  { value: 'morning' as const, label: 'MORNING' },
  { value: 'midday' as const, label: 'MIDDAY' },
  { value: 'afternoon' as const, label: 'AFTERNOON' },
  { value: 'night' as const, label: 'NIGHT' },
];

// ── Helper ─────────────────────────────────────────────────────────────────
function getPulseRecommendation(days: string[]): string {
  const n = days.length;
  if (n >= 5)
    return `A ${n}-day active split provides optimal recovery windows for muscle hypertrophy.`;
  if (n === 4) return 'A 4-day upper/lower split maximises strength and recovery balance.';
  if (n <= 3) return `${n} sessions/week is ideal for beginners — quality over quantity.`;
  return 'Select your available days to get a personalised AI recommendation.';
}

// ── Main Component ─────────────────────────────────────────────────────────
const Step3Schedule: React.FC<Step3ScheduleProps> = ({ data, onChange, errors = {} }) => {
  const toggleDay = (day: string) => {
    const current = data.availableDays;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange({ availableDays: next });
  };

  return (
    <div className="relative">
      {/* Decorative step number */}
      <span className="absolute right-0 top-0 text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        03
      </span>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[40px] md:text-[52px] font-black uppercase tracking-tight leading-[0.95]">
          SCHEDULE <span className="block text-primary italic">ENGINE</span>
        </h1>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Left: Operational Days */}
        <div className="bg-surface-container border border-white/8 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-1 h-5 rounded-full bg-secondary" />
            <h2 className="text-[15px] font-bold text-on-surface">Operational Days</h2>
          </div>

          {errors.availableDays && (
            <p className="text-[11px] text-error font-semibold mb-3">{errors.availableDays}</p>
          )}

          {/* Day circles grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-5">
            {DAYS.map((day) => {
              const active = data.availableDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                    {day.label}
                  </span>
                  <span
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-white/15 bg-surface-container-high',
                    )}
                  >
                    {active ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <polyline
                          points="2,7 5.5,10.5 12,3.5"
                          stroke="#b1ff24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-on-surface-variant/20" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pulse Recommendation */}
          <div className="bg-surface-container-highest border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
                bolt
              </span>
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">
                Pulse Recommendation
              </p>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                Based on your metabolism profile from Step 2,{' '}
                {getPulseRecommendation(data.availableDays)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Intensity Period */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container border border-white/8 rounded-xl p-6 flex-1">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-1 h-5 rounded-full bg-secondary" />
              <h2 className="text-[15px] font-bold text-on-surface">Intensity Period</h2>
            </div>

            <div className="flex flex-col gap-2">
              {SESSION_OPTIONS.map((opt) => {
                const selected = data.sessionMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ sessionMinutes: opt.value })}
                    className={cn(
                      'flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all',
                      selected
                        ? 'border-primary bg-primary/[0.04]'
                        : 'border-white/8 bg-surface-container-high hover:border-primary/30',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[14px] font-black uppercase tracking-wide',
                        selected ? 'text-primary' : 'text-on-surface',
                      )}
                    >
                      {opt.value} Minutes
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border',
                        selected
                          ? 'border-primary/40 text-primary bg-primary/10'
                          : 'border-white/15 text-on-surface-variant',
                      )}
                    >
                      {opt.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Pulse Sync card */}
          <div className="relative rounded-xl overflow-hidden h-[90px] flex-shrink-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&auto=format&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-4 h-full flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
                Live Pulse Sync
              </p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Your coach will automatically adjust session blocks if your wearable detects high
                fatigue scores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Training Window (full width) ──────────────────── */}
      <div className="bg-surface-container border border-white/8 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-1 h-5 rounded-full bg-secondary" />
          <h2 className="text-[15px] font-bold text-on-surface">Primary Training Window</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TRAINING_WINDOWS.map((tw) => {
            const selected = data.trainingWindow === tw.value;
            return (
              <button
                key={tw.value}
                onClick={() => onChange({ trainingWindow: tw.value })}
                className={cn(
                  'py-3 rounded-full border text-[11px] font-black uppercase tracking-[0.15em] transition-all',
                  selected
                    ? 'bg-primary border-primary text-on-primary'
                    : 'bg-transparent border-white/15 text-on-surface-variant hover:border-primary/40 hover:text-white',
                )}
                style={selected ? { boxShadow: '0 0 12px rgba(177,255,36,0.25)' } : undefined}
              >
                {tw.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step3Schedule;
