import { useEffect, useState } from 'react';
import { useFilteredPallets, usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';

const BodegaPallets = () => {
  const [, palletAPI] = usePalletContext();
  const { pallets: closedPalletsInBodegaPaginated } = useFilteredPallets();

  // Create refresh function
  const refresh = () => {
    palletAPI.fetchPallets(1, 'completed');
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    refresh();
  }, []); // Dependencias vacías para que solo se ejecute una vez al montar

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets en Bodega</h1>
        <button onClick={() => refresh()}>Refrescar</button>
        <div className="open-pallets-count">
          {closedPalletsInBodegaPaginated.length} pallets
        </div>
      </div>

      {/* Empty State */}
      {closedPalletsInBodegaPaginated.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets en bodega</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {closedPalletsInBodegaPaginated.map((pallet: any) => (
            <PalletCard
              key={pallet.codigo}
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
        onClosePallet={(codigo) => {
          closePallet(codigo);
          setIsModalOpen(false);
          refresh();
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

export default BodegaPallets;
