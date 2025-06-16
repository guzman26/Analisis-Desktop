import { useEffect, useState } from 'react';
import { Box } from '@/types';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import '@/styles/BoxDetailModal.css';
import { unassignBox } from '@/api/post';

interface BoxDetailModalProps {
  box: Box | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveBox?: (codigo: string, location: string) => void;
  onUnassignBox?: (codigo: string) => void;
}

const BoxDetailModal = ({ box, isOpen, onClose }: BoxDetailModalProps) => {
  const [showUnassignBoxModal, setShowUnassignBoxModal] = useState(false);
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

  if (!isOpen || !box) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'active':
        return 'success';
      case 'inactivo':
      case 'inactive':
        return 'error';
      default:
        return 'info';
    }
  };

  const moveLocations = ['PACKING', 'TRANSITO', 'BODEGA', 'VENTA'].filter(
    (loc) => loc !== box.ubicacion
  );

  const handleUnassignBox = async (codigo: string) => {
    await unassignBox(codigo);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Caja {box.codigo}</h2>
            <div className="modal-badges">
              <span className={`status-badge ${getStatusColor(box.estado)}`}>
                {box.estado.toUpperCase()}
              </span>
              <span className={`location-badge ${box.ubicacion.toLowerCase()}`}>
                {box.ubicacion}
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
                <span className="info-label">Código</span>
                <span className="info-value">{box.codigo}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Empacadora</span>
                <span className="info-value">{box.empacadora}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Calibre</span>
                <span className="info-value calibre-text">
                  {formatCalibreName(box.calibre.toString().padStart(2, '0'))}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Formato Caja</span>
                <span className="info-value">{box.formato_caja}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Operario</span>
                <span className="info-value">{box.operario}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estado</span>
                <span
                  className={`info-value status-text ${getStatusColor(box.estado)}`}
                >
                  {box.estado.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ubicación</span>
                <span
                  className={`info-value location-text ${box.ubicacion.toLowerCase()}`}
                >
                  {box.ubicacion}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Número de Caja</span>
                <span className="info-value">{box.contador}</span>
              </div>
            </div>
          </div>

          {/* Production Info */}
          <div className="modal-section">
            <h3 className="section-title">Información de Producción</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Fecha Registro</span>
                <span className="info-value">
                  {formatDate(box.fecha_registro)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Semana</span>
                <span className="info-value">{box.semana}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Año</span>
                <span className="info-value">{box.año}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Día de la Semana</span>
                <span className="info-value">{box.dia_semana}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Horario Proceso</span>
                <span className="info-value">{box.horario_proceso}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pallet ID</span>
                <span className="info-value pallet-link">{box.palletId}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {box.descripcion && (
            <div className="modal-section">
              <h3 className="section-title">Descripción</h3>
              <div className="description-box">
                <p>{box.descripcion}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            {moveLocations.length > 0 && (
              <div className="move-dropdown">
                <button
                  className="action-button warning"
                  onClick={() => {
                    /* Toggle move options */
                  }}
                >
                  Mover Caja ▼
                </button>
                {/* Move options would go here */}
              </div>
            )}

            <button
              className="action-button error"
              onClick={() => setShowUnassignBoxModal(true)}
            >
              Dar caja de baja
            </button>
          </div>
        </div>
      </div>
      {showUnassignBoxModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUnassignBoxModal(false)}
        >
          <div
            className="modal-content unassign-box-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Dar caja de baja</h2>
            <p>¿Estás seguro de querer dar de baja la caja {box.codigo}?</p>
            <button
              className="action-button error"
              onClick={() => handleUnassignBox(box.codigo)}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxDetailModal;
