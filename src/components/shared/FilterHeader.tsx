import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface FilterHeaderProps {
  title: string;
  icon?: React.ReactNode;
  hasActive?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  onClear?: () => void;
  onToggle?: () => void;
  isExpanded?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const FilterHeader = ({
  title,
  icon,
  hasActive = false,
  disabled = false,
  loadingLabel,
  onClear,
  onToggle,
  isExpanded,
  actions,
  className,
}: FilterHeaderProps) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
    <div className="flex items-center gap-2">
      {icon && <span className="text-primary">{icon}</span>}
      <h3 className="text-base font-medium">{title}</h3>
      {hasActive && <Badge variant="secondary">Activos</Badge>}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {loadingLabel && <Badge variant="outline">{loadingLabel}</Badge>}
      {onClear && (
        <Button
          variant="secondary"
          size="small"
          leftIcon={<X size={14} />}
          onClick={onClear}
          disabled={disabled}
        >
          Limpiar
        </Button>
      )}
      {actions}
      {onToggle && (
        <Button
          variant="secondary"
          size="small"
          onClick={onToggle}
          disabled={disabled}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      )}
    </div>
  </div>
);

export default FilterHeader;
