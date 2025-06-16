import { useEffect, useState } from 'react';
import { Box, Pallet } from '@/types';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import '@/styles/PalletDetailModal.css';
import { getBoxByCode } from '@/api/get';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import BoxDetailModal from './BoxDetailModal';
import { formatDate } from '@/utils/formatDate';

interface PalletDetailModalProps {
  pallet: Pallet | null;
  isOpen: boolean;
  onClose: () => void;
  onClosePallet?: (codigo: string) => void;
  onAddBox?: (codigo: string) => void;
  onMovePallet?: (codigo: string, location: string) => void;
}

const PalletDetailModal = ({
  pallet,
  isOpen,
  onClose,
  onClosePallet,
  onAddBox,
  onMovePallet,
}: PalletDetailModalProps) => {
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [showBoxDetailModal, setShowBoxDetailModal] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
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

  if (!isOpen || !pallet) return null;

  const moveLocations = ['TRANSITO', 'BODEGA', 'VENTA'].filter(
    (loc) => loc !== pallet.ubicacion
  );

  const handleBoxClick = async (codigo: string) => {
    try {
      const response = await getBoxByCode(codigo);
      const boxData = extractDataFromResponse(response);
      // extractDataFromResponse returns an array, so we need the first element
      if (boxData && boxData.length > 0) {
        setSelectedBox(boxData[0]);
        setShowBoxDetailModal(true);
      } else {
        console.warn('No box data found for codigo:', codigo);
      }
    } catch (error) {
      console.error('Error fetching box details:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Pallet {pallet.codigo}</h2>
            <div className="modal-badges">
              <span className={`status-badge ${pallet.estado.toLowerCase()}`}>
                {pallet.estado.toUpperCase()}
              </span>
              <span
                className={`location-badge ${pallet.ubicacion.toLowerCase()}`}
              >
                {pallet.ubicacion}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Basic Info */}
          <div className="modal-section">
            <h3 className="section-title">Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Calibre</span>
                <span className="info-value calibre-text">
                  {formatCalibreName(pallet.calibre)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Cantidad de Cajas</span>
                <span className="info-value large">{pallet.cantidadCajas}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha Creación</span>
                <span className="info-value">
                  {formatDate(pallet.fechaCreacion)}
                </span>
              </div>
            </div>
          </div>

          {/* Boxes */}
          <div className="modal-section">
            <h3 className="section-title">Cajas ({pallet.cajas.length})</h3>
            {pallet.cajas.length === 0 ? (
              <div className="boxes-empty">No hay cajas en este pallet</div>
            ) : (
              <div className="boxes-container">
                <div className="boxes-grid">
                  {pallet.cajas.map((caja, index) => (
                    <div
                      key={index}
                      className="box-item"
                      onClick={() => handleBoxClick(caja)}
                      style={{ cursor: 'pointer' }}
                    >
                      {caja}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {pallet.estado === 'open' && (
            <div className="modal-actions">
              <button
                className="action-button secondary"
                onClick={() => onAddBox?.(pallet.codigo)}
              >
                + Añadir Caja
              </button>

              <div className="move-dropdown">
                <button
                  className="action-button warning"
                  onClick={() => setShowMoveOptions(!showMoveOptions)}
                >
                  Mover Pallet ▼
                </button>

                {showMoveOptions && (
                  <div className="move-options">
                    {moveLocations.map((location) => (
                      <button
                        key={location}
                        className="move-option"
                        onClick={() => {
                          onMovePallet?.(pallet.codigo, location);
                          setShowMoveOptions(false);
                        }}
                      >
                        Mover a {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="action-button primary"
                onClick={() => onClosePallet?.(pallet.codigo)}
              >
                Cerrar Pallet
              </button>
            </div>
          )}
        </div>
      </div>
      <BoxDetailModal
        box={selectedBox}
        isOpen={showBoxDetailModal}
        onClose={() => setShowBoxDetailModal(false)}
      />
    </div>
  );
};

export default PalletDetailModal;
