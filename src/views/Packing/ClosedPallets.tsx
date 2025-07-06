import { useEffect, useState } from 'react';
import { usePalletContext, useFilteredPallets } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import { closePallet, movePallet } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';

const ClosedPallets = () => {
  const [, palletAPI] = usePalletContext();
  const { pallets: closedPalletsInPackingPaginated } = useFilteredPallets();

  // Create refresh function
  const refresh = () => {
    palletAPI.fetchPallets(1, 'completed');
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets Cerrados</h1>
        <button onClick={() => refresh()}>Refrescar</button>
        <div className="open-pallets-count">
          {closedPalletsInPackingPaginated.length} pallets
        </div>
      </div>

      {/* Empty State */}
      {closedPalletsInPackingPaginated.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets cerrados</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {closedPalletsInPackingPaginated.map((pallet: any) => (
            <PalletCard
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={closePallet}
              fetchActivePallets={refresh}
            />
          ))}
        </div>
      )}

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
        }}
        onAddBox={(codigo) => {
          console.log('Añadir caja a:', codigo);
        }}
        onMovePallet={async (codigo, location) => {
          try {
            await movePallet(
              codigo,
              location as 'TRANSITO' | 'BODEGA' | 'VENTA'
            );
            // Cerrar el modal después del movimiento exitoso
            setIsModalOpen(false);
            setSelectedPallet(null);
            // Refrescar la lista de pallets
            refresh();
            // TODO: Mostrar mensaje de éxito
            console.log(`Pallet ${codigo} movido exitosamente a ${location}`);
          } catch (error) {
            console.error('Error al mover pallet:', error);
            // TODO: Mostrar mensaje de error
          }
        }}
      />
    </div>
  );
};

export default ClosedPallets;
