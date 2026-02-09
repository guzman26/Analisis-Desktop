import { useEffect, useState, useMemo, useCallback } from 'react';
import { Cart } from '@/types';
import CartCard from '@/components/CartCard';
import CartDetailModal from '@/components/CartDetailModal';
import { cartsApi } from '@/modules/carts';
import CartsFilters, { Filters } from '@/components/CartsFilters';
import { Button, LoadingOverlay } from '@/components/design-system';
import {
  getEmpresaNombre,
  getCalibreFromCodigo,
} from '@/utils/getParamsFromCodigo';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  EmptyStateV2,
  MetricCardV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';

const Carts = () => {
  const [allCarts, setAllCarts] = useState<Cart[]>([]);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(
    new Set()
  );
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Función para cargar carros con filtros
  const loadCarts = useCallback(
    async (resetPagination = false, currentNextKey?: string | null) => {
      setLoadingMore(true);
      setLoading(resetPagination);

      try {
        const params = {
          ubicacion: 'PACKING' as const,
          limit: 50,
          lastKey: resetPagination ? undefined : currentNextKey || undefined,
          filters: {
            calibre: filters.calibre,
            formato: filters.formato,
            empresa: filters.empresa,
            turno: filters.turno,
          },
        };

        const response = await cartsApi.list(params);
        const carts = response.items || [];

        if (resetPagination) {
          setAllCarts(carts);
        } else {
          setAllCarts((prev) => [...prev, ...carts]);
        }

        setNextKey(response.nextKey || null);
        setHasMore(!!response.nextKey);
      } catch (error) {
        console.error('Error al cargar carros:', error);
      } finally {
        setLoadingMore(false);
        setLoading(false);
      }
    },
    [filters]
  );

  // Cargar carros iniciales
  useEffect(() => {
    loadCarts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambian los filtros, resetear paginado y recargar
  useEffect(() => {
    setNextKey(null);
    setAllCarts([]);
    setHasMore(true);
    loadCarts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Función para cargar más carros (con filtros activos)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await loadCarts(false, nextKey);
  }, [hasMore, loadingMore, loadCarts, nextKey]);

  // Create refresh function
  const refresh = useCallback(() => {
    setFilters({});
    setNextKey(null);
    setAllCarts([]);
    setHasMore(true);
    loadCarts(true);
  }, [loadCarts]);

  // Handle cart detail modal - same pattern as boxes
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCart(null);
  }, []);

  // Open modal when cart is selected
  useEffect(() => {
    if (selectedCart && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [selectedCart, isModalOpen]);

  // Agrupar carros por empresa
  const cartsByCompany = useMemo(() => {
    const groups: Record<string, Cart[]> = {};

    allCarts.forEach((cart) => {
      const empresa = getEmpresaNombre(cart.codigo);
      if (!groups[empresa]) {
        groups[empresa] = [];
      }
      groups[empresa].push(cart);
    });

    // Ordenar las empresas alfabéticamente
    const sortedEntries = Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b, 'es')
    );

    return sortedEntries;
  }, [allCarts]);

  // Filtrar por searchTerm si existe
  const filteredCartsByCompany = useMemo(() => {
    if (!filters.searchTerm) {
      return cartsByCompany;
    }

    const searchLower = filters.searchTerm.toLowerCase();
    const filtered: Array<[string, Cart[]]> = [];

    cartsByCompany.forEach(([empresa, carts]) => {
      const matchingCarts = carts.filter(
        (cart) =>
          cart.codigo.toLowerCase().includes(searchLower) ||
          getCalibreFromCodigo(cart.codigo).toLowerCase().includes(searchLower)
      );
      if (matchingCarts.length > 0) {
        filtered.push([empresa, matchingCarts]);
      }
    });

    return filtered;
  }, [cartsByCompany, filters.searchTerm]);

  return (
    <div className="v2-page animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando carros…" />
      <PageHeaderV2
        title="Carros"
        description="Lista de carros en Packing."
        actions={
          <Button variant="secondary" size="medium" onClick={refresh}>
            Refrescar
          </Button>
        }
      />

      {/* Filtros */}
      <SectionCardV2 title="Filtros">
        <CartsFilters
          filters={filters}
          onFiltersChange={setFilters}
          disabled={loading || loadingMore}
        />
      </SectionCardV2>

      {/* Stats */}
      <div className="v2-grid-stats">
        <MetricCardV2 label="Total carros" value={allCarts.length} />
        <MetricCardV2
          label="Total bandejas"
          value={allCarts.reduce(
            (sum, cart) => sum + (cart.cantidadBandejas || 0),
            0
          )}
        />
        <MetricCardV2
          label="Total huevos"
          value={allCarts.reduce(
            (sum, cart) => sum + (cart.cantidadHuevos || 0),
            0
          )}
        />
      </div>

      {/* Carros agrupados por empresa */}
      {allCarts.length === 0 && !loadingMore && !loading ? (
        <EmptyStateV2
          title="No hay carros"
          description="Cuando se registren carros en Packing aparecerán en esta vista."
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--5)',
          }}
        >
          {filteredCartsByCompany.map(([empresa, carts]) => {
            const isCollapsed = collapsedCompanies.has(empresa);
            return (
              <div key={empresa}>
                {/* Encabezado del grupo - clickeable para colapsar */}
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
                    {carts.length} {carts.length === 1 ? 'carro' : 'carros'}
                  </span>
                </div>

                {/* Grid de carros de esta empresa - solo visible si no está colapsado */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {carts.map((cart: Cart) => (
                      <CartCard
                        key={cart.codigo}
                        cart={cart}
                        setSelectedCart={setSelectedCart}
                        setIsModalOpen={setIsModalOpen}
                        onDelete={async (codigo) => {
                          try {
                            await cartsApi.remove(codigo);
                            refresh();
                          } catch (error) {
                            console.error('Error al eliminar carro:', error);
                          }
                        }}
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
      {hasMore && allCarts.length > 0 && (
        <div className="mt-5 text-center">
          <Button
            variant="secondary"
            size="medium"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más carros'}
          </Button>
          <p
            className="text-sm"
            style={{
              color: 'var(--text-muted-foreground)',
              marginTop: 'var(--1)',
            }}
          >
            Mostrando {allCarts.length} carros
          </p>
        </div>
      )}

      {/* Cart Detail Modal */}
      <CartDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cart={selectedCart}
        onCartMoved={() => {
          // Refrescar la lista de carros después de mover
          loadCarts(true);
        }}
      />
    </div>
  );
};

export default Carts;
