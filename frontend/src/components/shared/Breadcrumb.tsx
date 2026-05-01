import React from 'react';
import { Link } from 'react-router-dom';

import { ChevronRight } from 'lucide-react';

import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for current (last) item
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span
                aria-current="page"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href ?? '#'}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}

            {!isLast && <ChevronRight className="h-3 w-3 text-on-surface-variant shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
