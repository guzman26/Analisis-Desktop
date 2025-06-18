import React, { useState } from 'react';
import { Customer } from '@/types';

interface BoxData {
  boxId: string;
  palletCode: string;
  calibre: string;
}

interface SaleSummaryStepProps {
  customer: Customer;
  boxes: BoxData[];
  onConfirm: (unitPrice: number) => void;
  isSubmitting: boolean;
}

const SaleSummaryStep: React.FC<SaleSummaryStepProps> = ({
  customer,
  boxes,
  onConfirm,
  isSubmitting,
}) => {
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const totalBoxes = boxes.length;
  const totalPrice = unitPrice * totalBoxes;

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setUnitPrice(value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleConfirm = () => {
    onConfirm(unitPrice);
  };

  const isValidPrice = unitPrice > 0;

  return (
    <div className="sale-summary-step">
      <div className="summary-section">
        <h2>Resumen de Venta</h2>

        {/* Customer Details */}
        <div className="customer-details">
          <h3>Cliente Seleccionado</h3>
          <div className="customer-info">
            <div className="info-row">
              <span className="label">Nombre:</span>
              <span className="value">{customer.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{customer.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Teléfono:</span>
              <span className="value">{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="info-row">
                <span className="label">Dirección:</span>
                <span className="value">{customer.address}</span>
              </div>
            )}
            {customer.taxId && (
              <div className="info-row">
                <span className="label">RUT:</span>
                <span className="value">{customer.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>Información de Precio</h3>
          <div className="price-input-group">
            <label htmlFor="unitPrice">Precio por Caja:</label>
            <div className="price-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="unitPrice"
                value={unitPrice || ''}
                onChange={handleUnitPriceChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="price-input"
              />
            </div>
          </div>
        </div>

        {/* Boxes Summary */}
        <div className="boxes-summary">
          <h3>Cajas Seleccionadas</h3>
          <div className="boxes-total">
            <span className="total-count">Total de cajas: {totalBoxes}</span>
          </div>

          <div className="boxes-list">
            {boxes.map((box) => (
              <div key={box.boxId} className="box-item">
                <div className="box-code">
                  <span className="label">Código:</span>
                  <span className="value">{box.boxId}</span>
                </div>
                <div className="box-calibre">
                  <span className="label">Calibre:</span>
                  <span className="value">{box.calibre}</span>
                </div>
                <div className="box-location">
                  <span className="label">Pallet:</span>
                  <span className="value">{box.palletCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <h3>Notas Adicionales</h3>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Agregar notas sobre la venta (opcional)..."
            className="notes-textarea"
            rows={3}
            maxLength={500}
          />
          <div className="notes-counter">{notes.length}/500 caracteres</div>
        </div>

        {/* Summary Totals */}
        <div className="summary-totals">
          <div className="total-item">
            <span className="total-label">Total de Cajas:</span>
            <span className="total-value">{totalBoxes}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Precio por Caja:</span>
            <span className="total-value">${unitPrice.toFixed(2)}</span>
          </div>
          <div className="total-item total-final">
            <span className="total-label">Total de la Venta:</span>
            <span className="total-value">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Confirmation */}
        <div className="confirmation-section">
          <p className="confirmation-text">
            ¿Confirma que desea procesar esta venta de {totalBoxes} cajas por un
            total de ${totalPrice.toFixed(2)} para el cliente {customer.name}?
          </p>

          <div className="confirmation-actions">
            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-primary btn-confirm"
              disabled={isSubmitting || !isValidPrice}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </div>

          {!isValidPrice && (
            <p className="price-error">
              Por favor ingrese un precio válido mayor a $0.00
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleSummaryStep;
