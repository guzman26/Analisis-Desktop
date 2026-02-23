import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sale } from '@/types';
import {
  Button,
  WindowContainer,
  LoadingOverlay,
  SalesCard,
} from '../../components/design-system';
import SaleDetailModal from '@/components/SaleDetailModal';
import AddBoxesToSaleModal from '@/components/AddBoxesToSaleModal';
import { useNotifications } from '../../components/Notification';
import {
  useConfirmSaleMutation,
  useConfirmedSalesOrdersInfiniteQuery,
  useDraftSalesOrdersInfiniteQuery,
} from '@/modules/sales';

import '@/styles/SalesOrdersList.css';

const SalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const salesOrdersDRAFTPaginated = useDraftSalesOrdersInfiniteQuery();
  const salesOrdersCONFIRMEDPaginated = useConfirmedSalesOrdersInfiniteQuery();
  const confirmSaleMutation = useConfirmSaleMutation();
  const { showSuccess, showError } = useNotifications();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddBoxesModal, setShowAddBoxesModal] = useState(false);
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

  const handleAddBoxes = (sale: Sale) => {
    setSelectedSale(sale);
    setShowAddBoxesModal(true);
  };

  const handleConfirmSale = async (sale: Sale) => {
    try {
      // Establecer el estado de carga para esta venta específica
      setConfirmingStates((prev) => ({ ...prev, [sale.saleId]: true }));

      // Llamar al endpoint real de confirmación
      // El backend retorna el objeto sale confirmado directamente
      await confirmSaleMutation.mutateAsync(sale.saleId);
      await salesOrdersDRAFTPaginated.refresh();
      await salesOrdersCONFIRMEDPaginated.refresh();

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

  const handleModalSuccess = async () => {
    await salesOrdersDRAFTPaginated.refresh();
    await salesOrdersCONFIRMEDPaginated.refresh();
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
                onAddBoxes={handleAddBoxes}
                onConfirm={handleConfirmSale}
                isConfirming={confirmingStates[sale.saleId]}
              />
            ))}
          </div>
        )}

        {salesOrdersDRAFTPaginated.hasMore &&
          !salesOrdersDRAFTPaginated.loading && (
            <div className="load-more-section">
              <Button
                onClick={handleLoadMore}
                variant="secondary"
                className="load-more-btn"
              >
                Cargar Más
              </Button>
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

export default SalesOrdersList;
