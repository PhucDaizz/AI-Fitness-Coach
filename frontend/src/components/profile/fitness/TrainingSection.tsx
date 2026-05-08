import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DAYS,
  ENVIRONMENTS,
  EQUIPMENT_LIST,
  SESSION_OPTIONS,
} from '../../../config/onboarding.constant';
import { cn } from '../../../lib/utils';
import type { FitnessProfile } from '../../../services/fitness.service';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TrainingSetupSectionProps {
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

// ── Main Component ─────────────────────────────────────────────────────────────

const TrainingSetupSection: React.FC<TrainingSetupSectionProps> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();

  const toggleEquipment = (value: string) => {
    const current = data.equipment;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange('equipment', next);
  };

  const toggleDay = (day: string) => {
    const current = data.availableDays;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange('availableDays', next);
  };

  const showEquipment = data.environment !== 'outdoor';

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
            fitness_center
          </span>
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">{t('fitness_profile.training.title')}</h2>
          <p className="text-[11px] text-on-surface-variant">{t('fitness_profile.training.subtitle')}</p>
        </div>
      </div>

      {/* Section 1: Environment */}
      <SectionLabel>{t('fitness_profile.training.environment')}</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {ENVIRONMENTS.map((env) => {
          const selected = data.environment === env.value;
          return (
            <button
              key={env.value}
              type="button"
              onClick={() => {
                onChange('environment', env.value);
                if (env.value === 'outdoor') {
                  onChange('equipment', []);
                }
              }}
              className={cn(
                'relative bg-surface-container border rounded-xl p-5 text-left transition-all hover:border-primary/30 flex flex-col gap-2.5',
                selected ? 'border-primary bg-primary/[0.04]' : 'border-white/8',
              )}
            >
              <span className={selected ? 'text-primary' : 'text-on-surface-variant'}>
                {env.icon}
              </span>
              <div>
                <p className="text-[14px] font-bold text-on-surface mb-1">{t(`fitness_profile.environments.${env.value}`)}</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">{t(`fitness_profile.environments.${env.value}_desc`)}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Section 2: Equipment */}
      {showEquipment && (
        <>
          <SectionLabel>{t('fitness_profile.training.equipment')}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {EQUIPMENT_LIST.map((item) => {
              const selected = data.equipment.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleEquipment(item.value)}
                  className={cn(
                    'relative bg-surface-container border rounded-xl px-4 py-3 flex items-center justify-between transition-all hover:border-primary/30',
                    selected ? 'border-primary bg-primary/[0.04]' : 'border-white/8',
                  )}
                >
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-on-surface">{t(`fitness_profile.equipment.${item.value}`)}</p>
                  </div>
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      selected
                        ? 'bg-primary border-primary'
                        : 'bg-transparent border-on-surface-variant/30',
                    )}
                  >
                    {selected && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
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
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Outdoor message */}
      {!showEquipment && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
            park
          </span>
          <p className="text-[13px] text-on-surface-variant font-medium">
            {t('fitness_profile.training.outdoor_msg')}
          </p>
        </div>
      )}

      {/* Section 3: Available Days */}
      <SectionLabel>{t('fitness_profile.training.available_days')}</SectionLabel>
      {errors.availableDays && (
        <p className="text-[11px] text-error font-semibold mb-3" data-error="true">
          {errors.availableDays}
        </p>
      )}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {DAYS.map((day) => {
          const active = data.availableDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                {t(`fitness_profile.days.short.${day.value}`)}
              </span>
              <span
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-white/15 bg-surface-container-high hover:border-primary/30',
                )}
              >
                {active ? (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <polyline
                      points="2,7 5.5,10.5 12,3.5"
                      stroke="#b1ff24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/20" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section 4: Session Duration */}
      <SectionLabel>{t('fitness_profile.training.duration')}</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SESSION_OPTIONS.map((opt) => {
          const selected = data.sessionMinutes === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('sessionMinutes', opt.value)}
              className={cn(
                'flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all',
                selected
                  ? 'border-primary bg-primary/[0.04]'
                  : 'border-white/8 bg-surface-container hover:border-primary/30',
              )}
            >
              <span
                className={cn(
                  'text-[13px] font-black uppercase tracking-wide',
                  selected ? 'text-primary' : 'text-on-surface',
                )}
              >
                {t('fitness_profile.training.minutes', { count: opt.value })}
              </span>
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border',
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
    </section>
  );
};

export default TrainingSetupSection;
