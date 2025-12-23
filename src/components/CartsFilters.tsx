import React from 'react';
import { Button, Card, Input } from '@/components/design-system';
import { Filter, X, Package, Search, Clock, Building2 } from 'lucide-react';

export type Filters = {
  calibre?: string;
  formato?: string;
  empresa?: string;
  turno?: string;
  searchTerm?: string;
};

interface CartsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  disabled?: boolean;
}

const CartsFilters: React.FC<CartsFiltersProps> = ({
  filters,
  onFiltersChange,
  disabled = false,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [localState, setLocalState] = React.useState<{
    calibre: string;
    formato: string;
    searchTerm: string;
    turno: string;
    empresa: string;
  }>({
    calibre: filters.calibre || '',
    formato: filters.formato || '',
    searchTerm: filters.searchTerm || '',
    turno: filters.turno || '',
    empresa: filters.empresa || '',
  });

  // Sincronizar estado local cuando cambian los filtros desde fuera
  React.useEffect(() => {
    setLocalState({
      calibre: filters.calibre || '',
      formato: filters.formato || '',
      searchTerm: filters.searchTerm || '',
      turno: filters.turno || '',
      empresa: filters.empresa || '',
    });
  }, [filters]);

  // Debounce para searchTerm
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearchTerm = localState.searchTerm || undefined;
      if (currentSearchTerm !== filters.searchTerm) {
        onFiltersChange({
          ...filters,
          searchTerm: currentSearchTerm,
        });
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localState.searchTerm]);

  // Debounce para empresa
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentEmpresa = localState.empresa || undefined;
      if (currentEmpresa !== filters.empresa) {
        onFiltersChange({
          ...filters,
          empresa: currentEmpresa,
        });
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localState.empresa]);

  // Actualizar filtros inmediatamente para otros campos
  const updateFilter = React.useCallback(
    (key: keyof Filters, value: string) => {
      onFiltersChange({
        ...filters,
        [key]: value || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const clearAll = () => {
    setLocalState({
      calibre: '',
      formato: '',
      searchTerm: '',
      turno: '',
      empresa: '',
    });
    onFiltersChange({});
  };

  const hasActive = Boolean(
    filters.calibre ||
      filters.formato ||
      filters.searchTerm ||
      filters.turno ||
      filters.empresa
  );

  return (
    <Card variant="flat">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-macos-accent" />
          <h3 className="text-sm font-medium">Filtros</h3>
          {hasActive && (
            <span className="px-2 py-0.5 rounded-macos-sm bg-macos-accent/10 text-macos-accent text-xs">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            <Button
              variant="secondary"
              size="small"
              leftIcon={<X size={14} />}
              onClick={clearAll}
              disabled={disabled}
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={() => setExpanded((v) => !v)}
            disabled={disabled}
          >
            {expanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Búsqueda */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Search size={14} /> Buscar código
            </label>
            <Input
              placeholder="Buscar…"
              value={localState.searchTerm}
              onChange={(e) =>
                setLocalState((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              disabled={disabled}
            />
          </div>

          {/* Empresa */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Building2 size={14} /> Empresa
            </label>
            <Input
              placeholder="Nombre de empresa"
              value={localState.empresa}
              onChange={(e) => {
                const value = e.target.value;
                setLocalState((prev) => ({ ...prev, empresa: value }));
              }}
              disabled={disabled}
            />
          </div>

          {/* Calibre */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Package size={14} /> Calibre
            </label>
            <Input
              placeholder="Calibre (ej: M, G, J)"
              value={localState.calibre}
              onChange={(e) => {
                const value = e.target.value;
                setLocalState((prev) => ({ ...prev, calibre: value }));
                updateFilter('calibre', value);
              }}
              disabled={disabled}
            />
          </div>

          {/* Formato */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary">
              Formato
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={localState.formato}
              onChange={(e) => {
                const value = e.target.value;
                setLocalState((prev) => ({ ...prev, formato: value }));
                updateFilter('formato', value);
              }}
              disabled={disabled}
            >
              <option value="">Todos</option>
              <option value="4">Formato 4</option>
              <option value="5">Formato 5</option>
            </select>
          </div>

          {/* Turno */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Clock size={14} /> Turno
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={localState.turno}
              onChange={(e) => {
                const value = e.target.value;
                setLocalState((prev) => ({ ...prev, turno: value }));
                updateFilter('turno', value);
              }}
              disabled={disabled}
            >
              <option value="">Todos</option>
              <option value="1">Turno 1</option>
              <option value="2">Turno 2</option>
              <option value="3">Turno 3</option>
            </select>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CartsFilters;
export type { Filters as CartsFiltersType };

