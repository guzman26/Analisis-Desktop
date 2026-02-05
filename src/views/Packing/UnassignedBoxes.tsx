import React, { useState } from 'react';
import { Box } from '@/types';
import { useUnassignedBoxes } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';
import BoxFilters from '@/components/BoxFilters';
import {
  createSingleBoxPallet,
  getCompatiblePalletsForSingleBox,
  getCompatiblePalletsForAllUnassignedBoxes,
  deleteBox,
} from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import { RefreshCcw, Package, CheckSquare, Square, Trash2 } from 'lucide-react';
import { LoadingOverlay } from '@/components/design-system';
import styles from './UnassignedBoxes.module.css';

const UnassignedBoxes = () => {
  const {
    unassignedBoxes: unassignedBoxesInPacking,
    hasMore,
    loadMore,
    refresh,
    loading,
    setServerFilters,
  } = useUnassignedBoxes('PACKING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [creatingPalletStates, setCreatingPalletStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchingCompatibleStates, setSearchingCompatibleStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchingCompatiblePallets, setSearchingCompatiblePallets] =
    useState(false);
  const { showSuccess, showError, showWarning } = useNotifications();

  // Estado para selección múltiple
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBoxCodes, setSelectedBoxCodes] = useState<Set<string>>(new Set());
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Data is automatically fetched by useUnassignedBoxes hook
  // Inicializar filteredBoxes con todas las cajas
  React.useEffect(() => {
    setFilteredBoxes(unassignedBoxesInPacking);
  }, [unassignedBoxesInPacking]);

  const handleCreateSinglePallet = async (boxCode: string) => {
    try {
      // Establecer el estado de carga para esta caja específica
      setCreatingPalletStates((prev) => ({ ...prev, [boxCode]: true }));

      const result = await createSingleBoxPallet(boxCode, 'PACKING');

      // Refrescar la lista después de crear el pallet
      await refresh();

      showSuccess(`Pallet individual creado: ${result.pallet.codigo}`);
    } catch (error) {
      console.error('Error al crear pallet individual:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Error al crear pallet individual'
      );
    } finally {
      // Remover el estado de carga
      setCreatingPalletStates((prev) => {
        const newStates = { ...prev };
        delete newStates[boxCode];
        return newStates;
      });
    }
  };

  const handleSearchCompatibleForSingleBox = async (boxCode: string) => {
    try {
      setSearchingCompatibleStates((prev) => ({ ...prev, [boxCode]: true }));

      const result = await getCompatiblePalletsForSingleBox(boxCode, 'PACKING', true);

      // Manejar respuesta con autoAssign
      if (result.assigned && result.assignedToPallet) {
        showSuccess(
          result.message || `Caja asignada automáticamente a pallet ${result.assignedToPallet}`
        );
        // Refrescar la lista para que la caja desaparezca
        await refresh();
      } else if (result.pallets && result.pallets.length > 0) {
        showSuccess(
          `Se encontraron ${result.pallets.length} pallet(s) compatible(s)`
        );
      } else if (result.totalCompatible > 0) {
        showSuccess(
          `Se encontraron ${result.totalCompatible} pallet(s) compatible(s)`
        );
      } else {
        showWarning('No hay pallets compatibles para esta caja');
      }
    } catch (error) {
      console.error('Error buscando pallets compatibles:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Error al buscar pallets compatibles'
      );
    } finally {
      setSearchingCompatibleStates((prev) => {
        const newStates = { ...prev };
        delete newStates[boxCode];
        return newStates;
      });
    }
  };

  const handleSearchCompatiblePalletsForAll = async () => {
    try {
      setSearchingCompatiblePallets(true);

      if (unassignedBoxesInPacking.length === 0) {
        showWarning('No hay cajas sin asignar');
        return;
      }

      const result = await getCompatiblePalletsForAllUnassignedBoxes({
        ubicacion: 'PACKING',
      });

      if (result && Object.keys(result).length > 0) {
        const totalWithCompatibles = Object.values(result).filter(
          (r: any) => r.compatible && r.compatible.totalCompatible > 0
        ).length;
        showSuccess(
          `Búsqueda completada: ${totalWithCompatibles} cajas con pallets compatibles encontrados`
        );
        // Refrescar para ver los cambios
        await refresh();
      } else {
        showWarning(
          'No se encontraron pallets compatibles para las cajas sin asignar'
        );
      }
    } catch (error) {
      console.error('Error buscando pallets compatibles:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Error al buscar pallets compatibles'
      );
    } finally {
      setSearchingCompatiblePallets(false);
    }
  };

  // Handlers para selección múltiple
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedBoxCodes(new Set());
    }
  };

  const handleSelectionToggle = (boxCode: string) => {
    setSelectedBoxCodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(boxCode)) {
        newSet.delete(boxCode);
      } else {
        newSet.add(boxCode);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedBoxCodes.size === filteredBoxes.length) {
      setSelectedBoxCodes(new Set());
    } else {
      setSelectedBoxCodes(new Set(filteredBoxes.map(b => b.codigo)));
    }
  };

  const handleDeleteSelectedBoxes = async () => {
    if (selectedBoxCodes.size === 0) return;

    const confirmed = window.confirm(
      `¿Estás seguro que deseas eliminar las ${selectedBoxCodes.size} cajas seleccionadas?\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsDeletingSelected(true);
    let deletedCount = 0;
    let errorCount = 0;

    try {
      for (const codigo of selectedBoxCodes) {
        try {
          await deleteBox(codigo);
          deletedCount++;
        } catch (error) {
          console.error(`Error al eliminar caja ${codigo}:`, error);
          errorCount++;
        }
      }

      if (deletedCount > 0) {
        showSuccess(`Se eliminaron exitosamente ${deletedCount} caja(s)`);
      }
      if (errorCount > 0) {
        showError(`No se pudieron eliminar ${errorCount} caja(s)`);
      }

      setSelectedBoxCodes(new Set());
      setIsSelectionMode(false);
      await refresh();
    } catch (error: any) {
      showError(error.message || 'Error al eliminar las cajas seleccionadas');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay show={loading} text="Cargando cajas…" />
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 className={styles.title}>Cajas sin asignar</h1>
          <span className={styles.count}>{filteredBoxes.length} cajas</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Botón de selección */}
          <button
            className={styles.refreshButton}
            onClick={handleToggleSelectionMode}
            disabled={filteredBoxes.length === 0}
            style={isSelectionMode ? { backgroundColor: 'var(--blue-500)' } : undefined}
          >
            {isSelectionMode ? <Square size={16} /> : <CheckSquare size={16} />}
            {isSelectionMode ? 'Cancelar Selección' : 'Seleccionar'}
          </button>

          {isSelectionMode && (
            <>
              <button
                className={styles.refreshButton}
                onClick={handleSelectAll}
                disabled={filteredBoxes.length === 0}
              >
                <CheckSquare size={16} />
                {selectedBoxCodes.size === filteredBoxes.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
              </button>
              <button
                className={styles.refreshButton}
                onClick={handleDeleteSelectedBoxes}
                disabled={isDeletingSelected || selectedBoxCodes.size === 0}
                style={{
                  backgroundColor: '#dc3545',
                  opacity: selectedBoxCodes.size === 0 ? 0.6 : 1,
                }}
              >
                <Trash2 size={16} />
                {isDeletingSelected ? 'Eliminando...' : `Eliminar Seleccionadas (${selectedBoxCodes.size})`}
              </button>
            </>
          )}

          {!isSelectionMode && (
            <>
              <button
                className={styles.refreshButton}
                onClick={handleSearchCompatiblePalletsForAll}
                disabled={loading || searchingCompatiblePallets || unassignedBoxesInPacking.length === 0}
                title="Buscar pallets compatibles para todas las cajas sin asignar"
              >
                <Package size={16} />
                {searchingCompatiblePallets ? 'Buscando...' : 'Buscar Compatibles'}
              </button>
              <button
                className={styles.refreshButton}
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCcw size={16} />
                {loading ? 'Actualizando...' : 'Refrescar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Componente de filtros */}
      <BoxFilters
        boxes={unassignedBoxesInPacking}
        onFiltersChange={setFilteredBoxes}
        onServerFiltersChange={(filters) => {
          // Trigger a refresh with server-side filters
          setServerFilters(filters as any);
        }}
        disabled={loading}
      />

      {/* Empty State */}
      {filteredBoxes.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>
            {unassignedBoxesInPacking.length === 0
              ? 'No hay cajas sin asignar'
              : 'No se encontraron cajas con los filtros aplicados'}
          </p>
        </div>
      ) : (
        /* Boxes Grid */
        <>
          <div className={styles.grid}>
            {filteredBoxes.map((box: any) => (
              <BoxCard
                key={box.codigo}
                box={box}
                setSelectedBox={setSelectedBox}
                setIsModalOpen={setIsModalOpen}
                showCreatePalletButton={!isSelectionMode}
                showSearchCompatibleButton={!isSelectionMode}
                isCreatingPallet={creatingPalletStates[box.codigo] || false}
                isSearchingCompatible={searchingCompatibleStates[box.codigo] || false}
                onCreateSinglePallet={
                  creatingPalletStates[box.codigo]
                    ? undefined
                    : handleCreateSinglePallet
                }
                onSearchCompatible={
                  searchingCompatibleStates[box.codigo]
                    ? undefined
                    : handleSearchCompatibleForSingleBox
                }
                onDeleted={refresh}
                isSelectable={isSelectionMode}
                isSelected={selectedBoxCodes.has(box.codigo)}
                onSelectionToggle={handleSelectionToggle}
              />
            ))}
          </div>

          {hasMore && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <button
                className={styles.refreshButton}
                onClick={loadMore}
                disabled={loading}
              >
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      <BoxDetailModal
        box={selectedBox}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBox(null);
        }}
      />
    </div>
  );
};

export default UnassignedBoxes;
