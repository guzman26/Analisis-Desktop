import React, { useState } from 'react';
import { Sale, ReturnReason } from '@/types';
import { returnBoxes } from '@/api/endpoints';
import { useNotifications } from './Notification/Notification';
import { Button, Modal } from './design-system';
import './ReturnBoxesModal.css';

interface ReturnBoxesModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS: Array<{ value: ReturnReason; label: string }> = [
  { value: 'damaged', label: 'Dañado' },
  { value: 'wrong_caliber', label: 'Calibre Incorrecto' },
  { value: 'customer_request', label: 'Solicitud del Cliente' },
  { value: 'quality_issue', label: 'Problema de Calidad' },
  { value: 'expired', label: 'Vencido' },
  { value: 'other', label: 'Otro' },
];

const ReturnBoxesModal: React.FC<ReturnBoxesModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [reason, setReason] = useState<ReturnReason>('customer_request');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Get all boxes from sale items
  const allBoxes = sale.items.flatMap((item) => ({
    palletId: item.palletId,
    boxIds: item.boxIds,
  }));

  const handleToggleBox = (boxId: string) => {
    setSelectedBoxes((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    );
  };

  const handleSelectAll = () => {
    const allBoxIds = allBoxes.flatMap((item) => item.boxIds);
    setSelectedBoxes(allBoxIds);
  };

  const handleDeselectAll = () => {
    setSelectedBoxes([]);
  };

  const handleSubmit = async () => {
    if (selectedBoxes.length === 0) {
      showError('Debe seleccionar al menos una caja para devolver');
      return;
    }

    if (reason === 'other' && !reasonDetails.trim()) {
      showError('Debe proporcionar detalles para "Otro" motivo');
      return;
    }

    setIsSubmitting(true);

    try {
      await returnBoxes({
        saleId: sale.saleId,
        boxIds: selectedBoxes,
        reason,
        reasonDetails: reasonDetails.trim() || undefined,
      });

      showSuccess(`${selectedBoxes.length} caja(s) devuelta(s) exitosamente`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error returning boxes:', error);
      showError(
        error instanceof Error ? error.message : 'Error al procesar la devolución'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBoxes([]);
    setReason('customer_request');
    setReasonDetails('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Devolver Cajas">
      <div className="return-boxes-modal">
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
              <span className="info-label">Total Cajas:</span>
              <span className="info-value">{sale.totalBoxes}</span>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <div className="section-header">
            <h3>Seleccionar Cajas</h3>
            <div className="selection-actions">
              <button
                type="button"
                className="link-button"
                onClick={handleSelectAll}
                disabled={isSubmitting}
              >
                Seleccionar Todas
              </button>
              <span className="separator">|</span>
              <button
                type="button"
                className="link-button"
                onClick={handleDeselectAll}
                disabled={isSubmitting}
              >
                Deseleccionar Todas
              </button>
            </div>
          </div>

          <div className="boxes-list">
            {allBoxes.map((item) => (
              <div key={item.palletId} className="pallet-group">
                <div className="pallet-header">
                  <span className="pallet-label">Pallet: {item.palletId}</span>
                  <span className="box-count">{item.boxIds.length} cajas</span>
                </div>
                <div className="boxes-grid">
                  {item.boxIds.map((boxId) => (
                    <label key={boxId} className="box-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedBoxes.includes(boxId)}
                        onChange={() => handleToggleBox(boxId)}
                        disabled={isSubmitting}
                      />
                      <span className="box-id">{boxId}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="selected-count">
            {selectedBoxes.length} caja(s) seleccionada(s)
          </div>
        </div>

        <div className="modal-section">
          <h3>Motivo de Devolución</h3>
          <div className="form-group">
            <label htmlFor="return-reason">Motivo</label>
            <select
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReturnReason)}
              disabled={isSubmitting}
              className="form-select"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {reason === 'other' && (
            <div className="form-group">
              <label htmlFor="reason-details">Detalles</label>
              <textarea
                id="reason-details"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                disabled={isSubmitting}
                className="form-textarea"
                rows={3}
                placeholder="Describa el motivo de la devolución..."
              />
            </div>
          )}

          {reason !== 'other' && (
            <div className="form-group">
              <label htmlFor="reason-details">Detalles Adicionales (Opcional)</label>
              <textarea
                id="reason-details"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                disabled={isSubmitting}
                className="form-textarea"
                rows={2}
                placeholder="Información adicional..."
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedBoxes.length === 0}
          >
            {isSubmitting ? 'Procesando...' : `Devolver ${selectedBoxes.length} Caja(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReturnBoxesModal;

