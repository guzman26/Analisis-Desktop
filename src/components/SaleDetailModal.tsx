import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sale, Customer } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { CustomerContext } from '@/contexts/CustomerContext';
import '@/styles/SaleDetailModal.css';

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

const SaleDetailModal = ({ sale, isOpen, onClose }: SaleDetailModalProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();
  const customerContext = useContext(CustomerContext);
  const { getCustomerByIdFunction } = customerContext || {};

  // Fetch customer data when sale changes
  useEffect(() => {
    const fetchCustomer = async () => {
      if (sale?.customerId && getCustomerByIdFunction) {
        try {
          const customerData = await getCustomerByIdFunction(sale.customerId);
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
  }, [sale, getCustomerByIdFunction]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // No longer needed - removed print view modal

  // Helper functions
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

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
    <div className="modal-overlay" onClick={onClose}>
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

          {/* Sale Summary */}
          <div className="modal-section">
            <h3 className="section-title">Resumen de la Venta</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Total de Cajas</span>
                <span className="info-value large">{getTotalBoxes()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total de Pallets</span>
                <span className="info-value large">
                  {sale.items?.length || 0}
                </span>
              </div>
              {sale.unitPrice && (
                <div className="info-item">
                  <span className="info-label">Precio por Caja</span>
                  <span className="info-value price-text">
                    {formatCurrency(sale.unitPrice)}
                  </span>
                </div>
              )}
              {sale.totalAmount && (
                <div className="info-item total-amount-item">
                  <span className="info-label">Monto Total</span>
                  <span className="info-value large total-amount-text">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Fecha de Creación</span>
                <span className="info-value">{formatDate(sale.createdAt)}</span>
              </div>
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
                          <div key={boxIndex} className="box-item">
                            {boxId}
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
            <button
              className="action-button primary"
              onClick={handleShowPrintView}
            >
              📄 Ver Guía de Despacho
            </button>
            {sale.reportUrl && (
              <a
                href={sale.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
              >
                Descargar Reporte
              </a>
            )}
            <button className="action-button secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
