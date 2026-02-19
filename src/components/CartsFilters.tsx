import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Package, Search, Clock, Building2 } from 'lucide-react';
import FilterHeader from '@/components/shared/FilterHeader';
import { COMPANY_CATALOG, normalizeCompanyCode } from '@/utils/company';

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
    empresa: normalizeCompanyCode(filters.empresa) || '',
  });

  // Sincronizar estado local cuando cambian los filtros desde fuera
  React.useEffect(() => {
    setLocalState({
      calibre: filters.calibre || '',
      formato: filters.formato || '',
      searchTerm: filters.searchTerm || '',
      turno: filters.turno || '',
      empresa: normalizeCompanyCode(filters.empresa) || '',
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

  const companyOptions = React.useMemo(
    () =>
      Object.entries(COMPANY_CATALOG)
        .filter(([key]) => /^\d{2}$/.test(key))
        .sort(([a], [b]) => Number(a) - Number(b)),
    []
  );

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
    <Card>
      <CardHeader className="pb-3">
        <FilterHeader
          title="Filtros"
          icon={<Filter className="w-5 h-5" />}
          hasActive={hasActive}
          onClear={hasActive ? clearAll : undefined}
          onToggle={() => setExpanded((v) => !v)}
          isExpanded={expanded}
          disabled={disabled}
        />
      </CardHeader>

      {expanded && (
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Search size={14} /> Buscar código
            </Label>
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

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Building2 size={14} /> Empresa
            </Label>
            <Select
              value={localState.empresa || 'all'}
              onValueChange={(value) => {
                const resolved = value === 'all' ? '' : value;
                setLocalState((prev) => ({ ...prev, empresa: resolved }));
                updateFilter('empresa', resolved);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {companyOptions.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Package size={14} /> Calibre
            </Label>
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

          <div className="space-y-1">
            <Label className="text-xs">Formato</Label>
            <Select
              value={localState.formato || 'all'}
              onValueChange={(value) => {
                const resolved = value === 'all' ? '' : value;
                setLocalState((prev) => ({ ...prev, formato: resolved }));
                updateFilter('formato', resolved);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="4">Formato 4</SelectItem>
                <SelectItem value="5">Formato 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Clock size={14} /> Turno
            </Label>
            <Select
              value={localState.turno || 'all'}
              onValueChange={(value) => {
                const resolved = value === 'all' ? '' : value;
                setLocalState((prev) => ({ ...prev, turno: resolved }));
                updateFilter('turno', resolved);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">Turno 1</SelectItem>
                <SelectItem value="2">Turno 2</SelectItem>
                <SelectItem value="3">Turno 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CartsFilters;
export type { Filters as CartsFiltersType };
