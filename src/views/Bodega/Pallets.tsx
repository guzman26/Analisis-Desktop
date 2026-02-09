import { useEffect, useState, useMemo } from 'react';
import { usePalletServerState } from '@/modules/inventory';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import ScanBoxToFindPalletModal from '@/components/ScanBoxToFindPalletModal';
import PalletCard from '@/components/PalletCard';
import { Button, LoadingOverlay } from '@/components/design-system';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { ScanLine } from 'lucide-react';
import {
  EmptyStateV2,
  MetricCardV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';

const BodegaPallets = () => {
  const {
    closedPalletsInBodega,
    fetchClosedPalletsInBodega,
    closePallet,
    movePallet,
    loading,
  } = usePalletServerState();

  // Create refresh function
  const refresh = () => {
    void fetchClosedPalletsInBodega();
  };
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Agrupar pallets por calibre
  const palletsByCalibre = useMemo(() => {
    const grouped: Record<string, Pallet[]> = {};

    closedPalletsInBodega.forEach((pallet) => {
      const calibre = getCalibreFromCodigo(pallet.codigo) || 'Sin Calibre';
      if (!grouped[calibre]) {
        grouped[calibre] = [];
      }
      grouped[calibre].push(pallet);
    });

    // Ordenar calibres alfabéticamente
    const sortedCalibres = Object.keys(grouped).sort((a, b) => {
      if (a === 'Sin Calibre') return 1;
      if (b === 'Sin Calibre') return -1;
      return a.localeCompare(b);
    });

    return sortedCalibres.map((calibre) => ({
      calibre,
      pallets: grouped[calibre],
    }));
  }, [closedPalletsInBodega]);

  // Cargar datos al montar el componente
  useEffect(() => {
    refresh();
  }, []); // Dependencias vacías para que solo se ejecute una vez al montar

  return (
    <div className="v2-page animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      <PageHeaderV2
        title="Pallets en Bodega"
        description="Pallets cerrados actualmente almacenados en Bodega."
        actions={
          <>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setIsScanModalOpen(true)}
              leftIcon={<ScanLine size={16} />}
            >
              Buscar por Caja
            </Button>
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
          value={closedPalletsInBodega.length}
        />
        <MetricCardV2
          label="Total cajas"
          value={closedPalletsInBodega.reduce(
            (sum, pallet) => sum + (pallet.cantidadCajas || 0),
            0
          )}
        />
      </div>

      {/* Content */}
      {closedPalletsInBodega.length === 0 ? (
        <EmptyStateV2
          title="No hay pallets en bodega"
          description="Cuando se cierren pallets y se muevan a Bodega aparecerán aquí."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {palletsByCalibre.map(({ calibre, pallets }) => (
            <SectionCardV2 key={calibre}>
              {/* Header del grupo de calibre */}
              <div
                style={{
                  marginBottom: 'var(--3)',
                  paddingBottom: 'var(--1)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div
                  className="flex items-center gap-4"
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: 'var(--text-foreground)',
                      fontWeight: 600,
                    }}
                  >
                    Calibre {calibre}
                  </h2>
                  <span
                    className="text-base"
                    style={{
                      color: 'var(--text-muted-foreground)',
                      backgroundColor: 'rgba(200, 200, 200, 0.1)',
                      padding: 'var(--0.5) var(--2)',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {pallets.length} pallet{pallets.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Grid de pallets para este calibre */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pallets.map((pallet: Pallet) => (
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
            </SectionCardV2>
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

      <ScanBoxToFindPalletModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};

export default BodegaPallets;
