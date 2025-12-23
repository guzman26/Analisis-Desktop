import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '../../contexts/SalesContext';
import { Sale } from '@/types';
import {
  Button,
  WindowContainer,
  LoadingOverlay,
} from '../../components/design-system';
import SalesCard from '../../components/design-system/SalesCard';
import SaleDetailModal from '@/components/SaleDetailModal';
import { useNotifications } from '../../components/Notification';
import { confirmSale } from '@/api/endpoints';

import '@/styles/SalesOrdersList.css';

const SalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { salesOrdersDRAFTPaginated, salesOrdersCONFIRMEDPaginated } =
    useContext(SalesContext);
  const { showSuccess, showError } = useNotifications();
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

      // Llamar al endpoint real de confirmación
      // El backend retorna el objeto sale confirmado directamente
      await confirmSale(sale.saleId);

      // Refrescar ambas listas después de confirmar
      // Esperar un momento para que el backend procese la actualización
      setTimeout(() => {
        salesOrdersDRAFTPaginated?.refresh();
        salesOrdersCONFIRMEDPaginated?.refresh();
      }, 500);

      showSuccess(`Venta ${sale.saleId} confirmada exitosamente`);
    } catch (error) {
      console.error('Error al confirmar la venta:', error);
      showError(
        error instanceof Error
          ? `Error al confirmar la venta: ${error.message}`
          : 'Error desconocido al confirmar la venta'
      );
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
        <LoadingOverlay show={true} text="Inicializando…" />
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay
        show={salesOrdersDRAFTPaginated.loading}
        text="Cargando órdenes de venta…"
      />
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
