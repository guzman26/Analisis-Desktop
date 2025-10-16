import React from 'react';
import { getFreshnessInfo, formatAge } from '@/utils/freshnessCalculations';
import './FreshnessIndicator.css';

interface FreshnessIndicatorProps {
  palletCode: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showAge?: boolean;
  className?: string;
}

const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  palletCode,
  size = 'medium',
  showLabel = true,
  showAge = true,
  className = '',
}) => {
  const freshnessInfo = getFreshnessInfo(palletCode);

  if (!freshnessInfo) {
    return null;
  }

  const { ageInDays, freshnessLevel, freshnessLabel, freshnessColor } = freshnessInfo;

  return (
    <div className={`freshness-indicator ${size} ${className}`}>
      <div
        className={`freshness-badge freshness-${freshnessLevel}`}
        style={{ backgroundColor: freshnessColor }}
      >
        {showLabel && <span className="freshness-label">{freshnessLabel}</span>}
        {showAge && <span className="freshness-age">{formatAge(ageInDays)}</span>}
      </div>
    </div>
  );
};

interface FreshnessDetailsProps {
  palletCode: string;
  className?: string;
}

export const FreshnessDetails: React.FC<FreshnessDetailsProps> = ({
  palletCode,
  className = '',
}) => {
  const freshnessInfo = getFreshnessInfo(palletCode);

  if (!freshnessInfo) {
    return <div className={className}>Fecha de producción no disponible</div>;
  }

  const { productionDate, ageInDays, freshnessLabel, freshnessLevel } = freshnessInfo;

  return (
    <div className={`freshness-details ${className}`}>
      <div className="freshness-detail-row">
        <span className="detail-label">Estado:</span>
        <span className={`detail-value freshness-${freshnessLevel}`}>
          {freshnessLabel}
        </span>
      </div>
      <div className="freshness-detail-row">
        <span className="detail-label">Edad:</span>
        <span className="detail-value">{formatAge(ageInDays)}</span>
      </div>
      <div className="freshness-detail-row">
        <span className="detail-label">Producción:</span>
        <span className="detail-value">
          {productionDate.toLocaleDateString('es-CL')}
        </span>
      </div>
    </div>
  );
};

export default FreshnessIndicator;

