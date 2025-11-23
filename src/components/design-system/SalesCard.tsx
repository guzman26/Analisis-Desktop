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
    if (sale.pallets && sale.boxes && Array.isArray(sale.pallets) && Array.isArray(sale.boxes)) {
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

  return (
    <div className={`sales-card ${className || ''}`}>
      <div className="sale-main-info">
        <div className="sale-date-primary">{formatDate(sale.createdAt)}</div>
        <div className="sale-customer-primary">
          <span className="customer-name">
            {sale.customerInfo?.name || 'Cliente sin nombre'}
          </span>
        </div>
      </div>

      <div className="sale-secondary-info">
        <div className="sale-id-secondary">
          <span className="label">ID:</span>
          <span className="value" title={sale.saleId}>
            {formatSaleId(sale.saleId)}
          </span>
        </div>

        <div className="sale-boxes-info">
          <span className="label">Total Cajas:</span>
          <span className="value">{getTotalBoxes(sale)}</span>
        </div>
      </div>

      <div className="sale-items">
        <span className="items-label">
          Pallets ({getPalletsCount(sale)}):
        </span>
        <div className="pallets-list">
          {(() => {
            const items = getItems(sale);
            if (items.length === 0) {
              return <span className="no-items">No hay pallets disponibles</span>;
            }
            return items.map((item: any, index: number) => (
              <div key={index} className="pallet-item">
                <span className="pallet-id">{item.palletId}</span>
                <span className="box-count">
                  ({item.boxIds?.length || 0} cajas)
                </span>
              </div>
            ));
          })()}
        </div>
      </div>

      {sale.notes && (
        <div className="sale-notes">
          <span className="label">Notas:</span>
          <p className="notes-text">{sale.notes}</p>
        </div>
      )}

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
              disabled={isConfirming}
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
