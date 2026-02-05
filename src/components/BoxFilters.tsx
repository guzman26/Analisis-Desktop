import React, { useState, useEffect } from 'react';
import { Box } from '@/types';
import {
  formatCalibreName,
  ALL_CALIBRE_CODES,
} from '@/utils/getParamsFromCodigo';
import { Button } from './design-system';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Filter, X, Package, Hash } from 'lucide-react';

interface ServerFilters {
  calibre?: string;
  formato?: string;
  formato_caja?: string;
  empresa?: string;
  horario?: string;
  horario_proceso?: string;
  codigo?: string;
}

interface BoxFiltersProps {
  boxes: Box[];
  onFiltersChange: (filteredBoxes: Box[]) => void;
  onServerFiltersChange?: (filters: ServerFilters) => void;
  disabled?: boolean;
}

interface FilterState {
  calibre: string;
  dateFrom: string;
  dateTo: string;
  hasCustomInfo: boolean | null; // null = todos, true = solo especiales, false = solo normales
  searchTerm: string;
}

const BoxFilters: React.FC<BoxFiltersProps> = ({
  boxes,
  onFiltersChange,
  onServerFiltersChange,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    calibre: '',
    dateFrom: '',
    dateTo: '',
    hasCustomInfo: null,
    searchTerm: '',
  });
  const [serverFilters, setServerFilters] = useState<ServerFilters>({});

  // Usar lista canónica de calibres para siempre mostrar todas las opciones
  const uniqueCalibres = React.useMemo(() => {
    return ALL_CALIBRE_CODES.slice();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filteredBoxes = [...boxes];

    // Filtro por calibre
    if (filters.calibre) {
      filteredBoxes = filteredBoxes.filter(
        (box) => box.calibre === filters.calibre
      );
    }

    // Filtro por fecha
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredBoxes = filteredBoxes.filter(
        (box) => new Date(box.fecha_registro) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Incluir todo el día
      filteredBoxes = filteredBoxes.filter(
        (box) => new Date(box.fecha_registro) <= toDate
      );
    }

    // Filtro por tipo de caja (especial/normal)
    if (filters.hasCustomInfo !== null) {
      filteredBoxes = filteredBoxes.filter(
        (box) =>
          (box.customInfo && box.customInfo.length > 0) ===
          filters.hasCustomInfo
      );
    }

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredBoxes = filteredBoxes.filter(
        (box) =>
          box.codigo?.toLowerCase().includes(searchLower) ||
          box.empacadora?.toLowerCase().includes(searchLower) ||
          box.operario?.toLowerCase().includes(searchLower)
      );
    }

    onFiltersChange(filteredBoxes);
  }, [filters, boxes, onFiltersChange]);

  // Aplicar filtros al backend sólo cuando el usuario presione el botón
  const handleApplyServerFilters = () => {
    const raw = (filters.searchTerm || '').trim();
    const isOnlyDigits = /^\d{1,}$/.test(raw);
    const payload = {
      ...serverFilters,
      // Si el usuario escribió un código numérico en la búsqueda general,
      // úsalo como `codigo` para el backend (exacto o contiene).
      codigo: isOnlyDigits ? raw : serverFilters.codigo,
    } as ServerFilters;
    onServerFiltersChange?.(payload);
  };

  const clearFilters = () => {
    setFilters({
      calibre: '',
      dateFrom: '',
      dateTo: '',
      hasCustomInfo: null,
      searchTerm: '',
    });
    setServerFilters({});
  };

  const hasActiveFilters =
    Object.values(filters).some((value) => value !== '' && value !== null) ||
    Object.values(serverFilters).some((v) => v !== '' && v !== undefined);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Filtros</CardTitle>
            {hasActiveFilters && <Badge variant="secondary">Activos</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {disabled && <Badge variant="outline">Buscando...</Badge>}
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="small"
                leftIcon={<X size={14} />}
                onClick={clearFilters}
                disabled={disabled}
              >
                Limpiar
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              onClick={handleApplyServerFilters}
              disabled={disabled}
            >
              Aplicar
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Buscar por código, empacadora u operario
            </Label>
            <Input
              placeholder="Buscar..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
              disabled={disabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Calibre
              </Label>
              <Select
                value={filters.calibre || 'all'}
                onValueChange={(value) => {
                  const calibreValue = value === 'all' ? '' : value;
                  setFilters((prev) => ({ ...prev, calibre: calibreValue }));
                  setServerFilters((prev) => ({ ...prev, calibre: calibreValue }));
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los calibres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los calibres</SelectItem>
                  {uniqueCalibres.map((calibre) => (
                    <SelectItem key={calibre} value={calibre}>
                      {formatCalibreName(calibre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Input
                placeholder="formato o formato_caja"
                value={serverFilters.formato || ''}
                onChange={(e) =>
                  setServerFilters((prev) => ({
                    ...prev,
                    formato: e.target.value,
                    formato_caja: e.target.value,
                  }))
                }
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input
                placeholder="código de empresa"
                value={serverFilters.empresa || ''}
                onChange={(e) =>
                  setServerFilters((prev) => ({
                    ...prev,
                    empresa: e.target.value,
                  }))
                }
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Horario</Label>
              <Select
                value={serverFilters.horario || 'all'}
                onValueChange={(value) => {
                  const horarioValue = value === 'all' ? undefined : value;
                  setServerFilters((prev) => ({
                    ...prev,
                    horario: horarioValue,
                    horario_proceso: horarioValue,
                  }));
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mañana/Tarde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mañana/Tarde</SelectItem>
                  <SelectItem value="Mañana">Mañana</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Código (exacto o contiene)</Label>
              <Input
                placeholder="Ej: 234 o 1234567890123456"
                value={serverFilters.codigo || ''}
                onChange={(e) =>
                  setServerFilters((prev) => ({
                    ...prev,
                    codigo: e.target.value,
                  }))
                }
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Caja</Label>
            <RadioGroup
              value={
                filters.hasCustomInfo === null
                  ? 'all'
                  : filters.hasCustomInfo
                  ? 'special'
                  : 'normal'
              }
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  hasCustomInfo:
                    value === 'all' ? null : value === 'special',
                }));
              }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="box-type-all" />
                <Label htmlFor="box-type-all">Todas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="special" id="box-type-special" />
                <Label htmlFor="box-type-special">Solo especiales</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="box-type-normal" />
                <Label htmlFor="box-type-normal">Solo normales</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BoxFilters;
