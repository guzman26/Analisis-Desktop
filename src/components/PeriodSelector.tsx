import React from 'react';
import { Button, Input } from '@/components/design-system';
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--macos-space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--macos-space-2)',
          alignItems: 'center',
        }}
      >
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
        <div
          style={{
            display: 'flex',
            gap: 'var(--macos-space-3)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
                display: 'block',
              }}
            >
              Fecha Inicio
            </label>
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
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
                display: 'block',
              }}
            >
              Fecha Fin
            </label>
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
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--macos-space-2)',
          padding: 'var(--macos-space-2) var(--macos-space-3)',
          backgroundColor: 'var(--macos-gray-6)',
          borderRadius: 'var(--macos-radius-medium)',
        }}
      >
        <Calendar style={{ width: '16px', height: '16px', color: 'var(--macos-text-secondary)' }} />
        <span
          className="macos-text-footnote"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          {periodRange.label}
        </span>
      </div>
    </div>
  );
};

export default PeriodSelector;

