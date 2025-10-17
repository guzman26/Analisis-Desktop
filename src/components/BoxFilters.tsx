import React, { useState, useEffect } from 'react';
import { Box } from '@/types';
import {
  formatCalibreName,
  ALL_CALIBRE_CODES,
} from '@/utils/getParamsFromCodigo';
import { Button, Input, Card } from './design-system';
import { Filter, X, Package, Hash } from 'lucide-react';
import styles from './BoxFilters.module.css';

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
        (box) => box.calibre.toString() === filters.calibre
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
    <Card variant="flat" className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <Filter className="w-5 h-5 text-macos-accent" />
          <h3>Filtros</h3>
          {hasActiveFilters && (
            <span className={styles.activeBadge}>Activos</span>
          )}
        </div>
        <div className={styles.filtersActions}>
          {disabled && (
            <span className={styles.activeBadge} style={{ marginRight: 8 }}>
              Buscando...
            </span>
          )}
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

      {isExpanded && (
        <div className={styles.filtersContent}>
          {/* Búsqueda general */}
          <div className={styles.searchSection}>
            <label className={styles.searchLabel}>
              <Hash className="w-4 h-4" />
              Buscar por código, empacadora u operario
            </label>
            <Input
              placeholder="Buscar..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
              }
              disabled={disabled}
            />
          </div>

          {/* Filtros en grid */}
          <div className={styles.filtersGrid}>
            {/* Filtro por calibre */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Package className="w-4 h-4" />
                Calibre
              </label>
              <select
                className={styles.filterSelect}
                value={filters.calibre}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({ ...prev, calibre: value }));
                  setServerFilters((prev) => ({ ...prev, calibre: value }));
                }}
                disabled={disabled}
              >
                <option value="">Todos los calibres</option>
                {uniqueCalibres.map((calibre) => (
                  <option key={calibre} value={calibre}>
                    {formatCalibreName(calibre)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro server-side: formato */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Formato</label>
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

            {/* Filtro server-side: empresa */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Empresa</label>
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

            {/* Filtro server-side: horario */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Horario</label>
              <select
                className={styles.filterSelect}
                value={serverFilters.horario || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setServerFilters((prev) => ({
                    ...prev,
                    horario: value || undefined,
                    horario_proceso: value || undefined,
                  }));
                }}
                disabled={disabled}
              >
                <option value="">Mañana/Tarde</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>

            {/* Filtro server-side: código (exacto o contiene) */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Código (exacto o contiene)
              </label>
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

          {/* Filtro por tipo de caja */}
          <div className={styles.typeFilterSection}>
            <label className={styles.typeFilterLabel}>Tipo de Caja</label>
            <div className={styles.typeFilterOptions}>
              <label className={styles.typeFilterOption}>
                <input
                  type="radio"
                  name="customInfo"
                  value=""
                  checked={filters.hasCustomInfo === null}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, hasCustomInfo: null }))
                  }
                  className={styles.typeFilterRadio}
                />
                <span className={styles.typeFilterText}>Todas</span>
              </label>
              <label className={styles.typeFilterOption}>
                <input
                  type="radio"
                  name="customInfo"
                  value="special"
                  checked={filters.hasCustomInfo === true}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, hasCustomInfo: true }))
                  }
                  className={styles.typeFilterRadio}
                />
                <span className={styles.typeFilterText}>Solo especiales</span>
              </label>
              <label className={styles.typeFilterOption}>
                <input
                  type="radio"
                  name="customInfo"
                  value="normal"
                  checked={filters.hasCustomInfo === false}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, hasCustomInfo: false }))
                  }
                  className={styles.typeFilterRadio}
                />
                <span className={styles.typeFilterText}>Solo normales</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BoxFilters;
