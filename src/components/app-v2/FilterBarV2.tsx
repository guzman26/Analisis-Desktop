import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterBarV2Props {
  children: ReactNode;
  className?: string;
}

export const FilterBarV2 = ({ children, className }: FilterBarV2Props) => {
  return (
    <section
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-xl border bg-card px-4 py-3',
        className
      )}
    >
      {children}
    </section>
  );
};
