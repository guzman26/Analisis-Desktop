import React from 'react';
import { Pallet } from '@/types';
import { Button, Card, Input } from '@/components/design-system';
import { Filter, X, Package, Search } from 'lucide-react';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';

type ServerFilters = {
  fechaDesde?: string;
  fechaHasta?: string;
};

type LocalFilters = {
  calibre: string;
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
};

interface ClosedPalletsFiltersProps {
  pallets: Pallet[];
  onLocalFiltersChange: (filtered: Pallet[]) => void;
  onServerFiltersChange?: (filters: ServerFilters) => void;
  disabled?: boolean;
}

const ClosedPalletsFilters: React.FC<ClosedPalletsFiltersProps> = ({
  pallets,
  onLocalFiltersChange,
  onServerFiltersChange,
  disabled = false,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [local, setLocal] = React.useState<LocalFilters>({
    calibre: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
  });
  const [server, setServer] = React.useState<ServerFilters>({});

  // Unique calibres from pallet code
  const calibres = React.useMemo(() => {
    const values = Array.from(
      new Set(
        pallets.map((p) => getCalibreFromCodigo(p.codigo)).filter(Boolean)
      )
    );
    return values.sort();
  }, [pallets]);

  // Apply local filters to current list
  React.useEffect(() => {
    let filtered = [...pallets];
    if (local.calibre) {
      filtered = filtered.filter(
        (p) => getCalibreFromCodigo(p.codigo) === local.calibre
      );
    }
    if (local.searchTerm) {
      const q = local.searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        [p.codigo, p.baseCode, getCalibreFromCodigo(p.codigo)]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    onLocalFiltersChange(filtered);
  }, [local, pallets, onLocalFiltersChange]);

  // Debounce server filters
  React.useEffect(() => {
    const t = setTimeout(() => onServerFiltersChange?.(server), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server]);

  const clearAll = () => {
    setLocal({ calibre: '', searchTerm: '', dateFrom: '', dateTo: '' });
    setServer({});
  };

  const hasActive =
    Boolean(
      local.calibre || local.searchTerm || local.dateFrom || local.dateTo
    ) || Boolean(server.fechaDesde || server.fechaHasta);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Búsqueda */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Search size={14} /> Buscar código o calibre
            </label>
            <Input
              placeholder="Buscar…"
              value={local.searchTerm}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
              disabled={disabled}
            />
          </div>

          {/* Calibre */}
          <div className="space-y-1">
            <label className="text-xs text-macos-text-secondary flex items-center gap-1">
              <Package size={14} /> Calibre
            </label>
            <select
              className="w-full border border-macos-border rounded-macos-sm px-3 py-2"
              value={local.calibre}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, calibre: e.target.value }))
              }
              disabled={disabled}
            >
              <option value="">Todos</option>
              {calibres.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
                value={local.dateFrom}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocal((p) => ({ ...p, dateFrom: v }));
                  setServer((p) => ({ ...p, fechaDesde: v || undefined }));
                }}
                disabled={disabled}
              />
              <Input
                type="date"
                value={local.dateTo}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocal((p) => ({ ...p, dateTo: v }));
                  setServer((p) => ({ ...p, fechaHasta: v || undefined }));
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
