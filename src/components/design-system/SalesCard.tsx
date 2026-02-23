import React from 'react';
import { Sale } from '@/types';
import './SalesCard.css';

export interface SalesCardProps {
  sale: Sale;
  onViewDetails?: (sale: Sale) => void;
  onPrint?: (sale: Sale) => void;
  onConfirm?: (sale: Sale) => void;
  onReturn?: (sale: Sale) => void;
  onAddBoxes?: (sale: Sale) => void;
  onDispatch?: (sale: Sale) => void;
  onComplete?: (sale: Sale) => void;
  isConfirming?: boolean;
  className?: string;
}

/**
 * SalesCard component displays sale information in an enhanced macOS-styled card
 * with modern layout and interactive elements
 */
const SalesCard: React.FC<SalesCardProps> = ({
  sale,
  onViewDetails,
  onPrint,
  onConfirm,
  onReturn,
  onAddBoxes,
  onDispatch,
  onComplete,
  isConfirming,
  className,
}) => {
  // Format date in Spanish format with improved formatting
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

  // Calculate total boxes from items, boxes array, or totalBoxes
  const getTotalBoxes = (sale: Sale): number => {
    if (sale.totalBoxes !== undefined) {
      return sale.totalBoxes;
    }
    if (sale.boxes && Array.isArray(sale.boxes)) {
      return sale.boxes.length;
    }
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.reduce(
        (total: number, item: any) => total + (item.boxIds?.length || 0),
        0
      );
    }
    return 0;
  };

  // Get pallets count
  const getPalletsCount = (sale: Sale): number => {
    if (sale.pallets && Array.isArray(sale.pallets)) {
      return sale.pallets.length;
    }
    if (sale.items && Array.isArray(sale.items)) {
      return sale.items.length;
    }
    return 0;
  };

  // Get items structure - prefer items, otherwise reconstruct from pallets/boxes
  const getItems = (sale: Sale): any[] => {
    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items;
    }
    // Reconstruct from pallets and boxes arrays
    if (
      sale.pallets &&
      sale.boxes &&
      Array.isArray(sale.pallets) &&
      Array.isArray(sale.boxes)
    ) {
      const items: any[] = [];
      const boxesPerPallet = Math.ceil(sale.boxes.length / sale.pallets.length);
      let boxIndex = 0;

      for (const palletId of sale.pallets) {
        const boxIds = sale.boxes.slice(boxIndex, boxIndex + boxesPerPallet);
        if (boxIds.length > 0) {
          items.push({ palletId, boxIds });
        }
        boxIndex += boxesPerPallet;
      }

      return items;
    }
    return [];
  };

  // Format sale ID to make it more readable
  const formatSaleId = (id: string): string => {
    // Only show the first 8 characters if ID is long
    return id.length > 12 ? `${id.substring(0, 8)}...` : id;
  };

  const items = getItems(sale);
  const hasPallets = items.length > 0;
  const requestedBoxesByCalibre =
    sale.metadata?.requestedBoxesByCalibre &&
    sale.metadata.requestedBoxesByCalibre.length > 0
      ? sale.metadata.requestedBoxesByCalibre
      : null;
  const confirmValidation = (() => {
    if (requestedBoxesByCalibre) {
      const hasMissing = requestedBoxesByCalibre.some((req: any) => {
        const current = sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
        return current < req.boxCount;
      });
      if (hasMissing) {
        return {
          canConfirm: false,
          reason: 'Debe completar las cajas solicitadas por calibre antes de confirmar',
        };
      }

      const hasExcess = requestedBoxesByCalibre.some((req: any) => {
        const current = sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
        return current > req.boxCount;
      });
      if (hasExcess) {
        return {
          canConfirm: false,
          reason: 'Hay exceso de cajas en uno o más calibres',
        };
      }

      return { canConfirm: true, reason: '' };
    }

    const hasAnyInventory = getTotalBoxes(sale) > 0 || getPalletsCount(sale) > 0;
    return {
      canConfirm: hasAnyInventory,
      reason: hasAnyInventory
        ? ''
        : 'La venta debe tener al menos una caja o pallet para confirmar',
    };
  })();

  return (
    <div className={`sales-card ${className || ''}`}>
      {/* Header: Date, Customer, Sale ID in one line */}
      <div className="sale-header">
        <div className="sale-header-left">
          <span className="sale-date">{formatDate(sale.createdAt)}</span>
          <span className="customer-name">
            {sale.customerName ||
              sale.customerInfo?.name ||
              'Cliente sin nombre'}
          </span>
        </div>
        <div className="sale-id-badge" title={sale.saleId}>
          {sale.saleNumber || formatSaleId(sale.saleId)}
        </div>
      </div>

      {/* Key Metrics: Boxes, Pallets, Eggs in compact badges */}
      <div className="sale-metrics">
        <div className="metric-badge boxes-badge">
          <span className="metric-label">Cajas</span>
          <span className="metric-value">
            {getTotalBoxes(sale)}
            {sale.metadata?.totalRequestedBoxes && (
              <span className="metric-suffix">
                /{sale.metadata.totalRequestedBoxes}
              </span>
            )}
          </span>
        </div>

        {hasPallets && (
          <div className="metric-badge pallets-badge">
            <span className="metric-label">Pallets</span>
            <span className="metric-value">{getPalletsCount(sale)}</span>
          </div>
        )}

        {sale.totalEggs !== undefined && sale.totalEggs > 0 && (
          <div className="metric-badge eggs-badge">
            <span className="metric-label">Huevos</span>
            <span className="metric-value">
              {sale.totalEggs.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Calibre Progress: Compact inline badges */}
      {requestedBoxesByCalibre && (
        <div className="calibre-progress-compact">
          {requestedBoxesByCalibre.map((req: any) => {
            const current = sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
            const isComplete = current >= req.boxCount;
            return (
              <div
                key={req.calibre}
                className={`calibre-badge ${isComplete ? 'complete' : ''}`}
                title={`Calibre ${req.calibre}: ${current} / ${req.boxCount}`}
              >
                <span className="calibre-number">{req.calibre}</span>
                <span className="calibre-ratio">
                  {current}/{req.boxCount}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pallets: Compact inline chips */}
      {hasPallets && (
        <div className="pallets-compact">
          {items.map((item: any, index: number) => (
            <div key={index} className="pallet-chip" title={item.palletId}>
              <span className="pallet-id-short">
                {item.palletId.length > 12
                  ? `${item.palletId.substring(0, 8)}...`
                  : item.palletId}
              </span>
              <span className="pallet-box-count">
                {item.boxIds?.length || 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Notes: Only if present */}
      {sale.notes && (
        <div className="sale-notes-compact">
          <span className="notes-icon">📝</span>
          <span className="notes-text">{sale.notes}</span>
        </div>
      )}

      {/* Actions */}
      {(onViewDetails ||
        onPrint ||
        onConfirm ||
        onReturn ||
        onAddBoxes ||
        onDispatch ||
        onComplete) && (
        <div className="sale-actions">
          {onViewDetails && (
            <button
              className="action-button view-details-btn"
              onClick={() => onViewDetails(sale)}
              title="Ver los detalles completos de esta venta"
            >
              Ver Detalles
            </button>
          )}
          {onPrint && (
            <button
              className="action-button print-btn"
              onClick={() => onPrint(sale)}
              title="Imprimir comprobante de venta"
            >
              Imprimir
            </button>
          )}
          {onConfirm && (
            <button
              className="action-button confirm-btn"
              onClick={() => onConfirm(sale)}
              disabled={isConfirming || !confirmValidation.canConfirm}
              title={confirmValidation.reason || undefined}
            >
              {isConfirming ? 'Confirmando...' : 'Confirmar'}
            </button>
          )}
          {onReturn && (
            <button
              className="action-button return-btn"
              onClick={() => onReturn(sale)}
              title="Devolver cajas de esta venta"
            >
              Devolver
            </button>
          )}
          {onAddBoxes && (
            <button
              className="action-button add-boxes-btn"
              onClick={() => onAddBoxes(sale)}
              title="Agregar más cajas a esta venta"
            >
              Agregar Cajas
            </button>
          )}
          {onDispatch && (
            <button
              className="action-button dispatch-btn"
              onClick={() => onDispatch(sale)}
              title="Marcar como despachada"
            >
              Despachar
            </button>
          )}
          {onComplete && (
            <button
              className="action-button complete-btn"
              onClick={() => onComplete(sale)}
              title="Marcar como completada"
            >
              Completar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesCard;
