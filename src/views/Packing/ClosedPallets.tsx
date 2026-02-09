import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Pallet, Location } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import PalletCard from '@/components/PalletCard';
import ClosedPalletsFilters, {
  Filters,
} from '@/components/ClosedPalletsFilters';
import SelectDestinationModal from '@/components/SelectDestinationModal';
import { Button, LoadingOverlay } from '@/components/design-system';
import { getEmpresaNombre } from '@/utils/getParamsFromCodigo';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Trash2,
  MoveRight,
} from 'lucide-react';
import { useNotifications } from '@/components/Notification/Notification';
import {
  EmptyStateV2,
  MetricCardV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';
import {
  palletsApi,
  useClosedPalletsInfiniteQuery,
  usePalletServerState,
} from '@/modules/inventory';
import { isDataV2Enabled } from '@/config/dataFlags';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const ClosedPallets = () => {
  const { loading, closePallet, movePallet, deletePallet } =
    usePalletServerState();
  const dataV2Enabled = isDataV2Enabled('packing');

  const { showSuccess, showError } = useNotifications();
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(
    new Set()
  );

  const [legacyPallets, setLegacyPallets] = useState<Pallet[]>([]);
  const [legacyNextKey, setLegacyNextKey] = useState<string | null>(null);
  const [legacyLoadingMore, setLegacyLoadingMore] = useState(false);

  // Store legacyNextKey in a ref to avoid recreating loadLegacyPallets on every fetch
  const legacyNextKeyRef = useRef(legacyNextKey);
  legacyNextKeyRef.current = legacyNextKey;

  // Estados para selección múltiple
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPalletCodes, setSelectedPalletCodes] = useState<Set<string>>(
    new Set()
  );
  const [isMovingSelected, setIsMovingSelected] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  const closedQuery = useClosedPalletsInfiniteQuery('PACKING', filters, {
    enabled: dataV2Enabled,
  });

  // Store closedQuery methods in refs to avoid unstable dependencies
  const closedQueryRefetchRef = useRef(closedQuery.refetch);
  closedQueryRefetchRef.current = closedQuery.refetch;
  const closedQueryFetchNextPageRef = useRef(closedQuery.fetchNextPage);
  closedQueryFetchNextPageRef.current = closedQuery.fetchNextPage;

  const loadLegacyPallets = useCallback(
    async (append = false) => {
      setLegacyLoadingMore(true);
      try {
        const response = await palletsApi.getClosedByLocation('PACKING', {
          ...filters,
          limit: 200,
          lastKey: append ? (legacyNextKeyRef.current ?? undefined) : undefined,
        });

        const items = response.items || [];
        setLegacyPallets((prev) => (append ? [...prev, ...items] : items));
        setLegacyNextKey(response.nextKey || null);
      } catch (error) {
        console.error('Error al cargar pallets:', error);
      } finally {
        setLegacyLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (dataV2Enabled) return;
    void loadLegacyPallets(false);
  }, [dataV2Enabled, loadLegacyPallets]);

  const allPallets = useMemo(() => {
    if (!dataV2Enabled) return legacyPallets;
    return (closedQuery.data?.pages ?? []).flatMap((page) => page.items ?? []);
  }, [closedQuery.data?.pages, dataV2Enabled, legacyPallets]);

  const hasMore = dataV2Enabled
    ? Boolean(closedQuery.hasNextPage)
    : Boolean(legacyNextKey);
  const loadingMore = dataV2Enabled
    ? Boolean(closedQuery.isFetchingNextPage)
    : legacyLoadingMore;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    if (dataV2Enabled) {
      await closedQueryFetchNextPageRef.current();
      return;
    }

    await loadLegacyPallets(true);
  }, [dataV2Enabled, hasMore, loadLegacyPallets, loadingMore]);

  // Función para alternar el estado de colapso de una empresa
  const toggleCompany = useCallback((empresa: string) => {
    setCollapsedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(empresa)) {
        newSet.delete(empresa);
      } else {
        newSet.add(empresa);
      }
      return newSet;
    });
  }, []);

  const refresh = useCallback(async () => {
    setFilters({});
    if (dataV2Enabled) {
      await closedQueryRefetchRef.current();
      return;
    }
    setLegacyNextKey(null);
    await loadLegacyPallets(false);
  }, [dataV2Enabled, loadLegacyPallets]);

  // Agrupar pallets por empresa
  const palletsByCompany = useMemo(() => {
    const groups: Record<string, Pallet[]> = {};

    allPallets.forEach((pallet) => {
      const empresa = getEmpresaNombre(pallet.codigo);
      if (!groups[empresa]) {
        groups[empresa] = [];
      }
      groups[empresa].push(pallet);
    });

    // Ordenar las empresas alfabéticamente
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'es'));
  }, [allPallets]);

  // Handlers para selección múltiple
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedPalletCodes(new Set());
    }
  };

  const handleSelectionChange = (codigo: string, selected: boolean) => {
    setSelectedPalletCodes((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(codigo);
      } else {
        newSet.delete(codigo);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPalletCodes.size === allPallets.length) {
      setSelectedPalletCodes(new Set());
    } else {
      setSelectedPalletCodes(new Set(allPallets.map((p) => p.codigo)));
    }
  };

  const handleMoveSelectedPallets = async (destination: Location) => {
    if (selectedPalletCodes.size === 0) return;

    setShowDestinationModal(false);
    setIsMovingSelected(true);

    let movedCount = 0;
    let errorCount = 0;

    try {
      for (const codigo of selectedPalletCodes) {
        try {
          await movePallet(codigo, destination);
          movedCount++;
        } catch (error) {
          console.error(`Error al mover pallet ${codigo}:`, error);
          errorCount++;
        }
      }

      if (movedCount > 0) {
        showSuccess(
          `Se movieron exitosamente ${movedCount} pallet(s) a ${destination}`
        );
      }
      if (errorCount > 0) {
        showError(`No se pudieron mover ${errorCount} pallet(s)`);
      }

      setSelectedPalletCodes(new Set());
      setIsSelectionMode(false);
      await refresh();
    } catch (error) {
      showError(
        getErrorMessage(error, 'Error al mover los pallets seleccionados')
      );
    } finally {
      setIsMovingSelected(false);
    }
  };

  const handleDeleteSelectedPallets = async () => {
    if (selectedPalletCodes.size === 0) return;

    const confirmed = window.confirm(
      `¿Estás seguro que deseas eliminar los ${selectedPalletCodes.size} pallets seleccionados?\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsDeletingSelected(true);
    let deletedCount = 0;
    let errorCount = 0;

    try {
      for (const codigo of selectedPalletCodes) {
        try {
          await deletePallet(codigo);
          deletedCount++;
        } catch (error) {
          console.error(`Error al eliminar pallet ${codigo}:`, error);
          errorCount++;
        }
      }

      if (deletedCount > 0) {
        showSuccess(`Se eliminaron exitosamente ${deletedCount} pallet(s)`);
      }
      if (errorCount > 0) {
        showError(`No se pudieron eliminar ${errorCount} pallet(s)`);
      }

      setSelectedPalletCodes(new Set());
      setIsSelectionMode(false);
      await refresh();
    } catch (error) {
      showError(
        getErrorMessage(error, 'Error al eliminar los pallets seleccionados')
      );
    } finally {
      setIsDeletingSelected(false);
    }
  };

  return (
    <div className="v2-page animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando pallets…" />
      <PageHeaderV2
        title="Pallets Cerrados"
        description="Lista de pallets que han sido cerrados en Packing."
        actions={
          <>
            <Button
              leftIcon={
                isSelectionMode ? (
                  <Square style={{ width: '16px', height: '16px' }} />
                ) : (
                  <CheckSquare style={{ width: '16px', height: '16px' }} />
                )
              }
              variant={isSelectionMode ? 'primary' : 'secondary'}
              size="medium"
              onClick={handleToggleSelectionMode}
              disabled={allPallets.length === 0}
            >
              {isSelectionMode ? 'Cancelar Selección' : 'Seleccionar'}
            </Button>

            {isSelectionMode && (
              <>
                <Button
                  leftIcon={
                    <CheckSquare style={{ width: '16px', height: '16px' }} />
                  }
                  variant="secondary"
                  size="medium"
                  onClick={handleSelectAll}
                  disabled={allPallets.length === 0}
                >
                  {selectedPalletCodes.size === allPallets.length
                    ? 'Deseleccionar Todos'
                    : 'Seleccionar Todos'}
                </Button>
                <Button
                  leftIcon={
                    <MoveRight style={{ width: '16px', height: '16px' }} />
                  }
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowDestinationModal(true)}
                  disabled={isMovingSelected || selectedPalletCodes.size === 0}
                >
                  {isMovingSelected
                    ? 'Moviendo...'
                    : `Mover (${selectedPalletCodes.size})`}
                </Button>
                <Button
                  leftIcon={
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  }
                  variant="danger"
                  size="medium"
                  onClick={handleDeleteSelectedPallets}
                  disabled={
                    isDeletingSelected || selectedPalletCodes.size === 0
                  }
                >
                  {isDeletingSelected
                    ? 'Eliminando...'
                    : `Eliminar (${selectedPalletCodes.size})`}
                </Button>
              </>
            )}

            {!isSelectionMode && (
              <Button
                variant="secondary"
                size="medium"
                onClick={() => void refresh()}
              >
                Refrescar
              </Button>
            )}
          </>
        }
      />

      <SectionCardV2 title="Filtros">
        <ClosedPalletsFilters
          filters={filters}
          onFiltersChange={setFilters}
          disabled={loading || loadingMore}
        />
      </SectionCardV2>

      <div className="v2-grid-stats">
        <MetricCardV2 label="Total pallets" value={allPallets.length} />
        <MetricCardV2
          label="Total cajas"
          value={allPallets.reduce(
            (sum, pallet) => sum + (pallet.cantidadCajas || 0),
            0
          )}
        />
      </div>

      {allPallets.length === 0 && !loadingMore && !loading ? (
        <EmptyStateV2
          title="No hay pallets cerrados"
          description="Ajusta los filtros o refresca la vista para verificar nuevos resultados."
        />
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--5)' }}
        >
          {palletsByCompany.map(([empresa, pallets]) => {
            const isCollapsed = collapsedCompanies.has(empresa);
            return (
              <div key={empresa}>
                <div
                  onClick={() => toggleCompany(empresa)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--2)',
                    marginBottom: isCollapsed ? 0 : 'var(--3)',
                    paddingBottom: 'var(--1)',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'margin-bottom 0.2s ease',
                  }}
                >
                  {isCollapsed ? (
                    <ChevronUp
                      size={20}
                      style={{ color: 'var(--text-muted-foreground)' }}
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      style={{ color: 'var(--text-muted-foreground)' }}
                    />
                  )}
                  <Building2 size={20} style={{ color: 'var(--blue-500)' }} />
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: 'var(--text-foreground)',
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {empresa}
                  </h2>
                  <span
                    className="text-sm"
                    style={{
                      color: 'var(--text-muted-foreground/70)',
                      backgroundColor: 'hsl(var(--muted))',
                      padding: '2px 8px',
                      borderRadius: '0.25rem',
                    }}
                  >
                    {pallets.length}{' '}
                    {pallets.length === 1 ? 'pallet' : 'pallets'}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {pallets.map((pallet: Pallet) => (
                      <PalletCard
                        key={pallet.codigo}
                        pallet={pallet}
                        setSelectedPallet={setSelectedPallet}
                        setIsModalOpen={setIsModalOpen}
                        closePallet={closePallet}
                        fetchActivePallets={() => void refresh()}
                        onDelete={async (codigo) => {
                          try {
                            await deletePallet(codigo);
                            await refresh();
                          } catch (error) {
                            console.error('Error al eliminar pallet:', error);
                          }
                        }}
                        showSelection={isSelectionMode}
                        isSelected={selectedPalletCodes.has(pallet.codigo)}
                        onSelectionChange={handleSelectionChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && allPallets.length > 0 && (
        <div className="mt-5 text-center">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => void loadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más pallets'}
          </Button>
          <p
            className="text-sm"
            style={{
              color: 'var(--text-muted-foreground)',
              marginTop: 'var(--1)',
            }}
          >
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
            await refresh();
          } catch (error) {
            console.error('Error al mover pallet:', error);
          }
        }}
      />

      <SelectDestinationModal
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        onConfirm={handleMoveSelectedPallets}
        currentLocation="PACKING"
        palletCount={selectedPalletCodes.size}
      />
    </div>
  );
};

export default ClosedPallets;
