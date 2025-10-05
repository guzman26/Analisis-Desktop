import { useEffect, useState } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import { closePallet, movePallet } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import { Card, Button } from '@/components/design-system';
import '../../styles/designSystem.css';

const BodegaPallets = () => {
  const { closedPalletsInBodega, fetchClosedPalletsInBodega } =
    usePalletContext();

  // Create refresh function
  const refresh = () => {
    fetchClosedPalletsInBodega();
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    refresh();
  }, []); // Dependencias vacías para que solo se ejecute una vez al montar

  return (
    <div className="macos-animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--macos-space-7)' }}>
        <div
          className="macos-hstack"
          style={{
            justifyContent: 'space-between',
            marginBottom: 'var(--macos-space-3)',
          }}
        >
          <h1
            className="macos-text-large-title"
            style={{ color: 'var(--macos-text-primary)' }}
          >
            Pallets en Bodega
          </h1>
          <Button variant="secondary" size="medium" onClick={refresh}>
            Refrescar
          </Button>
        </div>
        <p
          className="macos-text-body"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          Pallets cerrados actualmente almacenados en Bodega
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--macos-space-5)',
          marginBottom: 'var(--macos-space-7)',
        }}
      >
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Total Pallets
            </p>
            <p
              className="macos-text-title-1"
              style={{ color: 'var(--macos-blue)', fontWeight: 700 }}
            >
              {closedPalletsInBodega.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Content */}
      {closedPalletsInBodega.length === 0 ? (
        <Card>
          <p
            className="macos-text-body"
            style={{
              textAlign: 'center',
              padding: 'var(--macos-space-8)',
              color: 'var(--macos-text-secondary)',
            }}
          >
            No hay pallets en bodega
          </p>
        </Card>
      ) : (
        <div
          className="macos-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {closedPalletsInBodega.map((pallet: Pallet) => (
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
        onClosePallet={async (codigo) => {
          try {
            await closePallet(codigo);
            setIsModalOpen(false);
            refresh();
          } catch (error) {
            console.error('Error al cerrar pallet:', error);
          }
        }}
        onMovePallet={async (codigo, location) => {
          try {
            await movePallet(
              codigo,
              location as 'TRANSITO' | 'BODEGA' | 'VENTA'
            );
            setIsModalOpen(false);
            setSelectedPallet(null);
            refresh();
          } catch (error) {
            console.error('Error al mover pallet:', error);
          }
        }}
      />
    </div>
  );
};

export default BodegaPallets;
