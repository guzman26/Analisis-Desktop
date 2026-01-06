import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePalletContext } from '@/contexts/PalletContext';
import { Pallet, Location } from '@/types';
import PalletDetailModal from '@/components/PalletDetailModal';
import {
  closePallet,
  movePallet,
  deletePallet,
  getClosedPallets,
} from '@/api/endpoints';
import PalletCard from '@/components/PalletCard';
import ClosedPalletsFilters, {
  Filters,
} from '@/components/ClosedPalletsFilters';
import SelectDestinationModal from '@/components/SelectDestinationModal';
import { Card, Button, LoadingOverlay } from '@/components/design-system';
import { getEmpresaNombre } from '@/utils/getParamsFromCodigo';
import { Building2, ChevronDown, ChevronUp, CheckSquare, Square, Trash2, MoveRight } from 'lucide-react';
import { useNotifications } from '@/components/Notification/Notification';
import '../../styles/designSystem.css';

const ClosedPallets = () => {
  const { loading } = usePalletContext();
  const { showSuccess, showError } = useNotifications();
  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allPallets, setAllPallets] = useState<Pallet[]>([]);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(
    new Set()
  );
  
  // Estados para selección múltiple
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPalletCodes, setSelectedPalletCodes] = useState<Set<string>>(new Set());
  const [isMovingSelected, setIsMovingSelected] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

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

  // Función para cargar pallets con filtros
  const loadPallets = useCallback(
    async (resetPagination = false, currentNextKey?: string | null) => {
      setLoadingMore(true);

      try {
        const params = {
          ubicacion: 'PACKING' as const,
          limit: 200, // Aumentado de 50 a 200 para cargar más pallets por tanda
          lastKey: resetPagination ? undefined : currentNextKey || undefined,
          ...filters,
        };

        const response = await getClosedPallets(params);
        const pallets = response.items || [];

        if (resetPagination) {
          setAllPallets(pallets);
        } else {
          setAllPallets((prev) => [...prev, ...pallets]);
        }

        setNextKey(response.nextKey || null);
        setHasMore(!!response.nextKey);
      } catch (error) {
        console.error('Error al cargar pallets:', error);
      } finally {
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Cargar pallets iniciales
  useEffect(() => {
    loadPallets(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambian los filtros, resetear paginado y recargar
  useEffect(() => {
    setNextKey(null);
    setAllPallets([]);
    setHasMore(true);
    loadPallets(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Función para cargar más pallets (con filtros activos)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await loadPallets(false, nextKey);
  }, [hasMore, loadingMore, loadPallets, nextKey]);

  // Create refresh function
  const refresh = useCallback(() => {
    setFilters({});
    setNextKey(null);
    setAllPallets([]);
    setHasMore(true);
    loadPallets(true);
  }, [loadPallets]);

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
    const sortedEntries = Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b, 'es')
    );

    return sortedEntries;
  }, [allPallets]);

  // Handlers para selección múltiple
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // Limpiar selección al salir del modo
      setSelectedPalletCodes(new Set());
    }
  };

  const handleSelectionChange = (codigo: string, selected: boolean) => {
    setSelectedPalletCodes(prev => {
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
      // Deseleccionar todos
      setSelectedPalletCodes(new Set());
    } else {
      // Seleccionar todos
      setSelectedPalletCodes(new Set(allPallets.map(p => p.codigo)));
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
        showSuccess(`Se movieron exitosamente ${movedCount} pallet(s) a ${destination}`);
      }
      if (errorCount > 0) {
        showError(`No se pudieron mover ${errorCount} pallet(s)`);
      }

      // Limpiar selección y refrescar
      setSelectedPalletCodes(new Set());
      setIsSelectionMode(false);
      refresh();
    } catch (error: any) {
      showError(error.message || 'Error al mover los pallets seleccionados');
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

      // Limpiar selección y refrescar
      setSelectedPalletCodes(new Set());
      setIsSelectionMode(false);
      refresh();
    } catch (error: any) {
      showError(error.message || 'Error al eliminar los pallets seleccionados');
    } finally {
      setIsDeletingSelected(false);
    }
  };

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
          <div className="macos-hstack">
            {/* Botones de selección múltiple */}
            <Button
              leftIcon={isSelectionMode ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
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
                  leftIcon={<CheckSquare style={{ width: '16px', height: '16px' }} />}
                  variant="secondary"
                  size="medium"
                  onClick={handleSelectAll}
                  disabled={allPallets.length === 0}
                >
                  {selectedPalletCodes.size === allPallets.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </Button>
                <Button
                  leftIcon={<MoveRight style={{ width: '16px', height: '16px' }} />}
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowDestinationModal(true)}
                  disabled={isMovingSelected || selectedPalletCodes.size === 0}
                >
                  {isMovingSelected ? 'Moviendo...' : `Mover (${selectedPalletCodes.size})`}
                </Button>
                <Button
                  leftIcon={<Trash2 style={{ width: '16px', height: '16px' }} />}
                  variant="danger"
                  size="medium"
                  onClick={handleDeleteSelectedPallets}
                  disabled={isDeletingSelected || selectedPalletCodes.size === 0}
                >
                  {isDeletingSelected ? 'Eliminando...' : `Eliminar (${selectedPalletCodes.size})`}
                </Button>
              </>
            )}

            {!isSelectionMode && (
              <Button variant="secondary" size="medium" onClick={refresh}>
                Refrescar
              </Button>
            )}
          </div>
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
        filters={filters}
        onFiltersChange={setFilters}
        disabled={loading || loadingMore}
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
              {allPallets.length}
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
              {allPallets.reduce(
                (sum, pallet) => sum + (pallet.cantidadCajas || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Pallets agrupados por empresa */}
      {allPallets.length === 0 && !loadingMore && !loading ? (
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--macos-space-6)',
          }}
        >
          {palletsByCompany.map(([empresa, pallets]) => {
            const isCollapsed = collapsedCompanies.has(empresa);
            return (
              <div key={empresa}>
                {/* Encabezado del grupo - clickeable para colapsar */}
                <div
                  onClick={() => toggleCompany(empresa)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--macos-space-3)',
                    marginBottom: isCollapsed ? 0 : 'var(--macos-space-4)',
                    paddingBottom: 'var(--macos-space-2)',
                    borderBottom: '1px solid var(--macos-separator)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'margin-bottom 0.2s ease',
                  }}
                >
                  {isCollapsed ? (
                    <ChevronUp
                      size={20}
                      style={{ color: 'var(--macos-text-secondary)' }}
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      style={{ color: 'var(--macos-text-secondary)' }}
                    />
                  )}
                  <Building2 size={20} style={{ color: 'var(--macos-blue)' }} />
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
                    {pallets.length}{' '}
                    {pallets.length === 1 ? 'pallet' : 'pallets'}
                  </span>
                </div>

                {/* Grid de pallets de esta empresa - solo visible si no está colapsado */}
                {!isCollapsed && (
                  <div
                    className="macos-grid"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(320px, 1fr))',
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
          <p
            className="macos-text-footnote"
            style={{
              color: 'var(--macos-text-secondary)',
              marginTop: 'var(--macos-space-2)',
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
            refresh();
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
