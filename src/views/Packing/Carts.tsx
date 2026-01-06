import { useEffect, useState, useMemo, useCallback } from 'react';
import { Cart } from '@/types';
import CartCard from '@/components/CartCard';
import CartDetailModal from '@/components/CartDetailModal';
import {
  getCarts,
  deleteCart,
} from '@/api/endpoints';
import CartsFilters, {
  Filters,
} from '@/components/CartsFilters';
import { Card, Button, LoadingOverlay } from '@/components/design-system';
import { getEmpresaNombre, getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/designSystem.css';

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

        const response = await getCarts(params);
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
    <div className="macos-animate-fade-in">
      <LoadingOverlay show={loading} text="Cargando carros…" />
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
            Carros
          </h1>
          <Button variant="secondary" size="medium" onClick={refresh}>
            Refrescar
          </Button>
        </div>
        <p
          className="macos-text-body"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          Lista de carros en Packing
        </p>
      </div>

      {/* Filtros */}
      <CartsFilters
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
              Total Carros
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-blue)',
                fontWeight: 700,
              }}
            >
              {allCarts.length}
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
              Total Bandejas
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-green)',
                fontWeight: 700,
              }}
            >
              {allCarts.reduce(
                (sum, cart) => sum + (cart.cantidadBandejas || 0),
                0
              )}
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
              Total Huevos
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-purple)',
                fontWeight: 700,
              }}
            >
              {allCarts.reduce(
                (sum, cart) => sum + (cart.cantidadHuevos || 0),
                0
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Carros agrupados por empresa */}
      {allCarts.length === 0 && !loadingMore && !loading ? (
        <Card>
          <p
            className="macos-text-body"
            style={{
              textAlign: 'center',
              padding: 'var(--macos-space-8)',
              color: 'var(--macos-text-secondary)',
            }}
          >
            No hay carros
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
                    {carts.length}{' '}
                    {carts.length === 1 ? 'carro' : 'carros'}
                  </span>
                </div>

                {/* Grid de carros de esta empresa - solo visible si no está colapsado */}
                {!isCollapsed && (
                  <div
                    className="macos-grid"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(320px, 1fr))',
                    }}
                  >
                    {carts.map((cart: Cart) => (
                      <CartCard
                        key={cart.codigo}
                        cart={cart}
                        setSelectedCart={setSelectedCart}
                        setIsModalOpen={setIsModalOpen}
                        onDelete={async (codigo) => {
                          try {
                            await deleteCart(codigo);
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
        <div style={{ marginTop: 'var(--macos-space-6)', textAlign: 'center' }}>
          <Button
            variant="secondary"
            size="medium"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más carros'}
          </Button>
          <p
            className="macos-text-footnote"
            style={{
              color: 'var(--macos-text-secondary)',
              marginTop: 'var(--macos-space-2)',
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
      />
    </div>
  );
};

export default Carts;

