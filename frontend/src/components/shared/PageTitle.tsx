import React from 'react';

import { cn } from '../../lib/utils';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';

interface PageTitleProps {
  title: string;
  highlight?: string; // word in title colored with primary
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode; // top-right slot: add button, filter, etc.
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  highlight,
  subtitle,
  breadcrumbs,
  action,
  className,
}) => {
  // Render title, optionally highlighting one word with primary color
  const renderTitle = () => {
    if (!highlight) {
      return <span>{title}</span>;
    }
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-primary">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className={cn('flex flex-col md:flex-row md:items-end justify-between gap-4', className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-2" />
        )}

        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
          {renderTitle()}
        </h1>

        {subtitle && <p className="mt-2 text-sm text-on-surface-variant font-medium">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageTitle;
