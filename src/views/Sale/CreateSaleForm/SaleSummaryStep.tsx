import React, { useState } from 'react';
import { Customer } from '@/types';

type SaleType = 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';

interface BoxData {
  boxId: string;
  palletCode: string;
  calibre: string;
}

interface SaleSummaryStepProps {
  customer: Customer;
  saleType: SaleType;
  boxes: BoxData[];
  onConfirm: (notes?: string) => void;
  isSubmitting: boolean;
}

const SaleSummaryStep: React.FC<SaleSummaryStepProps> = ({
  customer,
  saleType,
  boxes,
  onConfirm,
  isSubmitting,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [expandedPallets, setExpandedPallets] = useState<Set<string>>(
    new Set()
  );

  const totalBoxes = boxes.length;

  // Group boxes by pallet for counting
  const palletGroups = boxes.reduce(
    (acc, box) => {
      if (!acc[box.palletCode]) {
        acc[box.palletCode] = {
          calibre: box.calibre,
          boxes: [],
        };
      }
      acc[box.palletCode].boxes.push(box.boxId);
      return acc;
    },
    {} as Record<string, { calibre: string; boxes: string[] }>
  );

  const totalPallets = Object.keys(palletGroups).length;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm(notes);
  };

  const togglePalletExpansion = (palletCode: string) => {
    const newExpanded = new Set(expandedPallets);
    if (newExpanded.has(palletCode)) {
      newExpanded.delete(palletCode);
    } else {
      newExpanded.add(palletCode);
    }
    setExpandedPallets(newExpanded);
  };

  const formatBoxCodesPreview = (boxes: string[], maxVisible: number = 6) => {
    if (boxes.length <= maxVisible) {
      return boxes;
    }
    return boxes.slice(0, maxVisible);
  };

  return (
    <div className="sale-summary-step">
      <div className="summary-section">
        <h2>Resumen de {saleType}</h2>

        {/* Quick Summary Card */}
        <div className="quick-summary-card">
          <div className="summary-header">
            <div className="summary-main">
              <h3>{saleType}</h3>
              <p className="customer-name-large">{customer.name}</p>
            </div>
            <div className="summary-totals-compact">
              <div className="total-compact">
                <span className="number">{totalPallets}</span>
                <span className="label">
                  Pallet{totalPallets !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="total-compact">
                <span className="number">{totalBoxes}</span>
                <span className="label">Caja{totalBoxes !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details - Collapsible */}
        <div className="customer-details-compact">
          <div className="section-header">
            <h3>Cliente Seleccionado</h3>
          </div>
          <div className="customer-info-grid">
            <div className="info-item">
              <span className="label">Nombre:</span>
              <span className="value">{customer.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{customer.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono:</span>
              <span className="value">{customer.phone}</span>
            </div>
            {customer.taxId && (
              <div className="info-item">
                <span className="label">RUT:</span>
                <span className="value">{customer.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pallets & Boxes Summary - Improved */}
        <div className="pallets-summary-compact">
          <div className="section-header">
            <h3>Pallets y Cajas Seleccionadas</h3>
          </div>

          <div className="pallets-list-compact">
            {Object.entries(palletGroups).map(([palletCode, palletData]) => {
              const isExpanded = expandedPallets.has(palletCode);
              const previewBoxes = formatBoxCodesPreview(palletData.boxes, 6);
              const hasMoreBoxes = palletData.boxes.length > 6;

              return (
                <div key={palletCode} className="pallet-item-compact">
                  <div className="pallet-header-compact">
                    <div className="pallet-main-info">
                      <h4 className="pallet-code">Pallet {palletCode}</h4>
                      <div className="pallet-meta-compact">
                        <span className="calibre-tag">
                          Calibre: {palletData.calibre}
                        </span>
                        <span className="box-count-tag">
                          {palletData.boxes.length} cajas
                        </span>
                      </div>
                    </div>
                    {hasMoreBoxes && (
                      <button
                        type="button"
                        onClick={() => togglePalletExpansion(palletCode)}
                        className="expand-button"
                      >
                        {isExpanded ? '▼ Contraer' : '▶ Ver todas'}
                      </button>
                    )}
                  </div>

                  <div className="boxes-preview">
                    <div className="boxes-grid-compact">
                      {(isExpanded ? palletData.boxes : previewBoxes).map(
                        (boxId) => (
                          <span key={boxId} className="box-code-compact">
                            {boxId}
                          </span>
                        )
                      )}
                      {!isExpanded && hasMoreBoxes && (
                        <span className="more-boxes-indicator">
                          +{palletData.boxes.length - previewBoxes.length} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <h3>Notas Adicionales</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Agregar notas sobre la operación (opcional)..."
            className="notes-textarea"
            rows={3}
            maxLength={500}
          />
          <div className="notes-counter">{notes.length}/500 caracteres</div>
        </div>

        {/* Confirmation */}
        <div className="confirmation-section">
          <div className="confirmation-summary">
            <p className="confirmation-text">
              ¿Confirma que desea procesar esta {saleType.toLowerCase()} de{' '}
              <strong>
                {totalPallets} pallet{totalPallets !== 1 ? 's' : ''}
              </strong>{' '}
              ({totalBoxes} cajas) para el cliente{' '}
              <strong>{customer.name}</strong>?
            </p>
          </div>

          <div className="confirmation-actions">
            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-primary btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : `Confirmar ${saleType}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleSummaryStep;
