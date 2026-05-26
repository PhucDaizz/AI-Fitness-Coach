import React from 'react';
import { useTranslation } from 'react-i18next';

import { ENVIRONMENTS, EQUIPMENT_LIST } from '../../config/onboarding.constant';
import { cn } from '../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Step2Data {
  environment: 'gym' | 'home' | 'outdoor';
  equipment: string[];
}

interface Step2EquipmentProps {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
  errors?: Partial<Record<keyof Step2Data, string>>;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="block w-8 h-px bg-on-surface-variant/50" />
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
      {children}
    </span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const Step2Equipment: React.FC<Step2EquipmentProps> = ({ data, onChange, errors = {} }) => {
  const { t, i18n } = useTranslation();

  // Chỉ home mới cho user tự chọn
  const showEquipmentPicker = data.environment === 'home';
  const isGymEnvironment = data.environment === 'gym';

  const toggleEquipment = (value: string) => {
    const current = data.equipment;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ equipment: next });
  };

  return (
    <div className="relative">
      {/* Decorative step number */}
      <span className="absolute right-0 top-0 text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        02
      </span>

      {/* Page title */}
      <div className="mb-10">
        <h1 className="text-[36px] md:text-[48px] font-black uppercase tracking-tight leading-[1.05]">
          {t('onboarding.step2.title')}{' '}
          <span className="block text-primary italic">{t('onboarding.step2.title_italic')}</span>
        </h1>
      </div>

      {/* ── Section 1: Environment ───────────────────────────────────── */}
      <SectionLabel>{t('onboarding.step2.select_space')}</SectionLabel>
      {errors.environment && (
        <p className="text-[11px] text-error font-semibold mb-3">{errors.environment}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {ENVIRONMENTS.map((env) => {
          const selected = data.environment === env.value;
          return (
            <button
              key={env.value}
              onClick={() => {
                // Reset equipment về [] khi đổi environment bất kỳ
                onChange({
                  environment: env.value,
                  equipment: [],
                });
              }}
              className={cn(
                'relative bg-surface-container border rounded-xl p-6 text-left transition-all hover:border-primary/30 flex flex-col gap-3',
                selected ? 'border-primary bg-primary/[0.04]' : 'border-white/8',
              )}
            >
              {/* Checkmark */}
              {selected && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="#1a2e00"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <span
                className={cn(
                  'transition-colors',
                  selected ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {env.icon}
              </span>

              <div>
                <p className="text-[15px] font-bold mb-1.5 text-on-surface">
                  {t(`onboarding.step2.environments.${env.value}.label`)}
                </p>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  {t(`onboarding.step2.environments.${env.value}.desc`)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Section 2: Equipment ─────────────────────────────────────── */}

      {/* Gym: tất cả auto-tick, read-only */}
      {isGymEnvironment && (
        <>
          <SectionLabel>{t('onboarding.step2.access_gear')}</SectionLabel>
          <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
              auto_awesome
            </span>
            <p className="text-[13px] text-on-surface-variant font-medium">
              {t('onboarding.step2.gym_auto_msg')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-10">
            {EQUIPMENT_LIST.map((item) => (
              <div
                key={item.value}
                className="relative bg-surface-container border border-primary bg-primary/[0.04] rounded-xl px-5 py-3.5 flex items-center justify-between cursor-not-allowed opacity-70"
              >
                <div className="text-left">
                  <p className="text-[13px] font-bold text-on-surface">
                    {i18n.language === 'vi' ? item.labelVi : item.label}
                  </p>
                </div>

                {/* Tick cố định, không interactive */}
                <span className="w-7 h-7 rounded-full bg-primary border-primary border-2 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="#1a2e00"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Home: user tự chọn equipment */}
      {showEquipmentPicker && (
        <>
          <SectionLabel>{t('onboarding.step2.access_gear')}</SectionLabel>
          <p className="text-[18px] font-bold text-on-surface mb-5">
            {t('onboarding.step2.gear_question')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-10">
            {EQUIPMENT_LIST.map((item) => {
              const selected = data.equipment.includes(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => toggleEquipment(item.value)}
                  className={cn(
                    'relative bg-surface-container border rounded-xl px-5 py-3.5 flex items-center justify-between transition-all hover:border-primary/30',
                    selected ? 'border-primary bg-primary/[0.04]' : 'border-white/8',
                  )}
                >
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-on-surface">
                      {i18n.language === 'vi' ? item.labelVi : item.label}
                    </p>
                  </div>

                  {/* Toggle circle */}
                  <span
                    className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      selected
                        ? 'bg-primary border-primary'
                        : 'bg-transparent border-on-surface-variant/30',
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
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Outdoor: không có equipment */}
      {data.environment === 'outdoor' && (
        <div className="mb-10 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
            park
          </span>
          <p className="text-[13px] text-on-surface-variant font-medium">
            {t('onboarding.step2.outdoor_msg')}
          </p>
        </div>
      )}

      {/* ── AI Coach Insights banner ──────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden h-[90px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 flex items-center gap-3 h-full px-5">
          <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>
              lightbulb
            </span>
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">
              {t('onboarding.step2.ai_insights')}
            </p>
            <p className="text-[12px] text-on-surface-variant font-medium">
              {data.environment === 'gym'
                ? t('onboarding.step2.insight_gym')
                : data.environment === 'outdoor'
                  ? t('onboarding.step2.insight_outdoor')
                  : t('onboarding.step2.insight_home')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Equipment;
