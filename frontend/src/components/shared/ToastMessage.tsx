import React, { useEffect, useState } from 'react';

import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import type { ToastType } from '../../config/constants';
import { cn } from '../../lib/utils';

export interface ToastMessageProps {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = persistent
  onClose?: () => void;
  className?: string;
}

const CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    containerClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    containerClass: 'border-primary/30 bg-primary/10',
    iconClass: 'text-primary',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    containerClass: 'border-error/30 bg-error/10',
    iconClass: 'text-error',
  },
  warning: {
    icon: <AlertCircle className="h-4 w-4" />,
    containerClass: 'border-yellow-400/30 bg-yellow-400/10',
    iconClass: 'text-yellow-400',
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    containerClass: 'border-secondary/30 bg-secondary/10',
    iconClass: 'text-secondary',
  },
};

const ToastMessage: React.FC<ToastMessageProps> = ({
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const { icon, containerClass, iconClass } = CONFIG[type];

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-sm font-medium transition-all',
        containerClass,
        className,
      )}
    >
      <span className={cn('mt-0.5 shrink-0', iconClass)}>{icon}</span>

      <div className="flex-1">
        {title && <p className="mb-0.5 font-bold text-on-surface">{title}</p>}
        <p className="text-on-surface-variant">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ToastMessage;
