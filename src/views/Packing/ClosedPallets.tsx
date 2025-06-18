import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/post';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const { closedPalletsInPackingPaginated } =
    useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    closedPalletsInPackingPaginated.refresh();
  }, []);

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
          <h1 className="open-pallets-title">Pallets Cerrados</h1>
        <button onClick={() => closedPalletsInPackingPaginated.refresh()}>Refrescar</button>
        <div className="open-pallets-count">
          {closedPalletsInPackingPaginated.data.length} pallets
        </div>
      </div>

      {/* Empty State */}
      {closedPalletsInPackingPaginated.data.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets cerrados</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {closedPalletsInPackingPaginated.data.map((pallet) => (
            <PalletCard
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={closePallet}
              fetchActivePallets={closedPalletsInPackingPaginated.refresh}
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
        onMovePallet={(codigo, location) => {
          movePallet(codigo, location as 'TRANSITO' | 'BODEGA' | 'VENTA');
        }}
      />
    </div>
  );
};

export default OpenPallets;
