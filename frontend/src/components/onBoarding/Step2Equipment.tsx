import React from 'react';

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

// ── Constants ──────────────────────────────────────────────────────────────
const ENVIRONMENTS = [
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

const EQUIPMENT_LIST = [
  { value: 'barbell', label: 'Barbell', labelVi: 'Tạ đòn' },
  { value: 'dumbbell', label: 'Dumbbells', labelVi: 'Tạ đơn' },
  { value: 'resistance_band', label: 'Resistance Bands', labelVi: 'Dây kháng lực' },
  { value: 'pullup_bar', label: 'Pull-up Bar', labelVi: 'Xà đơn' },
  { value: 'kettlebell', label: 'Kettlebells', labelVi: 'Tạ bình' },
  { value: 'machine', label: 'Machines', labelVi: 'Máy tập' },
];

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
  const toggleEquipment = (value: string) => {
    const current = data.equipment;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ equipment: next });
  };

  const showEquipment = data.environment !== 'outdoor';

  return (
    <div className="relative">
      {/* Decorative step number */}
      <span className="absolute right-0 top-0 text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
        02
      </span>

      {/* Page title */}
      <div className="mb-10">
        <h1 className="text-[36px] md:text-[48px] font-black uppercase tracking-tight leading-[1.05]">
          WORKOUT{' '}
          <span className="block">
            ENVIRONMENT <span className="text-primary italic">&amp; EQUIPMENT</span>
          </span>
        </h1>
      </div>

      {/* ── Section 1: Environment ───────────────────────────────────── */}
      <SectionLabel>Select Your Space</SectionLabel>
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
                onChange({
                  environment: env.value,
                  // Auto-clear equipment when switching to outdoor
                  ...(env.value === 'outdoor' ? { equipment: [] } : {}),
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
                <p
                  className={cn(
                    'text-[15px] font-bold mb-1.5',
                    selected ? 'text-on-surface' : 'text-on-surface',
                  )}
                >
                  {env.label}
                </p>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">{env.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Section 2: Equipment ─────────────────────────────────────── */}
      {showEquipment && (
        <>
          <SectionLabel>Access to Gear</SectionLabel>
          <p className="text-[18px] font-bold text-on-surface mb-5">
            What equipment do you have access to?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-10">
            {EQUIPMENT_LIST.map((item) => {
              const selected = data.equipment.includes(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => toggleEquipment(item.value)}
                  className={cn(
                    'relative bg-surface-container border rounded-xl px-4 py-3.5 flex items-center justify-between transition-all hover:border-primary/30',
                    selected ? 'border-primary bg-primary/[0.04]' : 'border-white/8',
                  )}
                >
                  <div className="text-left">
                    <p
                      className={cn(
                        'text-[13px] font-bold',
                        selected ? 'text-on-surface' : 'text-on-surface',
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                      {item.labelVi}
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

      {/* Outdoor message */}
      {!showEquipment && (
        <div className="mb-10 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
            park
          </span>
          <p className="text-[13px] text-on-surface-variant font-medium">
            Outdoor training uses bodyweight only — no equipment needed.
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
              AI Coach Insights
            </p>
            <p className="text-[12px] text-on-surface-variant font-medium">
              {data.environment === 'gym'
                ? 'Full gym unlocks barbell programs — highest strength gains potential.'
                : data.environment === 'outdoor'
                  ? 'Outdoor training focus: calisthenics, HIIT, and interval running.'
                  : 'Adapting your plan for Home Training...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Equipment;
