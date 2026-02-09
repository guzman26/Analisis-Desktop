import { useCallback, useState } from 'react';
import { usePalletServerState } from '@/modules/inventory';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import PalletCard from '@/components/PalletCard';
import { Button, LoadingOverlay } from '@/components/design-system';
import { useNotifications } from '@/components/Notification/Notification';
import { EmptyStateV2, MetricCardV2, PageHeaderV2 } from '@/components/app-v2';

const TransitoPallets = () => {
  const {
    closedPalletsInTransit,
    fetchClosedPalletsInTransit,
    closePallet,
    movePallet,
    moveAllPalletsFromTransitToBodega,
    loading,
  } = usePalletServerState();
  const { showSuccess, showError } = useNotifications();

  // Create refresh function
  const refresh = useCallback(() => {
    void fetchClosedPalletsInTransit();
  }, [fetchClosedPalletsInTransit]);
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);

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
            ? `${result.message}. Errores: ${result.errors
                .map(
                  (errorItem: { palletCode?: string; error?: string }) =>
                    `${errorItem.palletCode}: ${errorItem.error}`
                )
                .join(', ')}`
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
    <div className="v2-page animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      <PageHeaderV2
        title="Pallets en Tránsito"
        description="Pallets cerrados actualmente en tránsito."
        actions={
          <>
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
          </>
        }
      />

      {/* Stats */}
      <div className="v2-grid-stats">
        <MetricCardV2
          label="Total pallets"
          value={closedPalletsInTransit.length}
        />
        <MetricCardV2
          label="Total cajas"
          value={closedPalletsInTransit.reduce(
            (sum, pallet) => sum + (pallet.cantidadCajas || 0),
            0
          )}
        />
      </div>

      {/* Content */}
      {closedPalletsInTransit.length === 0 ? (
        <EmptyStateV2
          title="No hay pallets en tránsito"
          description="Cuando se despachen pallets aparecerán en esta vista."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
