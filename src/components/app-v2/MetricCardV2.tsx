import { ReactNode } from 'react';
import { Card } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface MetricCardV2Props {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

export const MetricCardV2 = ({
  label,
  value,
  hint,
  className,
}: MetricCardV2Props) => {
  return (
    <Card
      variant="flat"
      className={cn('rounded-xl border bg-card px-4 py-3', className)}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
};
