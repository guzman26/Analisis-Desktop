import React from 'react';
import { Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import {
  formatCalibreName,
  getDateFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { Button } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, Tag, Clipboard, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { deleteBox } from '@/api/endpoints';
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
  onSearchCompatible?: (boxCode: string) => void;
  showCreatePalletButton?: boolean;
  showAssignToCompatibleButton?: boolean;
  showSearchCompatibleButton?: boolean;
  isCreatingPallet?: boolean;
  isAssigningToCompatible?: boolean;
  isSearchingCompatible?: boolean;
  onDeleted?: () => void | Promise<void>;
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
  onSearchCompatible,
  showCreatePalletButton = false,
  showAssignToCompatibleButton = false,
  showSearchCompatibleButton = false,
  isCreatingPallet = false,
  isAssigningToCompatible = false,
  isSearchingCompatible = false,
  onDeleted,
}: BoxCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle selection if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (isSelectable && onSelectionToggle) {
      onSelectionToggle(box.codigo);
    } else {
      // If not selectable, show details
      setSelectedBox(box);
      setIsModalOpen(true);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectionToggle) {
      onSelectionToggle(box.codigo);
    }
  };

  // Usar función centralizada para obtener fecha desde código
  const formattedDate = box.fecha_registro
    ? formatDate(box.fecha_registro)
    : getDateFromCodigo(box.codigo);
  const calibre = formatCalibreName(box.calibre);

  const locationStyles: Record<string, string> = {
    packing: 'bg-blue-100 text-blue-700',
    bodega: 'bg-green-100 text-green-700',
    venta: 'bg-purple-100 text-purple-700',
    transito: 'bg-orange-100 text-orange-700',
    default: 'bg-gray-100 text-gray-700',
  };

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteBox(box.codigo);
      setShowDeleteModal(false);

      // Llamar al callback de eliminación si existe
      if (onDeleted) {
        await onDeleted();
      }
    } catch (e) {
      console.error('Error al eliminar caja', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      className={clsx(
        'relative transition-shadow',
        isSelectable && 'cursor-pointer',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold">{box.codigo}</span>
          <Badge
            className={locationStyles[box.ubicacion?.toLowerCase() ?? ''] || locationStyles.default}
          >
            <MapPin size={12} className="mr-1" />
            {box.ubicacion}
          </Badge>
        </div>

        {isSelectable && (
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground"
            onClick={handleCheckboxClick}
          >
            <Checkbox checked={isSelected} />
            <span>Seleccionar</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Código</span>
            <span className="font-medium">{box.codigo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar size={14} /> Fecha
            </span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Tag size={14} /> Calibre
            </span>
            <span className="font-medium">{calibre}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="small"
          leftIcon={<Clipboard size={14} />}
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
            disabled={
              isCreatingPallet ||
              isAssigningToCompatible ||
              isSearchingCompatible
            }
            isLoading={isCreatingPallet}
          >
            {!isCreatingPallet && 'Crear Pallet Individual'}
          </Button>
        )}

        {showSearchCompatibleButton && onSearchCompatible && (
          <Button
            variant="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSearchCompatible(box.codigo);
            }}
            disabled={
              isCreatingPallet ||
              isAssigningToCompatible ||
              isSearchingCompatible
            }
            isLoading={isSearchingCompatible}
            className="!bg-blue-500-transparentize-6 !text-blue-500 hover:!bg-blue-500-transparentize-5"
          >
            {!isSearchingCompatible && 'Buscar Compatible'}
          </Button>
        )}

        {showAssignToCompatibleButton && onAssignToCompatiblePallet && (
          <Button
            variant="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAssignToCompatiblePallet(box.codigo);
            }}
            disabled={
              isCreatingPallet ||
              isAssigningToCompatible ||
              isSearchingCompatible
            }
            isLoading={isAssigningToCompatible}
            className="!bg-green-500-transparentize-6 !text-green-500 hover:!bg-green-500-transparentize-5"
          >
            {!isAssigningToCompatible && 'Asignar a Compatible'}
          </Button>
        )}

        {/* Delete button */}
        <Button
          variant="secondary"
          size="small"
          leftIcon={<Trash2 size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
          className="text-destructive hover:text-destructive"
        >
          Eliminar
        </Button>
      </div>
      </CardContent>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar caja"
        description={`¿Seguro que deseas eliminar la caja ${box.codigo}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </Card>
  );
};

export default BoxCard;
