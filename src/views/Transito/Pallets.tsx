import { useEffect, useState } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import {
  closePallet,
  movePallet,
  moveAllPalletsFromTransitToBodega,
} from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import { Card, Button, LoadingOverlay } from '@/components/design-system';
import { useNotifications } from '@/components/Notification/Notification';

const TransitoPallets = () => {
  const { closedPalletsInTransit, fetchClosedPalletsInTransit, loading } =
    usePalletContext();
  const { showSuccess, showError } = useNotifications();

  // Create refresh function
  const refresh = () => {
    fetchClosedPalletsInTransit();
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    refresh();
  }, []);

  // Manejar mover todos los pallets a bodega
  const handleMoveAllToBodega = async () => {
    if (closedPalletsInTransit.length === 0) {
      showError('No hay pallets en tránsito para mover');
      return;
    }

    const confirmMessage = `¿Está seguro de que desea mover todos los ${closedPalletsInTransit.length} pallets en tránsito a bodega?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsMovingAll(true);
    try {
      const result = await moveAllPalletsFromTransitToBodega();

      if (result.success) {
        showSuccess(
          `Se movieron exitosamente ${result.palletsMoved} pallets y ${result.boxesMoved} cajas a bodega`
        );
      } else {
        const errorMsg =
          result.errors && result.errors.length > 0
            ? `${result.message}. Errores: ${result.errors.map((e) => `${e.palletCode}: ${e.error}`).join(', ')}`
            : result.message;
        showError(errorMsg);
      }

      // Refrescar la lista
      await refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al mover pallets a bodega';
      showError(errorMessage);
    } finally {
      setIsMovingAll(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      {/* Header */}
      <div style={{ marginBottom: 'var(--6)' }}>
        <div
          className="flex items-center gap-4"
          style={{
            justifyContent: 'space-between',
            marginBottom: 'var(--2)',
          }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--text-foreground)' }}
          >
            Pallets en Tránsito
          </h1>
          <div style={{ display: 'flex', gap: 'var(--2)' }}>
            {closedPalletsInTransit.length > 0 && (
              <Button
                variant="primary"
                size="medium"
                onClick={handleMoveAllToBodega}
                disabled={isMovingAll}
              >
                {isMovingAll ? 'Moviendo...' : 'Mover Todos a Bodega'}
              </Button>
            )}
            <Button variant="secondary" size="medium" onClick={refresh}>
              Refrescar
            </Button>
          </div>
        </div>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted-foreground)' }}
        >
          Pallets cerrados actualmente en tránsito
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--4)',
          marginBottom: 'var(--6)',
        }}
      >
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
              }}
            >
              Total Pallets
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ color: 'var(--blue-500)', fontWeight: 700 }}
            >
              {closedPalletsInTransit.length}
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
              }}
            >
              Total Cajas
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ color: 'var(--green-500)', fontWeight: 700 }}
            >
              {closedPalletsInTransit.reduce(
                (sum, pallet) => sum + (pallet.cantidadCajas || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Content */}
      {closedPalletsInTransit.length === 0 ? (
        <Card>
          <p
            className="text-base"
            style={{
              textAlign: 'center',
              padding: 'var(--8)',
              color: 'var(--text-muted-foreground)',
            }}
          >
            No hay pallets en tránsito
          </p>
        </Card>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {closedPalletsInTransit.map((pallet: Pallet) => (
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

export default TransitoPallets;
