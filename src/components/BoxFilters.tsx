import React, { useState, useEffect } from 'react';
import { Box } from '@/types';
import { formatCalibreName } from '@/utils/getParamsFromCodigo';
import { Button, Input, Card } from './design-system';
import { Filter, X, Calendar, Package, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './BoxFilters.module.css';

interface BoxFiltersProps {
  boxes: Box[];
  onFiltersChange: (filteredBoxes: Box[]) => void;
}

interface FilterState {
  calibre: string;
  dateFrom: string;
  dateTo: string;
  hasCustomInfo: boolean | null; // null = todos, true = solo especiales, false = solo normales
  searchTerm: string;
}

const BoxFilters: React.FC<BoxFiltersProps> = ({ boxes, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    calibre: '',
    dateFrom: '',
    dateTo: '',
    hasCustomInfo: null,
    searchTerm: '',
  });

  // Obtener calibres únicos de las cajas
  const uniqueCalibres = Array.from(
    new Set(boxes.map((box) => box.calibre.toString()))
  ).sort();

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
        (box) => (box.customInfo && box.customInfo.length > 0) === filters.hasCustomInfo
      );
    }

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredBoxes = filteredBoxes.filter(
        (box) =>
          box.codigo.toLowerCase().includes(searchLower) ||
          box.empacadora.toLowerCase().includes(searchLower) ||
          box.operario.toLowerCase().includes(searchLower)
      );
    }

    onFiltersChange(filteredBoxes);
  }, [filters, boxes, onFiltersChange]);

  const clearFilters = () => {
    setFilters({
      calibre: '',
      dateFrom: '',
      dateTo: '',
      hasCustomInfo: null,
      searchTerm: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null
  );

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
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="small"
              leftIcon={<X size={14} />}
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
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
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, calibre: e.target.value }))
                }
              >
                <option value="">Todos los calibres</option>
                {uniqueCalibres.map((calibre) => (
                  <option key={calibre} value={calibre}>
                    {formatCalibreName(calibre)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por fecha desde */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Calendar className="w-4 h-4" />
                Fecha desde
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
              />
            </div>

            {/* Filtro por fecha hasta */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Calendar className="w-4 h-4" />
                Fecha hasta
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
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