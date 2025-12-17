import React from 'react';
import { Button, Card, Input } from '@/components/design-system';
import { Filter, X, Package, Search, Clock, Building2 } from 'lucide-react';

export type Filters = {
  fechaDesde?: string;
  fechaHasta?: string;
  calibre?: string;
  empresa?: string;
  turno?: string;
  searchTerm?: string;
};

interface ClosedPalletsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  disabled?: boolean;
}

const ClosedPalletsFilters: React.FC<ClosedPalletsFiltersProps> = ({
  filters,
  onFiltersChange,
  disabled = false,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [localState, setLocalState] = React.useState<{
    calibre: string;
    searchTerm: string;
    dateFrom: string;
    dateTo: string;
    turno: string;
    empresa: string;
  }>({
    calibre: filters.calibre || '',
    searchTerm: filters.searchTerm || '',
    dateFrom: filters.fechaDesde || '',
    dateTo: filters.fechaHasta || '',
    turno: filters.turno || '',
    empresa: filters.empresa || '',
  });

  // Sincronizar estado local cuando cambian los filtros desde fuera
  React.useEffect(() => {
    setLocalState({
      calibre: filters.calibre || '',
      searchTerm: filters.searchTerm || '',
      dateFrom: filters.fechaDesde || '',
      dateTo: filters.fechaHasta || '',
      turno: filters.turno || '',
      empresa: filters.empresa || '',
    });
  }, [filters]);

  // Debounce para searchTerm
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearchTerm = localState.searchTerm || undefined;
      // Solo actualizar si el valor cambió
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
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      turno: '',
      empresa: '',
    });
    onFiltersChange({});
  };

  const hasActive = Boolean(
    filters.calibre ||
      filters.searchTerm ||
      filters.fechaDesde ||
      filters.fechaHasta ||
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
              <Search size={14} /> Buscar código o calibre
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
                updateFilter('empresa', value);
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

          {/* Turno (client-side) */}
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

          {/* Rango de fechas (server-side) */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary">
              Rango de fechas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localState.dateFrom}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalState((p) => ({ ...p, dateFrom: v }));
                  updateFilter('fechaDesde', v);
                }}
                disabled={disabled}
              />
              <Input
                type="date"
                value={localState.dateTo}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalState((p) => ({ ...p, dateTo: v }));
                  updateFilter('fechaHasta', v);
                }}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ClosedPalletsFilters;
export type { Filters as ClosedPalletsFiltersType };
