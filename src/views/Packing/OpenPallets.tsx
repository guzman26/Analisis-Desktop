import { useContext, useEffect, useState } from 'react';
import { PalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/post';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const {
    activePalletsPaginated: {
      data: activePalletsPaginated,
      loading,
      error,
      hasMore,
      loadMore,
      refresh,
    },
  } = useContext(PalletContext);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const handleRefresh = () => {
    refresh();
  };

  const handleCloseAction = async (codigo: string) => {
    await closePallet(codigo);
    refresh(); // Refresh paginated data instead of fetchActivePallets
  };

  return (
    <div className="open-pallets">
      <div className="open-pallets-header">
        <h1 className="open-pallets-title">Pallets Abiertos</h1>
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Cargando...' : 'Refrescar'}
        </button>
        <div className="open-pallets-count">
          {activePalletsPaginated.length} pallets
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="open-pallets-error">
          <p>Error: {error}</p>
          <button onClick={handleRefresh}>Reintentar</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && activePalletsPaginated.length === 0 ? (
        <div className="open-pallets-empty">
          <p>No hay pallets abiertos</p>
        </div>
      ) : (
        /* Pallets Grid */
        <div className="open-pallets-grid">
          {activePalletsPaginated.map((pallet) => (
            <PalletCard
              key={pallet.codigo}
              pallet={pallet}
              setSelectedPallet={setSelectedPallet}
              setIsModalOpen={setIsModalOpen}
              closePallet={handleCloseAction}
              fetchActivePallets={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="open-pallets-load-more">
          <button onClick={loadMore} className="load-more-button">
            Cargar más pallets
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="open-pallets-loading">
          <p>Cargando pallets...</p>
        </div>
      )}

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
        }}
        onClosePallet={handleCloseAction}
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
