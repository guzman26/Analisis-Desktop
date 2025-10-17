import React, { useState } from 'react';
import { Box } from '@/types';
import { useUnassignedBoxes } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';
import BoxFilters from '@/components/BoxFilters';
import {
  createSingleBoxPallet,
  assignBoxToCompatiblePallet,
} from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import { RefreshCcw, Package } from 'lucide-react';
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
  const [assigningToCompatibleStates, setAssigningToCompatibleStates] =
    useState<{
      [key: string]: boolean;
    }>({});
  const { showSuccess, showError, showWarning } = useNotifications();

  // Data is automatically fetched by useUnassignedBoxes hook
  // Inicializar filteredBoxes con todas las cajas
  React.useEffect(() => {
    setFilteredBoxes(unassignedBoxesInPacking);
  }, [unassignedBoxesInPacking]);

  // Server-side filters state to pass to context
  // No local server filters state needed; we forward filters to context

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

  const handleAssignToCompatiblePallet = async (boxCode: string) => {
    try {
      // Establecer el estado de carga para esta caja específica
      setAssigningToCompatibleStates((prev) => ({ ...prev, [boxCode]: true }));

      const result = await assignBoxToCompatiblePallet(boxCode);

      if (result.success) {
        // Refrescar la lista después de asignar a pallet compatible
        await refresh();

        if (result.created) {
          showSuccess(`Pallet ${result.palletId} creado y caja asignada`);
        } else if (result.alreadyAssigned) {
          showWarning(`Caja ya estaba asignada a ${result.palletId}`);
        } else {
          showSuccess(
            `Caja asignada a pallet ${result.palletId} (${result.boxCount}/${result.maxBoxes})`
          );
        }
      } else {
        // No se pudo asignar
        if (result.full) {
          showWarning(`El pallet ${result.palletId} está lleno`);
        } else {
          showWarning(result.message || 'No se pudo asignar la caja');
        }
      }
    } catch (error) {
      console.error('Error al asignar caja a pallet compatible:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Error al asignar caja a pallet compatible'
      );
    } finally {
      // Remover el estado de carga
      setAssigningToCompatibleStates((prev) => {
        const newStates = { ...prev };
        delete newStates[boxCode];
        return newStates;
      });
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
        <button
          className={styles.refreshButton}
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCcw size={16} />
          {loading ? 'Actualizando...' : 'Refrescar'}
        </button>
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
                showCreatePalletButton={true}
                showAssignToCompatibleButton={true}
                isCreatingPallet={creatingPalletStates[box.codigo] || false}
                isAssigningToCompatible={
                  assigningToCompatibleStates[box.codigo] || false
                }
                onCreateSinglePallet={
                  creatingPalletStates[box.codigo]
                    ? undefined
                    : handleCreateSinglePallet
                }
                onAssignToCompatiblePallet={
                  assigningToCompatibleStates[box.codigo]
                    ? undefined
                    : handleAssignToCompatiblePallet
                }
                onDeleted={refresh}
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
