import { useContext, useEffect, useState } from 'react';
import { Box } from '@/types';
import '@/styles/BoxCard.css';
import { BoxesContext } from '@/contexts/BoxesContext';
import BoxCard from '@/components/BoxCard';
import BoxDetailModal from '@/components/BoxDetailModal';

const UnassignedBoxes = () => {
  const { unassignedBoxesInBodega, fetchUnassignedBoxesInBodega } =
    useContext(BoxesContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  useEffect(() => {
    fetchUnassignedBoxesInBodega();
  }, [fetchUnassignedBoxesInBodega]);

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Cajas sin asignar</h1>
        <button onClick={() => fetchUnassignedBoxesInBodega()}>
          Refrescar
        </button>
        <div className="open-pallets-count">
          {unassignedBoxesInBodega.length} cajas
        </div>
      </div>

      {/* Empty State */}
      {unassignedBoxesInBodega.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay cajas sin asignar</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {unassignedBoxesInBodega.map((box) => (
            <BoxCard
              key={box.codigo}
              box={box}
              setSelectedBox={setSelectedBox}
              setIsModalOpen={setIsModalOpen}
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
