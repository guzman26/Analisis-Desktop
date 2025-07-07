import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '../../contexts/SalesContext';
import { Sale } from '@/types';
import SalesCard from '../../components/design-system/SalesCard';
import SaleDetailModal from '@/components/SaleDetailModal';
import { WindowContainer, Button } from '../../components/design-system';

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

  // These functions are no longer needed as they're handled by the SalesCard component

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
    <>
      <WindowContainer title="Órdenes de Venta Confirmadas">
        <div className="sales-orders-header">
          <h1>Órdenes de Venta Confirmadas</h1>
          <Button
            onClick={() => salesOrdersCONFIRMEDPaginated.refresh()}
            variant="secondary"
            disabled={salesOrdersCONFIRMEDPaginated.loading}
          >
            {salesOrdersCONFIRMEDPaginated.loading
              ? 'Actualizando...'
              : 'Actualizar'}
          </Button>
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
              <SalesCard
                key={sale.saleId}
                sale={sale}
                onViewDetails={handleViewDetails}
                onPrint={handlePrintSale}
              />
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
            <Button
              onClick={handleLoadMore}
              variant="secondary"
            >
              Cargar Más
            </Button>
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
      </WindowContainer>

      {/* Sale Detail Modal */}
      <SaleDetailModal
        sale={selectedSale}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ConfirmedSalesOrdersList;
