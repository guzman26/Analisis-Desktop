import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ListToolbarV2Props {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export const ListToolbarV2 = ({
  left,
  right,
  className,
}: ListToolbarV2Props) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
};
