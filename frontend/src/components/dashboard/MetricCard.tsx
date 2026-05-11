import React from 'react';

import { cn } from '../../lib/utils';

interface MetricCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  unit?: string;
  subLabel?: string;
  subValue?: string | number;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  unit,
  subLabel,
  subValue,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-surface-container rounded-2xl p-5 border border-white/5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="h-2.5 w-1/2 bg-white/10 rounded" />
        </div>
        <div className="h-8 w-2/3 bg-white/10 rounded mb-2" />
        <div className="h-2.5 w-1/3 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('material-symbols-outlined text-[16px]', iconColor)}>{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-on-surface tracking-tighter leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-on-surface-variant font-medium lowercase">{unit}</span>
        )}
      </div>

      {/* Sub info */}
      {subLabel && subValue !== undefined && (
        <p className="text-[9px] text-on-surface-variant font-medium mt-2 opacity-60">
          {subLabel}: <span className="text-on-surface font-black">{subValue}</span>
        </p>
      )}
    </div>
  );
};

export default MetricCard;
