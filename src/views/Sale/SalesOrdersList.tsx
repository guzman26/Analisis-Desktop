import React, { useContext, useEffect, useState } from 'react';
import { SalesContext } from '@/contexts/SalesContext';
import { Sale } from '@/types';
import SaleDetailModal from '@/components/SaleDetailModal';
import '@/styles/SalesOrdersList.css';

const SalesOrdersList: React.FC = () => {
  const { salesOrdersPaginated } = useContext(SalesContext);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (salesOrdersPaginated && salesOrdersPaginated.data.length === 0) {
      salesOrdersPaginated.refresh();
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const handleLoadMore = () => {
    if (
      salesOrdersPaginated &&
      salesOrdersPaginated.hasMore &&
      !salesOrdersPaginated.loading
    ) {
      salesOrdersPaginated.loadMore();
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  // Early return if context is not available
  if (!salesOrdersPaginated) {
    return (
      <div className="sales-orders-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-orders-list">
      <div className="sales-orders-header">
        <h1>Órdenes de Venta</h1>
        <button
          onClick={() => salesOrdersPaginated.refresh()}
          className="btn btn-secondary refresh-btn"
          disabled={salesOrdersPaginated.loading}
        >
          {salesOrdersPaginated.loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {salesOrdersPaginated.error && (
        <div className="error-message">
          <p>Error al cargar las órdenes: {salesOrdersPaginated.error}</p>
        </div>
      )}

      {salesOrdersPaginated.data.length === 0 &&
      !salesOrdersPaginated.loading ? (
        <div className="no-sales-message">
          <p>No hay órdenes de venta disponibles.</p>
        </div>
      ) : (
        <div className="sales-orders-grid">
          {salesOrdersPaginated.data.map((sale: Sale) => {
            return (
              <div key={sale.saleId} className="sale-card">
                <div className="sale-header">
                  <div className="sale-id">
                    <span className="label">ID:</span>
                    <span className="value">{sale.saleId}</span>
                  </div>
                  <div className="sale-date">{formatDate(sale.createdAt)}</div>
                </div>

                <div className="sale-customer">
                  <div className="customer-info">
                    <span className="label">Cliente:</span>
                    <span className="value">{sale.customerInfo?.name}</span>
                  </div>
                </div>

                <div className="sale-details">
                  <div className="detail-row">
                    <span className="label">Total Cajas:</span>
                    <span className="value">{sale.totalBoxes}</span>
                  </div>

                  {sale.unitPrice && (
                    <div className="detail-row">
                      <span className="label">Precio/Caja:</span>
                      <span className="value">
                        {formatCurrency(sale.unitPrice)}
                      </span>
                    </div>
                  )}

                  {sale.totalAmount && (
                    <div className="detail-row total-amount">
                      <span className="label">Total:</span>
                      <span className="value">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="sale-items">
                  <span className="items-label">
                    Pallets ({sale.items?.length || 0}):
                  </span>
                  <div className="pallets-list">
                    {sale.items?.map((item, index) => (
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

                <div className="sale-actions">
                  {sale.reportUrl && (
                    <a
                      href={sale.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-small"
                    >
                      Ver Reporte
                    </a>
                  )}
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleViewDetails(sale)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {salesOrdersPaginated.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando órdenes de venta...</p>
        </div>
      )}

      {salesOrdersPaginated.hasMore && !salesOrdersPaginated.loading && (
        <div className="load-more-section">
          <button
            onClick={handleLoadMore}
            className="btn btn-secondary load-more-btn"
          >
            Cargar Más
          </button>
        </div>
      )}

      {salesOrdersPaginated.data.length > 0 && (
        <div className="sales-summary">
          <p>
            Mostrando {salesOrdersPaginated.data.length} órdenes
            {salesOrdersPaginated.hasMore && ' (hay más disponibles)'}
          </p>
        </div>
      )}

      {/* Sale Detail Modal */}
      <SaleDetailModal
        sale={selectedSale}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SalesOrdersList;
