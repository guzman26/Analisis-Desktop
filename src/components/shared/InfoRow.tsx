import React from 'react';
import { cn } from '@/lib/utils';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoRow = ({ icon, label, value, className }: InfoRowProps) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/40',
      className
    )}
  >
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  </div>
);

export default InfoRow;
