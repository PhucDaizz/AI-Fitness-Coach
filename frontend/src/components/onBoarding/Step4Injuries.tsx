import React from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Step4Data {
  injuries?: string;
}

interface Step4InjuriesProps {
  data: Step4Data;
  onChange: (data: Partial<Step4Data>) => void;
}

// ── Main Component ─────────────────────────────────────────────────────────
const Step4Injuries: React.FC<Step4InjuriesProps> = ({ data, onChange }) => {
  return (
    <div className="relative min-h-[60vh] flex flex-col">
      {/* Background watermark */}
      <span className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-white/[0.025] leading-none select-none pointer-events-none uppercase tracking-tighter z-0">
        SAFETY
      </span>

      {/* Step indicator */}
      <div className="relative z-10 mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-[64px] font-black text-primary leading-none">04</span>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-on-surface-variant">
            Step 04 of 04
          </span>
        </div>
        <div className="h-[2px] w-full bg-primary rounded-full" style={{ maxWidth: '600px' }} />
      </div>

      {/* Title */}
      <div className="relative z-10 mb-8">
        <h1 className="text-[40px] md:text-[52px] font-black leading-[1.0] mb-4">
          <span className="text-on-surface">Injuries &amp;</span>
          <br />
          <span className="text-primary italic">Limitations</span>
        </h1>
        <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-lg">
          Safety is the foundation of peak performance. Tell us about any physical constraints or
          past injuries.
        </p>
      </div>

      {/* Textarea */}
      <div className="relative z-10 flex-1 mb-8">
        <textarea
          value={data.injuries ?? ''}
          onChange={(e) => {
            // Store raw value; buildPayload will handle empty → undefined
            onChange({ injuries: e.target.value });
          }}
          placeholder="E.g., Lower back pain, bad left knee..."
          rows={6}
          className="w-full bg-transparent border-none outline-none resize-none text-on-surface text-[18px] font-medium placeholder:text-on-surface-variant/30 leading-relaxed caret-primary"
          style={{ maxWidth: '600px' }}
        />
        {/* Subtle bottom border only */}
        <div className="w-full h-px bg-white/10" style={{ maxWidth: '600px' }} />
      </div>

      {/* Info banner */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-surface-container border border-white/8"
        style={{ maxWidth: '560px' }}
      >
        <span className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 15 }}>
            info
          </span>
        </span>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant">
          Our AI will adapt your workout plan to avoid stressing these areas.
        </p>
      </div>
    </div>
  );
};

export default Step4Injuries;
