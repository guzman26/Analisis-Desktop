import { Box } from '@/types';
import '@/styles/BoxCard.css';
import { formatDate } from '@/utils/formatDate';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';

interface BoxCardProps {
  box: Box;
  setSelectedBox: (box: Box) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: (boxCode: string) => void;
  onCreateSinglePallet?: (boxCode: string) => void;
  onAssignToCompatiblePallet?: (boxCode: string) => void;
  showCreatePalletButton?: boolean;
  showAssignToCompatibleButton?: boolean;
  isCreatingPallet?: boolean;
  isAssigningToCompatible?: boolean;
}

const BoxCard = ({
  box,
  setSelectedBox,
  setIsModalOpen,
  isSelectable = false,
  isSelected = false,
  onSelectionToggle,
  onCreateSinglePallet,
  onAssignToCompatiblePallet,
  showCreatePalletButton = false,
  showAssignToCompatibleButton = false,
  isCreatingPallet = false,
  isAssigningToCompatible = false,
}: BoxCardProps) => {
  console.log('box', box);
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle selection if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (isSelectable && onSelectionToggle) {
      onSelectionToggle(box.codigo);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectionToggle) {
      onSelectionToggle(box.codigo);
    }
  };

  const cardClasses = [
    'box-card',
    isSelectable ? 'selectable' : '',
    isSelected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div key={box.codigo} className={cardClasses} onClick={handleCardClick}>
      {/* Selection Checkbox */}
      {isSelectable && (
        <div className="selection-checkbox" onClick={handleCheckboxClick}>
          {isSelected && '✓'}
        </div>
      )}
      {/* Card Header */}
      <div className="box-card-header">
        <span className="box-code">{box.codigo}</span>

        <span className={`location-badge ${box.ubicacion.toLowerCase()}`}>
          {box.ubicacion}
        </span>
      </div>

      {/* Card Info */}
      <div className="box-info">
        <div className="box-info-item">
          <span className="box-info-label">Fecha:</span>
          <span className="box-info-value">
            {formatDate(box.fecha_registro)}
          </span>
        </div>

        <div className="box-info-item">
          <span className="box-info-label">Calibre:</span>
          <span className="box-info-value small">
            {formatCalibreName(box.calibre.toString())}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pallet-actions">
        <button
          className="btn-secondary"
          onClick={() => {
            setSelectedBox(box);
            setIsModalOpen(true);
          }}
        >
          Ver Detalles
        </button>
        {showCreatePalletButton && onCreateSinglePallet && (
          <button
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSinglePallet(box.codigo);
            }}
            disabled={isCreatingPallet || isAssigningToCompatible}
          >
            {isCreatingPallet ? 'Creando...' : 'Crear Pallet Individual'}
          </button>
        )}
        {showAssignToCompatibleButton && onAssignToCompatiblePallet && (
          <button
            className="btn-success"
            onClick={(e) => {
              e.stopPropagation();
              onAssignToCompatiblePallet(box.codigo);
            }}
            disabled={isCreatingPallet || isAssigningToCompatible}
          >
            {isAssigningToCompatible ? 'Asignando...' : 'Asignar a Compatible'}
          </button>
        )}
        {box.estado === 'open' && (
          <button className="btn-primary">Cerrar Pallet</button>
        )}
      </div>
    </div>
  );
};

export default BoxCard;
