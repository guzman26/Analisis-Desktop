import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sale, Customer, Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { getBoxByCode, getCustomerById } from '@/api/endpoints';
import BoxDetailModal from './BoxDetailModal';
import Button from '@/components/design-system/Button';
import { Modal } from './design-system';
import '@/styles/SaleDetailModal.css';

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

const SaleDetailModal = ({ sale, isOpen, onClose }: SaleDetailModalProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [loadingBox, setLoadingBox] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch customer data when sale changes
  useEffect(() => {
    const fetchCustomer = async () => {
      if (sale?.customerId) {
        try {
          const customerData = await getCustomerById(sale.customerId);
          setCustomer(customerData);
        } catch (error) {
          console.error('Error fetching customer:', error);
          setCustomer(null);
        }
      }
    };

    if (sale) {
      fetchCustomer();
    }
  }, [sale]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBoxModal) {
          setShowBoxModal(false);
          setSelectedBox(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, showBoxModal, onClose]);

  // Handle box click to open box detail modal
  const handleBoxClick = async (boxCode: string) => {
    try {
      setLoadingBox(boxCode);
      const response = await getBoxByCode(boxCode);

      // Extract the box data from the response
      // The API might return { data: boxData } or just boxData directly
      const boxData = response as Box;

      if (!boxData) {
        console.error('No box data received for code:', boxCode);
        return;
      }

      setSelectedBox(boxData);
      setShowBoxModal(true);
    } catch (error) {
      console.error('Error fetching box details:', error);
      // TODO: Show error message to user
    } finally {
      setLoadingBox(null);
    }
  };

  const handleCloseBoxModal = () => {
    setShowBoxModal(false);
    setSelectedBox(null);
  };

  // No longer needed - removed print view modal

  // Helper functions
  const getTotalBoxes = () => {
    return (
      sale?.items?.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      ) || 0
    );
  };

  const handleShowPrintView = () => {
    if (sale?.saleId) {
      navigate(`/sales/print/${sale.saleId}`);
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la Venta">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Orden de Venta {sale.saleId}</h2>
            <div className="modal-badges">
              <span className="status-badge success">COMPLETADA</span>
              <span className="date-badge">{formatDate(sale.createdAt)}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Sale Summary */}
          <div className="modal-section">
            <h3 className="section-title">Resumen de la Venta</h3>
            <div className="info-grid">
              <div className="info-item total-amount-item">
                <span className="info-label">Total de Cajas</span>
                <span className="info-value large total-amount-text">
                  {getTotalBoxes()}
                </span>
              </div>
              <div className="info-item total-amount-item">
                <span className="info-label">Total de Pallets</span>
                <span className="info-value large total-amount-text">
                  {sale.items?.length || 0}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Fecha de Creación</span>
                <span className="info-value">{formatDate(sale.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="modal-section">
            <h3 className="section-title">Información del Cliente</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">ID Cliente</span>
                <span className="info-value">{sale.customerId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nombre</span>
                <span className="info-value">
                  {sale.customerInfo?.name || customer?.name || 'Cargando...'}
                </span>
              </div>
              {(sale.customerInfo?.email || customer?.email) && (
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">
                    {sale.customerInfo?.email || customer?.email}
                  </span>
                </div>
              )}
              {(sale.customerInfo?.phone || customer?.phone) && (
                <div className="info-item">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">
                    {sale.customerInfo?.phone || customer?.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Details */}
          <div className="modal-section">
            <h3 className="section-title">Detalle de Pallets</h3>
            {!sale.items || sale.items.length === 0 ? (
              <div className="items-empty">No hay items en esta venta</div>
            ) : (
              <div className="items-container">
                {sale.items.map((item, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <h4 className="item-title">Pallet {item.palletId}</h4>
                      <span className="item-count">
                        {item.boxIds?.length || 0} cajas
                      </span>
                    </div>

                    <div className="item-boxes">
                      <span className="boxes-label">Cajas incluidas:</span>
                      <div className="boxes-grid">
                        {item.boxIds?.map((boxId, boxIndex) => (
                          <div
                            key={boxIndex}
                            className={`box-item clickable ${loadingBox === boxId ? 'loading' : ''}`}
                            onClick={() => handleBoxClick(boxId)}
                            title="Clic para ver detalles de la caja"
                          >
                            {loadingBox === boxId ? (
                              <span className="loading-text">Cargando...</span>
                            ) : (
                              boxId
                            )}
                          </div>
                        )) || (
                          <span className="no-boxes">
                            No hay cajas asignadas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="modal-section">
              <h3 className="section-title">Notas</h3>
              <div className="notes-box">
                <p>{sale.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <Button variant="primary" onClick={handleShowPrintView}>
              📄 Ver Guía de Despacho
            </Button>
            {sale.reportUrl && (
              <a
                href={sale.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar Reporte
              </a>
            )}
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        {/* Box Detail Modal */}
        <BoxDetailModal
          box={selectedBox}
          isOpen={showBoxModal}
          onClose={handleCloseBoxModal}
        />
      </div>
    </Modal>
  );
};

export default SaleDetailModal;
