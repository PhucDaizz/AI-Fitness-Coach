import React from 'react';
import { useTranslation } from 'react-i18next';

import type { FitnessProfile } from '../../../services/fitness.service';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InjuriesSectionProps {
  data: FitnessProfile;
  onChange: <K extends keyof FitnessProfile>(key: K, value: FitnessProfile[K]) => void;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const InjuriesSection: React.FC<InjuriesSectionProps> = ({ data, onChange }) => {
  const { t } = useTranslation();

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-error" style={{ fontSize: 18 }}>
            healing
          </span>
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            {t('fitness_profile.injuries.title')}
          </h2>
          <p className="text-[11px] text-on-surface-variant">
            {t('fitness_profile.injuries.subtitle')}
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={data.injuries ?? ''}
          onChange={(e) => onChange('injuries', e.target.value)}
          placeholder={t('fitness_profile.injuries.placeholder')}
          rows={5}
          className="w-full bg-surface-container border border-white/10 rounded-xl p-4 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors resize-none caret-primary leading-relaxed"
        />
        {/* Character count */}
        <span className="absolute bottom-3 right-4 text-[10px] text-on-surface-variant/40 font-bold">
          {t('fitness_profile.injuries.char_count', { count: (data.injuries ?? '').length })}
        </span>
      </div>

      {/* Info banner */}
      <div className="mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-surface-container border border-white/8">
        <span className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 13 }}>
            info
          </span>
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-1">
            {t('fitness_profile.injuries.note')}
          </p>
          <p className="text-[12px] text-on-surface-variant/70 leading-relaxed">
            {t('fitness_profile.injuries.info')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default InjuriesSection;
