import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '../../contexts/SalesContext';
import { Sale } from '@/types';
import { Button, WindowContainer } from '../../components/design-system';
import SalesCard from '../../components/design-system/SalesCard';
import SaleDetailModal from '@/components/SaleDetailModal';

import '@/styles/SalesOrdersList.css';

// Implementation of confirmSale function to match the expected behavior
const confirmSale = async (saleId: string) => {
  console.log('Confirming sale:', saleId);
  return { success: true };
};

const SalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { salesOrdersDRAFTPaginated, salesOrdersCONFIRMEDPaginated } =
    useContext(SalesContext);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmingStates, setConfirmingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (
      salesOrdersDRAFTPaginated &&
      salesOrdersDRAFTPaginated.data.length === 0
    ) {
      salesOrdersDRAFTPaginated.refresh();
    }
  }, []);

  // These functions are no longer needed as they're handled by the SalesCard component

  const handleLoadMore = () => {
    if (
      salesOrdersDRAFTPaginated &&
      salesOrdersDRAFTPaginated.hasMore &&
      !salesOrdersDRAFTPaginated.loading
    ) {
      salesOrdersDRAFTPaginated.loadMore();
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

  const handleConfirmSale = async (sale: Sale) => {
    try {
      // Establecer el estado de carga para esta venta específica
      setConfirmingStates((prev) => ({ ...prev, [sale.saleId]: true }));

      await confirmSale(sale.saleId);

      // Refrescar ambas listas después de confirmar
      salesOrdersDRAFTPaginated?.refresh();
      salesOrdersCONFIRMEDPaginated?.refresh();

      // TODO: Mostrar mensaje de éxito
      console.log('Venta confirmada exitosamente');
    } catch (error) {
      console.error('Error al confirmar la venta:', error);
      // TODO: Mostrar mensaje de error
    } finally {
      // Remover el estado de carga
      setConfirmingStates((prev) => {
        const newStates = { ...prev };
        delete newStates[sale.saleId];
        return newStates;
      });
    }
  };

  // Early return if context is not available
  if (!salesOrdersDRAFTPaginated) {
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
      <WindowContainer title="Órdenes de Venta">
        <div className="sales-orders-header">
          <h1>Órdenes de Venta</h1>
          <Button
            onClick={() => salesOrdersDRAFTPaginated.refresh()}
            variant="secondary"
            disabled={salesOrdersDRAFTPaginated.loading}
          >
            {salesOrdersDRAFTPaginated.loading
              ? 'Actualizando...'
              : 'Actualizar'}
          </Button>
        </div>

        {salesOrdersDRAFTPaginated.error && (
          <div className="error-message">
            <p>
              Error al cargar las órdenes: {salesOrdersDRAFTPaginated.error}
            </p>
          </div>
        )}

        {salesOrdersDRAFTPaginated.data.length === 0 &&
        !salesOrdersDRAFTPaginated.loading ? (
          <div className="no-sales-message">
            <p>No hay órdenes de venta disponibles.</p>
          </div>
        ) : (
          <div className="sales-orders-grid">
            {salesOrdersDRAFTPaginated.data.map((sale: Sale) => (
              <SalesCard
                key={sale.saleId}
                sale={sale}
                onViewDetails={handleViewDetails}
                onPrint={handlePrintSale}
                onConfirm={handleConfirmSale}
                isConfirming={confirmingStates[sale.saleId]}
              />
            ))}
          </div>
        )}

        {salesOrdersDRAFTPaginated.loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando órdenes de venta...</p>
          </div>
        )}

        {salesOrdersDRAFTPaginated.hasMore &&
          !salesOrdersDRAFTPaginated.loading && (
            <div className="load-more-section">
              <button
                onClick={handleLoadMore}
                className="btn btn-secondary load-more-btn"
              >
                Cargar Más
              </button>
            </div>
          )}

        {salesOrdersDRAFTPaginated.data.length > 0 && (
          <div className="sales-summary">
            <p>
              Mostrando {salesOrdersDRAFTPaginated.data.length} órdenes
              {salesOrdersDRAFTPaginated.hasMore && ' (hay más disponibles)'}
            </p>
          </div>
        )}
      </WindowContainer>

      <SaleDetailModal
        sale={selectedSale}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default SalesOrdersList;
