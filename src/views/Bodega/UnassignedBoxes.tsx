import React, { useState } from 'react';
import { Box } from '@/types';
import { useUnassignedBoxes } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';
import BoxFilters from '@/components/BoxFilters';
import { createSingleBoxPallet } from '@/api/endpoints';

const UnassignedBoxes = () => {
  const { unassignedBoxes: unassignedBoxesInBodega } =
    useUnassignedBoxes('BODEGA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [creatingPalletStates, setCreatingPalletStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Data is automatically fetched by useUnassignedBoxes hook
  // Inicializar filteredBoxes con todas las cajas
  React.useEffect(() => {
    setFilteredBoxes(unassignedBoxesInBodega);
  }, [unassignedBoxesInBodega]);

  const handleCreateSinglePallet = async (boxCode: string) => {
    try {
      // Establecer el estado de carga para esta caja específica
      setCreatingPalletStates((prev) => ({ ...prev, [boxCode]: true }));

      await createSingleBoxPallet(boxCode, 'BODEGA');

      // Refrescar la lista después de crear el pallet
      // TODO: Implement refresh functionality

      // TODO: Mostrar mensaje de éxito
      console.log('Pallet individual creado exitosamente');
    } catch (error) {
      console.error('Error al crear pallet individual:', error);
      // TODO: Mostrar mensaje de error
    } finally {
      // Remover el estado de carga
      setCreatingPalletStates((prev) => {
        const newStates = { ...prev };
        delete newStates[boxCode];
        return newStates;
      });
    }
  };

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Cajas sin asignar</h1>
        <button onClick={() => console.log('Refrescar - TODO: Implement')}>
          Refrescar
        </button>
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
              onCreateSinglePallet={
                creatingPalletStates[box.codigo]
                  ? undefined
                  : handleCreateSinglePallet
              }
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
