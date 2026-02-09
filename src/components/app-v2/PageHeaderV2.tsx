import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderV2Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeaderV2 = ({
  title,
  description,
  actions,
  className,
}: PageHeaderV2Props) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
};
