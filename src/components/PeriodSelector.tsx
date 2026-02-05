import React from 'react';
import { Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { PeriodType, PeriodRange } from '@/utils/metricsAggregation';

interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;
  customStart?: Date;
  customEnd?: Date;
  onCustomDatesChange?: (start: Date, end: Date) => void;
  periodRange: PeriodRange;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  onPeriodTypeChange,
  customStart,
  customEnd,
  onCustomDatesChange,
  periodRange,
}) => {
  const periodButtons: Array<{ type: PeriodType; label: string }> = [
    { type: 'week', label: 'Semana' },
    { type: 'month', label: 'Mes' },
    { type: 'quarter', label: '3 Meses' },
    { type: 'semester', label: 'Semestre' },
    { type: 'year', label: 'Año' },
    { type: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {periodButtons.map(({ type, label }) => (
          <Button
            key={type}
            variant={periodType === type ? 'primary' : 'secondary'}
            size="small"
            onClick={() => onPeriodTypeChange(type)}
          >
            {label}
          </Button>
        ))}
      </div>

      {periodType === 'custom' && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px] space-y-1">
            <Label className="text-xs">Fecha Inicio</Label>
            <Input
              type="date"
              value={
                customStart
                  ? customStart.toISOString().split('T')[0]
                  : periodRange.start.toISOString().split('T')[0]
              }
              onChange={(e) => {
                if (onCustomDatesChange && e.target.value) {
                  const newStart = new Date(e.target.value);
                  const end = customEnd || periodRange.end;
                  onCustomDatesChange(newStart, end);
                }
              }}
            />
          </div>
          <div className="flex-1 min-w-[180px] space-y-1">
            <Label className="text-xs">Fecha Fin</Label>
            <Input
              type="date"
              value={
                customEnd
                  ? customEnd.toISOString().split('T')[0]
                  : periodRange.end.toISOString().split('T')[0]
              }
              onChange={(e) => {
                if (onCustomDatesChange && e.target.value) {
                  const start = customStart || periodRange.start;
                  const newEnd = new Date(e.target.value);
                  onCustomDatesChange(start, newEnd);
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {periodRange.label}
        </span>
      </div>
    </div>
  );
};

export default PeriodSelector;
