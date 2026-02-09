import { ReactNode } from 'react';
import { Card } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface SectionCardV2Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export const SectionCardV2 = ({
  title,
  subtitle,
  children,
  className,
}: SectionCardV2Props) => {
  return (
    <Card className={cn('rounded-xl border bg-card p-4', className)}>
      {(title || subtitle) && (
        <div className="mb-4 space-y-1 border-b pb-3">
          {title ? (
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      )}
      {children}
    </Card>
  );
};
