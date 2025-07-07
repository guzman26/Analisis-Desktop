import React from 'react';
import { Sale } from '@/types';
import './SalesCard.css';

export interface SalesCardProps {
  sale: Sale;
  onViewDetails?: (sale: Sale) => void;
  onPrint?: (sale: Sale) => void;
  onConfirm?: (sale: Sale) => void;
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

  // Calculate total boxes from items
  const getTotalBoxes = (sale: Sale): number => {
    return (
      sale.totalBoxes ||
      sale.items?.reduce(
        (total: number, item: any) => total + (item.boxIds?.length || 0),
        0
      ) ||
      0
    );
  };

  // Format sale ID to make it more readable
  const formatSaleId = (id: string): string => {
    // Only show the first 8 characters if ID is long
    return id.length > 12 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <div className={`sales-card ${className || ''}`}>
      <div className="sale-main-info">
        <div className="sale-date-primary">
          {formatDate(sale.createdAt)}
        </div>
        <div className="sale-customer-primary">
          <span className="customer-name">
            {sale.customerInfo?.name || 'Cliente sin nombre'}
          </span>
        </div>
      </div>

      <div className="sale-secondary-info">
        <div className="sale-id-secondary">
          <span className="label">ID:</span>
          <span className="value" title={sale.saleId}>{formatSaleId(sale.saleId)}</span>
        </div>

        <div className="sale-boxes-info">
          <span className="label">Total Cajas:</span>
          <span className="value">{getTotalBoxes(sale)}</span>
        </div>
      </div>

      <div className="sale-items">
        <span className="items-label">
          Pallets ({sale.items?.length || 0}):
        </span>
        <div className="pallets-list">
          {sale.items?.map((item: any, index: number) => (
            <div key={index} className="pallet-item">
              <span className="pallet-id">{item.palletId}</span>
              <span className="box-count">
                ({item.boxIds?.length || 0} cajas)
              </span>
            </div>
          )) || (
            <span className="no-items">
              No hay pallets disponibles
            </span>
          )}
        </div>
      </div>

      {sale.notes && (
        <div className="sale-notes">
          <span className="label">Notas:</span>
          <p className="notes-text">{sale.notes}</p>
        </div>
      )}

      {(onViewDetails || onPrint || onConfirm) && (
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
        </div>
      )}
    </div>
  );
};

export default SalesCard;
