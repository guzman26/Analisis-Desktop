import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '../../contexts/SalesContext';
import { Sale } from '@/types';
import SalesCard from '../../components/design-system/SalesCard';
import SaleDetailModal from '@/components/SaleDetailModal';
import ReturnBoxesModal from '@/components/ReturnBoxesModal';
import AddBoxesToSaleModal from '@/components/AddBoxesToSaleModal';
import { WindowContainer, Button } from '../../components/design-system';
import { dispatchSale, completeSale } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';

import '@/styles/SalesOrdersList.css';

const ConfirmedSalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { salesOrdersCONFIRMEDPaginated } = useContext(SalesContext);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showAddBoxesModal, setShowAddBoxesModal] = useState(false);
  const { showSuccess, showError } = useNotifications();

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

  const handleReturnBoxes = (sale: Sale) => {
    setSelectedSale(sale);
    setShowReturnModal(true);
  };

  const handleAddBoxes = (sale: Sale) => {
    setSelectedSale(sale);
    setShowAddBoxesModal(true);
  };

  const handleDispatchSale = async (sale: Sale) => {
    try {
      await dispatchSale(sale.saleId, 'Marcado como despachado');
      showSuccess('Venta marcada como despachada exitosamente');
      // Esperar un momento para que el backend procese la actualización
      setTimeout(() => {
        salesOrdersCONFIRMEDPaginated.refresh();
      }, 500);
    } catch (error) {
      console.error('Error dispatching sale:', error);
      showError(
        error instanceof Error
          ? `Error al marcar como despachada: ${error.message}`
          : 'Error desconocido al marcar como despachada'
      );
    }
  };

  const handleCompleteSale = async (sale: Sale) => {
    try {
      await completeSale(sale.saleId, 'Marcado como completado');
      showSuccess('Venta completada exitosamente');
      // Esperar un momento para que el backend procese la actualización
      setTimeout(() => {
        salesOrdersCONFIRMEDPaginated.refresh();
      }, 500);
    } catch (error) {
      console.error('Error completing sale:', error);
      showError(
        error instanceof Error
          ? `Error al completar la venta: ${error.message}`
          : 'Error desconocido al completar la venta'
      );
    }
  };

  const handleModalSuccess = () => {
    salesOrdersCONFIRMEDPaginated.refresh();
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
                  onReturn={handleReturnBoxes}
                  onAddBoxes={handleAddBoxes}
                  onDispatch={handleDispatchSale}
                  onComplete={handleCompleteSale}
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
              <Button onClick={handleLoadMore} variant="secondary">
                Cargar Más
              </Button>
            </div>
          )}

        {salesOrdersCONFIRMEDPaginated.data.length > 0 && (
          <div className="sales-summary">
            <p>
              Mostrando {salesOrdersCONFIRMEDPaginated.data.length} órdenes
              {salesOrdersCONFIRMEDPaginated.hasMore &&
                ' (hay más disponibles)'}
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

      {selectedSale && showReturnModal && (
        <ReturnBoxesModal
          sale={selectedSale}
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {selectedSale && showAddBoxesModal && (
        <AddBoxesToSaleModal
          sale={selectedSale}
          isOpen={showAddBoxesModal}
          onClose={() => setShowAddBoxesModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default ConfirmedSalesOrdersList;
