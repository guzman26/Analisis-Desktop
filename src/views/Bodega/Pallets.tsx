import { useEffect, useState, useMemo } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import ScanBoxToFindPalletModal from '@/components/ScanBoxToFindPalletModal';
import { closePallet, movePallet } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import { Card, Button, LoadingOverlay } from '@/components/design-system';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { ScanLine } from 'lucide-react';

const BodegaPallets = () => {
  const { closedPalletsInBodega, fetchClosedPalletsInBodega, loading } =
    usePalletContext();

  // Create refresh function
  const refresh = () => {
    fetchClosedPalletsInBodega();
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
            Pallets en Bodega
          </h1>
          <div style={{ display: 'flex', gap: 'var(--1)' }}>
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
          </div>
        </div>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted-foreground)' }}
        >
          Pallets cerrados actualmente almacenados en Bodega
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
              {closedPalletsInBodega.length}
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
              {closedPalletsInBodega.reduce(
                (sum, pallet) => sum + (pallet.cantidadCajas || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Content */}
      {closedPalletsInBodega.length === 0 ? (
        <Card>
          <p
            className="text-base"
            style={{
              textAlign: 'center',
              padding: 'var(--8)',
              color: 'var(--text-muted-foreground)',
            }}
          >
            No hay pallets en bodega
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--6)',
          }}
        >
          {palletsByCalibre.map(({ calibre, pallets }) => (
            <div key={calibre}>
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
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                }}
              >
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
            </div>
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
