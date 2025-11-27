import { useEffect, useState, useMemo } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import { closePallet, movePallet, deletePallet, getClosedPallets } from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import ClosedPalletsFilters from '@/components/ClosedPalletsFilters';
import { Card, Button, LoadingOverlay } from '@/components/design-system';
import { getEmpresaNombre } from '@/utils/getParamsFromCodigo';
import { Building2 } from 'lucide-react';
import '../../styles/designSystem.css';

const ClosedPallets = () => {
  const { closedPalletsInPacking, fetchClosedPalletsInPacking, loading } =
    usePalletContext();
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtered, setFiltered] = useState<Pallet[]>([]);
  const [allPallets, setAllPallets] = useState<Pallet[]>([]);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Create refresh function
  const refresh = () => {
    setAllPallets([]);
    setNextKey(null);
    setHasMore(true);
    fetchClosedPalletsInPacking();
  };

  useEffect(() => {
    const loadInitialPallets = async () => {
      try {
        const response = await getClosedPallets({
          ubicacion: 'PACKING',
          limit: 50,
        });
        
        const pallets = response.items || [];
        setAllPallets(pallets);
        setFiltered(pallets);
        setNextKey(response.nextKey || null);
        setHasMore(!!response.nextKey);
      } catch (error) {
        console.error('Error al cargar pallets:', error);
      }
    };
    
    loadInitialPallets();
  }, []);

  // Mantener sincronizado con el contexto cuando se refresca
  useEffect(() => {
    if (closedPalletsInPacking.length > 0 && allPallets.length === 0) {
      setAllPallets(closedPalletsInPacking);
      setFiltered(closedPalletsInPacking);
    }
  }, [closedPalletsInPacking, allPallets.length]);

  // Función para cargar más pallets
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const response = await getClosedPallets({
        ubicacion: 'PACKING',
        limit: 50,
        lastKey: nextKey || undefined,
      });
      
      const newPallets = response.items || [];
      const updatedPallets = [...allPallets, ...newPallets];
      
      setAllPallets(updatedPallets);
      setFiltered(updatedPallets);
      setNextKey(response.nextKey || null);
      setHasMore(!!response.nextKey);
    } catch (error) {
      console.error('Error al cargar más pallets:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Agrupar pallets por empresa
  const palletsByCompany = useMemo(() => {
    const groups: Record<string, Pallet[]> = {};
    
    filtered.forEach((pallet) => {
      const empresa = getEmpresaNombre(pallet.codigo);
      if (!groups[empresa]) {
        groups[empresa] = [];
      }
      groups[empresa].push(pallet);
    });

    // Ordenar las empresas alfabéticamente
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => 
      a.localeCompare(b, 'es')
    );

    return sortedEntries;
  }, [filtered]);

  return (
    <div className="macos-animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
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
            Pallets Cerrados
          </h1>
          <Button variant="secondary" size="medium" onClick={refresh}>
            Refrescar
          </Button>
        </div>
        <p
          className="macos-text-body"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          Lista de pallets que han sido cerrados en Packing
        </p>
      </div>

      {/* Filtros */}
      <ClosedPalletsFilters
        pallets={closedPalletsInPacking}
        onLocalFiltersChange={setFiltered}
        onServerFiltersChange={(f) =>
          fetchClosedPalletsInPacking({
            fechaDesde: f.fechaDesde,
            fechaHasta: f.fechaHasta,
          })
        }
        disabled={loading}
      />

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
              style={{
                color: 'var(--macos-blue)',
                fontWeight: 700,
              }}
            >
              {filtered.length}
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Total Cajas
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-green)',
                fontWeight: 700,
              }}
            >
              {filtered.reduce(
                (sum, pallet) => sum + (pallet.cantidadCajas || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Pallets agrupados por empresa */}
      {closedPalletsInPacking.length === 0 ? (
        <Card>
          <p
            className="macos-text-body"
            style={{
              textAlign: 'center',
              padding: 'var(--macos-space-8)',
              color: 'var(--macos-text-secondary)',
            }}
          >
            No hay pallets cerrados
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--macos-space-6)' }}>
          {palletsByCompany.map(([empresa, pallets]) => (
            <div key={empresa}>
              {/* Encabezado del grupo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--macos-space-3)',
                  marginBottom: 'var(--macos-space-4)',
                  paddingBottom: 'var(--macos-space-2)',
                  borderBottom: '1px solid var(--macos-separator)',
                }}
              >
                <Building2
                  size={20}
                  style={{ color: 'var(--macos-blue)' }}
                />
                <h2
                  className="macos-text-title-2"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {empresa}
                </h2>
                <span
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-tertiary)',
                    backgroundColor: 'var(--macos-fill-secondary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--macos-radius-sm)',
                  }}
                >
                  {pallets.length} {pallets.length === 1 ? 'pallet' : 'pallets'}
                </span>
              </div>
              
              {/* Grid de pallets de esta empresa */}
              <div
                className="macos-grid"
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
                    onDelete={async (codigo) => {
                      try {
                        await deletePallet(codigo);
                        refresh();
                      } catch (error) {
                        console.error('Error al eliminar pallet:', error);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón Cargar Más */}
      {hasMore && allPallets.length > 0 && (
        <div style={{ marginTop: 'var(--macos-space-6)', textAlign: 'center' }}>
          <Button
            variant="secondary"
            size="medium"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más pallets'}
          </Button>
          <p className="macos-text-footnote" style={{ color: 'var(--macos-text-secondary)', marginTop: 'var(--macos-space-2)' }}>
            Mostrando {allPallets.length} pallets
          </p>
        </div>
      )}

      <PalletDetailModal
        pallet={selectedPallet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPallet(null);
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

export default ClosedPallets;
