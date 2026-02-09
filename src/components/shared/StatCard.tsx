import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const StatCard = ({ label, value, icon, className }: StatCardProps) => (
  <div
    className={cn('rounded-md border bg-card p-3', className)}
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

export default StatCard;
