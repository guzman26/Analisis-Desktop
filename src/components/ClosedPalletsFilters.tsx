import React from 'react';
import { Button } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  // Función para aplicar todos los filtros del estado local
  const handleApplyFilters = () => {
    onFiltersChange({
      calibre: localState.calibre || undefined,
      searchTerm: localState.searchTerm || undefined,
      fechaDesde: localState.dateFrom || undefined,
      fechaHasta: localState.dateTo || undefined,
      turno: localState.turno || undefined,
      empresa: localState.empresa || undefined,
    });
  };

  const clearAll = () => {
    setLocalState({
      calibre: '',
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      turno: '',
      empresa: '',
    });
    // Aplicar filtros vacíos inmediatamente
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Filtros</CardTitle>
            {hasActive && <Badge variant="secondary">Activos</Badge>}
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
            {expanded && (
              <Button
                variant="primary"
                size="small"
                onClick={handleApplyFilters}
                disabled={disabled}
              >
                Aplicar
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
      </CardHeader>

      {expanded && (
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Search size={14} /> Buscar código o calibre
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
              }}
              disabled={disabled}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <Clock size={14} /> Turno
            </Label>
            <Select
              value={localState.turno || 'all'}
              onValueChange={(value) =>
                setLocalState((prev) => ({
                  ...prev,
                  turno: value === 'all' ? '' : value,
                }))
              }
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

          <div className="space-y-1">
            <Label className="text-xs">Rango de fechas</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localState.dateFrom}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalState((p) => ({ ...p, dateFrom: v }));
                }}
                disabled={disabled}
              />
              <Input
                type="date"
                value={localState.dateTo}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalState((p) => ({ ...p, dateTo: v }));
                }}
                disabled={disabled}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ClosedPalletsFilters;
export type { Filters as ClosedPalletsFiltersType };
