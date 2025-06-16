import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/post';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const { activePallets, fetchActivePallets } = useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchActivePallets();
  }, [fetchActivePallets]);

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets Abiertos</h1>
        <button onClick={() => fetchActivePallets()}>Refrescar</button>
        <div className="open-pallets-count">{activePallets.length} pallets</div>
      </div>

      {/* Empty State */}
      {activePallets.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets abiertos</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {activePallets.map((pallet) => (
            <PalletCard
              key={pallet.codigo}
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={closePallet}
              fetchActivePallets={fetchActivePallets}
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
          fetchActivePallets();
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
