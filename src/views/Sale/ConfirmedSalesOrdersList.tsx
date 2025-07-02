import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '@/contexts/SalesContext';
import { Sale } from '@/types';
import SaleDetailModal from '@/components/SaleDetailModal';
import '@/styles/SalesOrdersList.css';

const ConfirmedSalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { salesOrdersCONFIRMEDPaginated } = useContext(SalesContext);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (
      salesOrdersCONFIRMEDPaginated &&
      salesOrdersCONFIRMEDPaginated.data.length === 0
    ) {
      salesOrdersCONFIRMEDPaginated.refresh();
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

  // Función para calcular el total de cajas desde los items
  const getTotalBoxes = (sale: Sale): number => {
    return (
      sale.totalBoxes ||
      sale.items?.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      ) ||
      0
    );
  };

  const handleLoadMore = () => {
    if (
      salesOrdersCONFIRMEDPaginated &&
      salesOrdersCONFIRMEDPaginated.hasMore &&
      !salesOrdersCONFIRMEDPaginated.loading
    ) {
      salesOrdersCONFIRMEDPaginated.loadMore();
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

  const handlePrintSale = (sale: Sale) => {
    navigate(`/sales/print/${sale.saleId}`);
  };

  // Early return if context is not available
  if (!salesOrdersCONFIRMEDPaginated) {
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
          onClick={() => salesOrdersCONFIRMEDPaginated.refresh()}
          className="btn btn-secondary refresh-btn"
          disabled={salesOrdersCONFIRMEDPaginated.loading}
        >
          {salesOrdersCONFIRMEDPaginated.loading
            ? 'Actualizando...'
            : 'Actualizar'}
        </button>
      </div>

      {salesOrdersCONFIRMEDPaginated.error && (
        <div className="error-message">
          <p>
            Error al cargar las órdenes: {salesOrdersCONFIRMEDPaginated.error}
          </p>
        </div>
      )}

      {salesOrdersCONFIRMEDPaginated.data.length === 0 &&
      !salesOrdersCONFIRMEDPaginated.loading ? (
        <div className="no-sales-message">
          <p>No hay órdenes de venta disponibles.</p>
        </div>
      ) : (
        <div className="sales-orders-grid">
          {salesOrdersCONFIRMEDPaginated.data.map((sale: Sale) => {
            return (
              <div key={sale.saleId} className="sale-card">
                <div className="sale-main-info">
                  <div className="sale-date-primary">
                    {formatDate(sale.createdAt)}
                  </div>
                  <div className="sale-customer-primary">
                    <span className="customer-name">
                      {sale.customerInfo?.name}
                    </span>
                  </div>
                </div>

                <div className="sale-secondary-info">
                  <div className="sale-id-secondary">
                    <span className="label">ID:</span>
                    <span className="value">{sale.saleId}</span>
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
                    className="btn btn-success btn-small"
                    onClick={() => handlePrintSale(sale)}
                  >
                    🖨️ Imprimir
                  </button>
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

      {salesOrdersCONFIRMEDPaginated.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando órdenes de venta...</p>
        </div>
      )}

      {salesOrdersCONFIRMEDPaginated.hasMore &&
        !salesOrdersCONFIRMEDPaginated.loading && (
          <div className="load-more-section">
            <button
              onClick={handleLoadMore}
              className="btn btn-secondary load-more-btn"
            >
              Cargar Más
            </button>
          </div>
        )}

      {salesOrdersCONFIRMEDPaginated.data.length > 0 && (
        <div className="sales-summary">
          <p>
            Mostrando {salesOrdersCONFIRMEDPaginated.data.length} órdenes
            {salesOrdersCONFIRMEDPaginated.hasMore && ' (hay más disponibles)'}
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

export default ConfirmedSalesOrdersList;
