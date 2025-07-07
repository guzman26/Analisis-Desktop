import { useState } from 'react';
import { Box } from '@/types';
import { useUnassignedBoxes } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';
import {
  createSingleBoxPallet,
  assignBoxToCompatiblePallet,
} from '@/api/endpoints';
import { RefreshCcw, Package } from 'lucide-react';
import styles from './UnassignedBoxes.module.css';

const UnassignedBoxes = () => {
  const { unassignedBoxes: unassignedBoxesInPacking } =
    useUnassignedBoxes('PACKING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [creatingPalletStates, setCreatingPalletStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [assigningToCompatibleStates, setAssigningToCompatibleStates] =
    useState<{
      [key: string]: boolean;
    }>({});

  // Data is automatically fetched by useUnassignedBoxes hook

  const handleCreateSinglePallet = async (boxCode: string) => {
    try {
      // Establecer el estado de carga para esta caja específica
      setCreatingPalletStates((prev) => ({ ...prev, [boxCode]: true }));

      await createSingleBoxPallet(boxCode, 'PACKING');

      // Refrescar la lista después de crear el pallet
      // TODO: Implement refresh functionality

      console.log('Pallet individual creado exitosamente');
    } catch (error) {
      console.error('Error al crear pallet individual:', error);
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

      await assignBoxToCompatiblePallet(boxCode);

      // Refrescar la lista después de asignar a pallet compatible
      // TODO: Implement refresh functionality

      console.log('Caja asignada a pallet compatible exitosamente');
    } catch (error) {
      console.error('Error al asignar caja a pallet compatible:', error);
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
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 className={styles.title}>Cajas sin asignar</h1>
          <span className={styles.count}>{unassignedBoxesInPacking.length} cajas</span>
        </div>
        <button 
          className={styles.refreshButton}
          onClick={() => console.log('Refrescar - TODO: Implement')}
        >
          <RefreshCcw size={16} />
          Refrescar
        </button>
      </div>

      {/* Empty State */}
      {unassignedBoxesInPacking.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>No hay cajas sin asignar</p>
        </div>
      ) : (
        /* Boxes Grid */
        <div className={styles.grid}>
          {unassignedBoxesInPacking.map((box: any) => (
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
