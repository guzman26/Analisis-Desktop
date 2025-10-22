import React, { useState } from 'react';
import { Box } from '@/types';
import { useUnassignedBoxes } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';
import BoxFilters from '@/components/BoxFilters';
import {
  createSingleBoxPallet,
  assignBoxToCompatiblePallet,
  getCompatiblePalletsForAllUnassignedBoxes,
} from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';

const UnassignedBoxes = () => {
  const { unassignedBoxes: unassignedBoxesInBodega, refresh } =
    useUnassignedBoxes('BODEGA');
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
  const [searchingCompatiblePallets, setSearchingCompatiblePallets] =
    useState(false);
  const { showSuccess, showError, showWarning } = useNotifications();

  // Data is automatically fetched by useUnassignedBoxes hook
  // Inicializar filteredBoxes con todas las cajas
  React.useEffect(() => {
    setFilteredBoxes(unassignedBoxesInBodega);
  }, [unassignedBoxesInBodega]);

  const handleCreateSinglePallet = async (boxCode: string) => {
    try {
      // Establecer el estado de carga para esta caja específica
      setCreatingPalletStates((prev) => ({ ...prev, [boxCode]: true }));

      const result = await createSingleBoxPallet(boxCode, 'BODEGA');

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

  const handleSearchCompatiblePalletsForAll = async () => {
    try {
      setSearchingCompatiblePallets(true);

      if (unassignedBoxesInBodega.length === 0) {
        showWarning('No hay cajas sin asignar');
        return;
      }

      const result = await getCompatiblePalletsForAllUnassignedBoxes({
        ubicacion: 'BODEGA',
      });

      if (result && Object.keys(result).length > 0) {
        const totalAssigned = Object.values(result).filter(
          (r: any) => r.success
        ).length;
        showSuccess(
          `Búsqueda completada: ${totalAssigned} cajas con pallets compatibles encontrados`
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

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Cajas sin asignar</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSearchCompatiblePalletsForAll}
            disabled={
              searchingCompatiblePallets || unassignedBoxesInBodega.length === 0
            }
            title="Buscar pallets compatibles para todas las cajas sin asignar"
          >
            {searchingCompatiblePallets ? 'Buscando...' : 'Buscar Compatibles'}
          </button>
          <button onClick={refresh}>Refrescar</button>
        </div>
        <div className="open-pallets-count">
          {filteredBoxes.length} de {unassignedBoxesInBodega.length} cajas
        </div>
      </div>

      {/* Componente de filtros */}
      <BoxFilters
        boxes={unassignedBoxesInBodega}
        onFiltersChange={setFilteredBoxes}
      />

      {/* Empty State */}
      {filteredBoxes.length === 0 ? (
        <div className="open-pallets-empty">
          <p>
            {unassignedBoxesInBodega.length === 0
              ? 'No hay cajas sin asignar'
              : 'No se encontraron cajas con los filtros aplicados'}
          </p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {filteredBoxes.map((box: any) => (
            <BoxCard
              key={box.codigo}
              box={box}
              setSelectedBox={setSelectedBox}
              setIsModalOpen={setIsModalOpen}
              showCreatePalletButton={true}
              showAssignToCompatibleButton={true}
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
              isCreatingPallet={creatingPalletStates[box.codigo]}
              isAssigningToCompatible={assigningToCompatibleStates[box.codigo]}
              onDeleted={refresh}
            />
          ))}
        </div>
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
