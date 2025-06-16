import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/post';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const { palletsInBodega, fetchPalletsInBodega } = useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPalletsInBodega();
  }, [fetchPalletsInBodega]);

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets en Bodega</h1>
        <button onClick={() => fetchPalletsInBodega()}>Refrescar</button>
        <div className="open-pallets-count">
          {palletsInBodega.length} pallets
        </div>
      </div>

      {/* Empty State */}
      {palletsInBodega.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets abiertos</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {palletsInBodega.map((pallet) => (
            <PalletCard
              key={pallet.codigo}
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={closePallet}
              fetchActivePallets={fetchPalletsInBodega}
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
          fetchPalletsInBodega();
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
