import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesContext } from '@/contexts/SalesContext';
import { Sale } from '@/types';
import SaleDetailModal from '@/components/SaleDetailModal';
import { confirmSale } from '@/api/post';
import '@/styles/SalesOrdersList.css';

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
    <div className="sales-orders-list">
      <div className="sales-orders-header">
        <h1>Órdenes de Venta</h1>
        <button
          onClick={() => salesOrdersDRAFTPaginated.refresh()}
          className="btn btn-secondary refresh-btn"
          disabled={salesOrdersDRAFTPaginated.loading}
        >
          {salesOrdersDRAFTPaginated.loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {salesOrdersDRAFTPaginated.error && (
        <div className="error-message">
          <p>Error al cargar las órdenes: {salesOrdersDRAFTPaginated.error}</p>
        </div>
      )}

      {salesOrdersDRAFTPaginated.data.length === 0 &&
      !salesOrdersDRAFTPaginated.loading ? (
        <div className="no-sales-message">
          <p>No hay órdenes de venta disponibles.</p>
        </div>
      ) : (
        <div className="sales-orders-grid">
          {salesOrdersDRAFTPaginated.data.map((sale: Sale) => {
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
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => handleConfirmSale(sale)}
                    disabled={confirmingStates[sale.saleId] || false}
                  >
                    {confirmingStates[sale.saleId]
                      ? '⏳ Confirmando...'
                      : '✅ Confirmar Venta'}
                  </button>
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
                    className="btn btn-secondary btn-small"
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
