import { useEffect, useState } from 'react';
import { useFilteredPallets, usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import '@/styles/OpenPallets.css';
import { closePallet, movePallet } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';

const OpenPallets = () => {
  const [, palletAPI] = usePalletContext();
  const {
    pallets: activePalletsPaginated,

    loading,
    error,
  } = useFilteredPallets();

  // Create refresh function
  const refresh = () => {
    palletAPI.fetchPallets(1, 'active');
  };
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
          <p>Error: {error?.message || 'Ha ocurrido un error'}</p>
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

      {/* Load More Button - Removed for now as filtered pallets doesn't support pagination */}

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

export default OpenPallets;
