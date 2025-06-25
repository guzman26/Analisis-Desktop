import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/post';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const { closedPalletsInBodegaPaginated } = useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    closedPalletsInBodegaPaginated.refresh();
  }, []); // Dependencias vacías para que solo se ejecute una vez al montar

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets en Bodega</h1>
        <button onClick={() => closedPalletsInBodegaPaginated.refresh()}>
          Refrescar
        </button>
        <div className="open-pallets-count">
          {closedPalletsInBodegaPaginated.data.length} pallets
        </div>
      </div>

      {/* Empty State */}
      {closedPalletsInBodegaPaginated.data.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets en bodega</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {closedPalletsInBodegaPaginated.data.map((pallet) => (
            <PalletCard
              key={pallet.codigo}
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={closePallet}
              fetchActivePallets={closedPalletsInBodegaPaginated.refresh}
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
          closedPalletsInBodegaPaginated.refresh();
        }}
        onAddBox={(codigo) => {
          console.log('Añadir caja a:', codigo);
        }}
        onMovePallet={(codigo, location) => {
          movePallet(codigo, location as 'TRANSITO' | 'BODEGA' | 'VENTA');
        }}
      />
    </div>
  );
};

export default OpenPallets;
