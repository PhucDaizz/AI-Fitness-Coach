import React from 'react';

import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: string; // material-symbols icon name
  title: string;
  description?: string;
  action?: React.ReactNode; // e.g. a <LoadingButton>
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
    >
      <span
        className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 animate-pulse select-none"
        aria-hidden="true"
      >
        {icon}
      </span>

      <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-2">{title}</h3>

      {description && (
        <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
