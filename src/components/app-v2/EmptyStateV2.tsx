import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateV2Props {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyStateV2 = ({
  title,
  description,
  action,
  className,
}: EmptyStateV2Props) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-8 text-center',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
};
