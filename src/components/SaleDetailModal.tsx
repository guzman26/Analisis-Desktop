import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sale, Customer, Box, SaleItem } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { getBoxByCode, getCustomerById } from '@/api/endpoints';
import { getOperarioFromCodigo } from '@/utils/getParamsFromCodigo';
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

  // Fetch customer data when sale changes and modal is open
  useEffect(() => {
    const fetchCustomer = async () => {
      // Only fetch if modal is open and sale exists
      if (!isOpen || !sale?.customerId) {
        return;
      }

      // Only fetch if customerInfo is not already available
      if (sale.customerInfo?.name) {
        setCustomer(null); // Don't fetch if we already have customer info
        return;
      }

      try {
        const customerData = await getCustomerById(sale.customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setCustomer(null);
      }
    };

    fetchCustomer();
  }, [sale, isOpen]);

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

  // Helper function to group boxes by operario and sort by counter
  const groupBoxesByOperario = (boxIds: string[] | undefined) => {
    if (!boxIds || boxIds.length === 0) return [];
    
    const groups = new Map<string, Array<{ code: string; counter: number }>>();
    
    boxIds.forEach((boxId: string) => {
      try {
        // Normalize code to last 16 digits if longer
        const normalizedCode = boxId.length >= 16 ? boxId.slice(-16) : boxId;
        
        const operario = getOperarioFromCodigo(normalizedCode) || 'Sin operario';
        // Extract counter from positions 13-16 (last 3 digits)
        const counterStr = normalizedCode.length >= 16 
          ? normalizedCode.slice(13, 16) 
          : normalizedCode.slice(-3);
        const counter = parseInt(counterStr || '0', 10);
        
        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push({ code: boxId, counter });
      } catch {
        // If parsing fails, add to "Sin operario" group
        const operario = 'Sin operario';
        if (!groups.has(operario)) {
          groups.set(operario, []);
        }
        groups.get(operario)!.push({ code: boxId, counter: 0 });
      }
    });
    
    // Sort boxes within each group by counter
    groups.forEach((boxes) => {
      boxes.sort((a, b) => a.counter - b.counter);
    });
    
    // Convert to array and sort by operario number
    return Array.from(groups.entries())
      .map(([operario, boxes]) => ({
        operario,
        boxes: boxes.map(b => b.code),
      }))
      .sort((a, b) => {
        const numA = parseInt(a.operario, 10) || 999;
        const numB = parseInt(b.operario, 10) || 999;
        return numA - numB;
      });
  };

  // No longer needed - removed print view modal

  // Helper functions
  const getTotalBoxes = () => {
    // Use totalBoxes if available, otherwise calculate from boxes array or items
    if (sale?.totalBoxes !== undefined) {
      return sale.totalBoxes;
    }
    if (sale?.boxes && Array.isArray(sale.boxes)) {
      return sale.boxes.length;
    }
    if (sale?.items && Array.isArray(sale.items)) {
      return sale.items.reduce(
        (total, item) => total + (item.boxIds?.length || 0),
        0
      );
    }
    return 0;
  };

  const getTotalPallets = () => {
    // Use pallets array if available, otherwise use items
    if (sale?.pallets && Array.isArray(sale.pallets)) {
      return sale.pallets.length;
    }
    if (sale?.items && Array.isArray(sale.items)) {
      return sale.items.length;
    }
    return 0;
  };

  // Get items structure - prefer items, otherwise reconstruct from pallets/boxes
  const getItems = () => {
    if (sale?.items && Array.isArray(sale.items) && sale.items.length > 0) {
      return sale.items;
    }
    // Reconstruct from pallets and boxes arrays
    if (sale?.pallets && sale?.boxes && Array.isArray(sale.pallets) && Array.isArray(sale.boxes)) {
      // Group boxes by pallet - simplified: distribute boxes evenly
      // For accurate grouping, we'd need to query each box's palletId
      const items: SaleItem[] = [];
      const boxesPerPallet = Math.ceil(sale.boxes.length / sale.pallets.length);
      let boxIndex = 0;
      
      for (const palletId of sale.pallets) {
        const boxIds = sale.boxes.slice(boxIndex, boxIndex + boxesPerPallet);
        if (boxIds.length > 0) {
          items.push({ palletId, boxIds });
        }
        boxIndex += boxesPerPallet;
      }
      
      return items;
    }
    return [];
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
              <span className={`status-badge ${sale.state === 'COMPLETED' ? 'success' : sale.state === 'CONFIRMED' ? 'info' : sale.state === 'DISPATCHED' ? 'warning' : 'secondary'}`}>
                {sale.state || 'DRAFT'}
              </span>
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
                  {getTotalPallets()}
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
                  {sale.customerInfo?.name || sale.customerName || customer?.name || 'Cargando...'}
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
          <div className="modal-section pallets-detail-section">
            <div className="section-header">
              <h3 className="section-title">Detalle de Pallets</h3>
              <span className="section-subtitle">
                {getTotalPallets()} pallet{getTotalPallets() !== 1 ? 's' : ''} • {getTotalBoxes()} caja{getTotalBoxes() !== 1 ? 's' : ''} en total
              </span>
            </div>
            {(() => {
              const items = getItems();
              if (!items || items.length === 0) {
                return <div className="items-empty">No hay items en esta venta</div>;
              }
              return (
                <div className="items-container">
                  {items.map((item, index) => (
                    <div key={index} className="item-card pallet-card">
                      <div className="item-header pallet-header">
                        <div className="pallet-title-group">
                          <span className="pallet-number">#{index + 1}</span>
                          <h4 className="item-title pallet-id">Pallet {item.palletId}</h4>
                        </div>
                        <div className="pallet-count-badge">
                          <span className="count-number">{item.boxIds?.length || 0}</span>
                          <span className="count-label">cajas</span>
                        </div>
                      </div>

                      <div className="item-boxes pallet-boxes">
                        <div className="boxes-header">
                          <span className="boxes-label">CAJAS INCLUIDAS</span>
                          <span className="boxes-count">{item.boxIds?.length || 0} caja{item.boxIds?.length !== 1 ? 's' : ''}</span>
                        </div>
                        {(() => {
                          const groupedBoxes = groupBoxesByOperario(item.boxIds);
                          
                          if (groupedBoxes.length === 0) {
                            return (
                              <span className="no-boxes">
                                No hay cajas asignadas
                              </span>
                            );
                          }
                          
                          return (
                            <div className="boxes-grouped-by-operario">
                              {groupedBoxes.map((group) => (
                                <div key={group.operario} className="operario-group">
                                  <div className="operario-header">
                                    <span className="operario-label">Operario {group.operario}</span>
                                    <span className="operario-count">{group.boxes.length} caja{group.boxes.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="boxes-grid">
                                    {group.boxes.map((boxId: string) => (
                                      <div
                                        key={boxId}
                                        className={`box-item clickable ${loadingBox === boxId ? 'loading' : ''}`}
                                        onClick={() => handleBoxClick(boxId)}
                                        title="Clic para ver detalles de la caja"
                                      >
                                        {loadingBox === boxId ? (
                                          <span className="loading-text">Cargando...</span>
                                        ) : (
                                          <span className="box-code">{boxId}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
