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
} from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import { RefreshCcw, Package } from 'lucide-react';
import { LoadingOverlay } from '@/components/design-system';

const UnassignedBoxes = () => {
  const { unassignedBoxes: unassignedBoxesInBodega, refresh } =
    useUnassignedBoxes('BODEGA');
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

  const handleSearchCompatibleForSingleBox = async (boxCode: string) => {
    try {
      setSearchingCompatibleStates((prev) => ({ ...prev, [boxCode]: true }));

      const result = await getCompatiblePalletsForSingleBox(boxCode, 'BODEGA');

      if (result.pallets && result.pallets.length > 0) {
        showSuccess(
          `Se encontraron ${result.pallets.length} pallet(s) compatible(s)`
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

      if (unassignedBoxesInBodega.length === 0) {
        showWarning('No hay cajas sin asignar');
        return;
      }

      const result = await getCompatiblePalletsForAllUnassignedBoxes({
        ubicacion: 'BODEGA',
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

  return (
    <div style={{ padding: '20px' }}>
      <LoadingOverlay show={false} text="Cargando cajas…" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1>Cajas sin asignar</h1>
          <span style={{ fontSize: '14px', color: '#666' }}>{filteredBoxes.length} cajas</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSearchCompatiblePalletsForAll}
            disabled={searchingCompatiblePallets || unassignedBoxesInBodega.length === 0}
            title="Buscar pallets compatibles para todas las cajas sin asignar"
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Package size={16} style={{ marginRight: '4px' }} />
            {searchingCompatiblePallets ? 'Buscando...' : 'Buscar Compatibles'}
          </button>
          <button
            onClick={refresh}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <RefreshCcw size={16} style={{ marginRight: '4px' }} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Componente de filtros */}
      <BoxFilters
        boxes={unassignedBoxesInBodega}
        onFiltersChange={setFilteredBoxes}
        disabled={false}
      />

      {/* Empty State */}
      {filteredBoxes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Package size={48} style={{ marginBottom: '10px', color: '#999' }} />
          <p>
            {unassignedBoxesInBodega.length === 0
              ? 'No hay cajas sin asignar'
              : 'No se encontraron cajas con los filtros aplicados'}
          </p>
        </div>
      ) : (
        /* Boxes Grid */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredBoxes.map((box: any) => (
              <BoxCard
                key={box.codigo}
                box={box}
                setSelectedBox={setSelectedBox}
                setIsModalOpen={setIsModalOpen}
                showCreatePalletButton={true}
                showSearchCompatibleButton={true}
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
              />
            ))}
          </div>
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
