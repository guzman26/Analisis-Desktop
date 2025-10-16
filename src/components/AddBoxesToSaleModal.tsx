import React, { useState } from 'react';
import { Sale } from '@/types';
import { addBoxesToSale } from '@/api/endpoints';
import { useFilteredPallets } from '@/contexts/PalletContext';
import { getPalletBoxes } from '@/utils/palletHelpers';
import { useNotifications } from './Notification/Notification';
import { Button, Modal } from './design-system';
import './AddBoxesToSaleModal.css';

interface AddBoxesToSaleModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBoxesToSaleModal: React.FC<AddBoxesToSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { pallets: closedPalletsInBodega } = useFilteredPallets();
  const [selectedBoxes, setSelectedBoxes] = useState<Map<string, string[]>>(new Map());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const handleToggleBox = (palletId: string, boxId: string) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      const palletBoxes = newMap.get(palletId) || [];
      
      if (palletBoxes.includes(boxId)) {
        const filtered = palletBoxes.filter((id) => id !== boxId);
        if (filtered.length === 0) {
          newMap.delete(palletId);
        } else {
          newMap.set(palletId, filtered);
        }
      } else {
        newMap.set(palletId, [...palletBoxes, boxId]);
      }
      
      return newMap;
    });
  };

  const handleSelectAllFromPallet = (palletId: string, boxIds: string[]) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      newMap.set(palletId, boxIds);
      return newMap;
    });
  };

  const handleDeselectAllFromPallet = (palletId: string) => {
    setSelectedBoxes((prev) => {
      const newMap = new Map(prev);
      newMap.delete(palletId);
      return newMap;
    });
  };

  const getTotalSelectedBoxes = () => {
    return Array.from(selectedBoxes.values()).reduce(
      (sum, boxes) => sum + boxes.length,
      0
    );
  };

  const handleSubmit = async () => {
    const totalBoxes = getTotalSelectedBoxes();
    
    if (totalBoxes === 0) {
      showError('Debe seleccionar al menos una caja');
      return;
    }

    setIsSubmitting(true);

    try {
      const items = Array.from(selectedBoxes.entries()).map(([palletId, boxIds]) => ({
        palletId,
        boxIds,
      }));

      await addBoxesToSale({
        saleId: sale.saleId,
        items,
        reason: reason.trim() || undefined,
      });

      showSuccess(`${totalBoxes} caja(s) agregada(s) exitosamente`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding boxes to sale:', error);
      showError(
        error instanceof Error ? error.message : 'Error al agregar cajas'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBoxes(new Map());
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Cajas a Venta">
      <div className="add-boxes-modal">
        <div className="modal-section">
          <h3>Información de Venta</h3>
          <div className="sale-info">
            <div className="info-row">
              <span className="info-label">ID Venta:</span>
              <span className="info-value">{sale.saleId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cliente:</span>
              <span className="info-value">{sale.customerInfo?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cajas Actuales:</span>
              <span className="info-value">{sale.totalBoxes}</span>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <div className="section-header">
            <h3>Pallets Disponibles en Bodega</h3>
            <span className="pallet-count">
              {closedPalletsInBodega.length} pallet(s)
            </span>
          </div>

          {closedPalletsInBodega.length === 0 ? (
            <div className="empty-state">
              <p>No hay pallets cerrados disponibles en bodega</p>
            </div>
          ) : (
            <div className="pallets-list">
              {closedPalletsInBodega.map((pallet) => {
                const boxes = getPalletBoxes(pallet);
                const selectedFromPallet = selectedBoxes.get(pallet.codigo) || [];
                
                return (
                  <div key={pallet.codigo} className="pallet-card">
                    <div className="pallet-card-header">
                      <div className="pallet-info">
                        <span className="pallet-code">{pallet.codigo}</span>
                        <span className="pallet-calibre">Calibre: {pallet.calibre}</span>
                      </div>
                      <div className="pallet-actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => handleSelectAllFromPallet(pallet.codigo, boxes)}
                          disabled={isSubmitting}
                        >
                          Seleccionar Todas
                        </button>
                        {selectedFromPallet.length > 0 && (
                          <>
                            <span className="separator">|</span>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => handleDeselectAllFromPallet(pallet.codigo)}
                              disabled={isSubmitting}
                            >
                              Deseleccionar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="pallet-stats">
                      <span>{boxes.length} cajas</span>
                      {selectedFromPallet.length > 0 && (
                        <span className="selected-indicator">
                          {selectedFromPallet.length} seleccionada(s)
                        </span>
                      )}
                    </div>

                    <div className="boxes-grid">
                      {boxes.map((boxId) => (
                        <label key={boxId} className="box-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFromPallet.includes(boxId)}
                            onChange={() => handleToggleBox(pallet.codigo, boxId)}
                            disabled={isSubmitting}
                          />
                          <span className="box-id">{boxId}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {getTotalSelectedBoxes() > 0 && (
            <div className="selected-summary">
              {getTotalSelectedBoxes()} caja(s) seleccionada(s) de {selectedBoxes.size} pallet(s)
            </div>
          )}
        </div>

        <div className="modal-section">
          <h3>Motivo (Opcional)</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            className="form-textarea"
            rows={2}
            placeholder="Descripción del motivo para agregar cajas..."
          />
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || getTotalSelectedBoxes() === 0}
          >
            {isSubmitting ? 'Procesando...' : `Agregar ${getTotalSelectedBoxes()} Caja(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddBoxesToSaleModal;

