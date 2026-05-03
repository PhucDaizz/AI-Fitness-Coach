import React from 'react';
import { Link } from 'react-router-dom';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3 | 4;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}

const STEPS = [
  { num: 1, label: 'Profile' },
  { num: 2, label: 'Equipment' },
  { num: 3, label: 'Schedule' },
  { num: 4, label: 'Injuries' },
];

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  onBack,
  onNext,
  nextLabel = 'Next Step',
  nextDisabled = false,
  isLoading = false,
}) => {
  const progressPct = (currentStep / 4) * 100;
  const stepInfo = STEPS[currentStep - 1];

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="h-14 bg-background/95 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-xl">
        <Link
          to="/"
          className="text-lg font-black italic tracking-tighter text-primary hover:opacity-80 transition-opacity"
        >
          KINETIC AI
        </Link>
        <div className="w-8 h-8 rounded-full bg-surface-container border border-white/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: 18 }}
          >
            person
          </span>
        </div>
      </header>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="bg-background/95 border-b border-white/5 px-6 py-2.5 flex items-center gap-3 sticky top-14 z-10 backdrop-blur-xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
          Step {String(currentStep).padStart(2, '0')} — {stepInfo.label}
        </span>

        <div className="flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              boxShadow: '0 0 8px rgba(177,255,36,0.5)',
            }}
          />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">
          {progressPct}% Complete
        </span>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 h-[60px] bg-background/97 border-t border-white/5 flex items-center justify-between px-6 z-20 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
            style={{ boxShadow: '0 0 6px rgba(177,255,36,0.6)' }}
          />
          Phase: Onboarding
        </div>

        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="h-10 px-5 rounded-full border border-white/15 text-on-surface-variant text-[11px] font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all"
            >
              ← Back
            </button>
          )}

          <button
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="h-10 px-6 rounded-full bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 16px rgba(177,255,36,0.3)' }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `${nextLabel} →`
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
