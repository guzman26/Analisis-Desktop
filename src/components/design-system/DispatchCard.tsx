import React from 'react';
import { Dispatch } from '@/types';
import './SalesCard.css'; // Reuse SalesCard styles

export interface DispatchCardProps {
  dispatch: Dispatch;
  onViewDetails?: (dispatch: Dispatch) => void;
  onEdit?: (dispatch: Dispatch) => void;
  onApprove?: (dispatch: Dispatch) => void;
  onCancel?: (dispatch: Dispatch) => void;
  isApproving?: boolean;
  className?: string;
}

/**
 * DispatchCard component displays dispatch information in a card format
 */
const DispatchCard: React.FC<DispatchCardProps> = ({
  dispatch,
  onViewDetails,
  onEdit,
  onApprove,
  onCancel,
  isApproving,
  className,
}) => {
  // Format date in Spanish format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format time from ISO string
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get state badge color
  const getStateBadgeClass = (estado: string) => {
    switch (estado) {
      case 'DRAFT':
        return 'state-badge draft';
      case 'APPROVED':
        return 'state-badge approved';
      case 'CANCELLED':
        return 'state-badge cancelled';
      default:
        return 'state-badge';
    }
  };

  // Get state label in Spanish
  const getStateLabel = (estado: string) => {
    switch (estado) {
      case 'DRAFT':
        return 'Borrador';
      case 'APPROVED':
        return 'Aprobado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const canEdit = dispatch.estado === 'DRAFT';
  const canApprove = dispatch.estado === 'DRAFT';
  const canCancel = dispatch.estado === 'DRAFT';

  return (
    <div className={`sales-card dispatch-card ${className || ''}`}>
      {/* Header: Folio, Date, State */}
      <div className="sale-header">
        <div className="sale-header-left">
          <span className="sale-date">{formatDate(dispatch.fecha)}</span>
          <span className="customer-name">{dispatch.destino}</span>
        </div>
        <div className={`${getStateBadgeClass(dispatch.estado)}`}>
          {getStateLabel(dispatch.estado)}
        </div>
      </div>

      {/* Folio */}
      <div className="dispatch-folio">
        <strong>Folio:</strong> {dispatch.folio}
      </div>

      {/* Key Information */}
      <div className="sale-metrics">
        <div className="metric-badge boxes-badge">
          <span className="metric-label">Pallets</span>
          <span className="metric-value">{dispatch.pallets.length}</span>
        </div>
        <div className="metric-badge pallets-badge">
          <span className="metric-label">Hora Llegada</span>
          <span className="metric-value">{formatTime(dispatch.horaLlegada)}</span>
        </div>
      </div>

      {/* Transport Info */}
      <div className="dispatch-info">
        <div className="info-row">
          <span className="info-label">Patente:</span>
          <span className="info-value">{dispatch.patenteCamion}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Chofer:</span>
          <span className="info-value">{dispatch.nombreChofer}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Despachador:</span>
          <span className="info-value">{dispatch.despachador}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Cargador:</span>
          <span className="info-value">{dispatch.cargador}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Sello:</span>
          <span className="info-value">{dispatch.numeroSello}</span>
        </div>
      </div>

      {/* Pallets: Compact inline chips */}
      {dispatch.pallets.length > 0 && (
        <div className="pallets-compact">
          {dispatch.pallets.map((palletCode: string, index: number) => (
            <div key={index} className="pallet-chip" title={palletCode}>
              <span className="pallet-id-short">
                {palletCode.length > 12
                  ? `${palletCode.substring(0, 8)}...`
                  : palletCode}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onViewDetails || onEdit || onApprove || onCancel) && (
        <div className="sale-actions">
          {onViewDetails && (
            <button
              className="action-button view-details-btn"
              onClick={() => onViewDetails(dispatch)}
              title="Ver los detalles completos de este despacho"
            >
              Ver Detalles
            </button>
          )}
          {onEdit && canEdit && (
            <button
              className="action-button edit-btn"
              onClick={() => onEdit(dispatch)}
              title="Editar este despacho"
            >
              Editar
            </button>
          )}
          {onApprove && canApprove && (
            <button
              className="action-button confirm-btn"
              onClick={() => onApprove(dispatch)}
              disabled={isApproving}
              title="Confirmar y aprobar este despacho"
            >
              {isApproving ? 'Aprobando...' : 'Confirmar'}
            </button>
          )}
          {onCancel && canCancel && (
            <button
              className="action-button return-btn"
              onClick={() => onCancel(dispatch)}
              title="Cancelar este despacho"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DispatchCard;

