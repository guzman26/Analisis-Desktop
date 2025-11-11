import React from 'react';
import { Box } from '@/types';
import { formatDate } from '@/utils/formatDate';
import {
  formatCalibreName,
  getDateFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { Button } from '@/components/design-system';
import { Calendar, MapPin, Check, Tag, Clipboard, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { deleteBox } from '@/api/endpoints';
import { clsx } from 'clsx';
import styles from './BoxCard.module.css';

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

  // Determine color for status indicator based on location
  const getLocationColor = (location: string) => {
    switch (location.toLowerCase()) {
      case 'packing':
        return 'var(--macos-blue)';
      case 'bodega':
        return 'var(--macos-green)';
      case 'venta':
        return 'var(--macos-purple)';
      case 'transito':
        return 'var(--macos-orange)';
      default:
        return 'var(--macos-gray-5)';
    }
  };

  // Get the appropriate CSS class for the location badge
  const getLocationClass = (location: string) => {
    switch (location.toLowerCase()) {
      case 'packing':
        return styles.locationPacking;
      case 'bodega':
        return styles.locationBodega;
      case 'venta':
        return styles.locationVenta;
      case 'transito':
        return styles.locationTransito;
      default:
        return styles.locationDefault;
    }
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
    <div
      className={clsx(
        styles.boxCard,
        isSelectable && styles.selectable,
        isSelected && styles.selected
      )}
      onClick={handleCardClick}
    >
      {/* Status indicator */}
      <div
        className={styles.statusIndicator}
        style={{ backgroundColor: getLocationColor(box.ubicacion) }}
      />

      {/* Selection Checkbox */}
      {isSelectable && (
        <div className={styles.checkboxContainer}>
          <div
            className={clsx(
              styles.checkbox,
              isSelected && styles.checkboxSelected
            )}
            onClick={handleCheckboxClick}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      {/* Header with code and location */}
      <div className={styles.header}>
        <div className={styles.codeContainer}>
          <span className={styles.code}>{box.codigo}</span>
        </div>
        <span className={`${styles.badge} ${getLocationClass(box.ubicacion)}`}>
          <MapPin size={12} className="mr-1" />
          {box.ubicacion}
        </span>
      </div>

      {/* Info Cards Section */}
      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Código</div>
          <div className={styles.infoValue}>{box.codigo}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>
            <Calendar size={14} />
            Fecha
          </div>
          <div className={styles.infoValue}>{formattedDate}</div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>
            <Tag size={14} />
            Calibre
          </div>
          <div className={styles.infoValue}>{calibre}</div>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.actions}>
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
            className="!bg-macos-blue-transparentize-6 !text-macos-blue hover:!bg-macos-blue-transparentize-5"
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
            className="!bg-macos-green-transparentize-6 !text-macos-green hover:!bg-macos-green-transparentize-5"
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
          className="!bg-macos-danger-transparentize-6 !text-macos-danger hover:!bg-macos-danger-transparentize-5"
        >
          Eliminar
        </Button>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar caja"
        description={`¿Seguro que deseas eliminar la caja ${box.codigo}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
};

export default BoxCard;
