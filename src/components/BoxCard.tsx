import { Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import { Card, Button } from '@/components/design-system';
import { Calendar, Package, MapPin, Check } from 'lucide-react';
import { clsx } from 'clsx';

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

  const locationColors = {
    packing: 'bg-blue-100 text-blue-700 border-blue-200',
    bodega: 'bg-green-100 text-green-700 border-green-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const locationColor = locationColors[box.ubicacion.toLowerCase() as keyof typeof locationColors] || locationColors.default;

  return (
    <Card
      className={clsx(
        'relative transition-all duration-200',
        isSelectable && 'cursor-pointer',
        isSelected && 'ring-2 ring-macos-accent ring-offset-2'
      )}
      onClick={handleCardClick}
      isPressable={isSelectable}
    >
      {/* Selection Checkbox */}
      {isSelectable && (
        <div
          className={clsx(
            'absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-macos-accent border-macos-accent'
              : 'bg-white border-macos-border hover:border-macos-accent'
          )}
          onClick={handleCheckboxClick}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-macos-text">{box.codigo}</h3>
        <span className={clsx(
          'px-2.5 py-1 text-xs font-medium rounded-macos-sm border',
          locationColor
        )}>
          <MapPin className="w-3 h-3 inline mr-1" />
          {box.ubicacion}
        </span>
      </div>

      {/* Card Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-macos-text-secondary mr-2" />
          <span className="text-macos-text-secondary">Fecha:</span>
          <span className="text-macos-text ml-1 font-medium">
            {formatDate(box.fecha_registro)}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <Package className="w-4 h-4 text-macos-text-secondary mr-2" />
          <span className="text-macos-text-secondary">Calibre:</span>
          <span className="text-macos-text ml-1 font-medium">
            {formatCalibreName(box.calibre.toString())}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBox(box);
            setIsModalOpen(true);
          }}
        >
          Ver Detalles
        </Button>
        
        {showCreatePalletButton && onCreateSinglePallet && (
          <Button
            variant="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSinglePallet(box.codigo);
            }}
            disabled={isCreatingPallet || isAssigningToCompatible}
            isLoading={isCreatingPallet}
          >
            {!isCreatingPallet && 'Crear Pallet Individual'}
          </Button>
        )}
        
        {showAssignToCompatibleButton && onAssignToCompatiblePallet && (
          <Button
            variant="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAssignToCompatiblePallet(box.codigo);
            }}
            disabled={isCreatingPallet || isAssigningToCompatible}
            isLoading={isAssigningToCompatible}
            className="!bg-macos-success hover:!bg-green-600"
          >
            {!isAssigningToCompatible && 'Asignar a Compatible'}
          </Button>
        )}
        
        {box.estado === 'open' && (
          <Button variant="primary" size="small">
            Cerrar Pallet
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BoxCard;
