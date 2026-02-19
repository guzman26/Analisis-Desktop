import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, DataTable, DataTableColumn, Modal } from '@/components/design-system';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Palette,
  ShoppingCart,
  BarChart3,
  Calendar,
  Columns,
} from 'lucide-react';
import { adminMetricsApi } from '@/modules/admin-metrics';
import { useNotifications } from '@/components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import { CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import CalibreLegend from '@/components/CalibreLegend';
import { calculatePeriodChange } from '@/utils/periodComparison';

interface Metric {
  metricType: string;
  dateKey: string;
  date: string;
  data: any;
  calculatedAt: string;
  isFinal: boolean;
}

interface MetricsResponse {
  metrics: Metric[];
  summary: {
    totalBoxes: number;
    totalPallets: number;
    totalCarts?: number;
    totalDays: number;
  };
  count: number;
  totalFound: number;
  dateRange: {
    start: string;
    end: string;
  };
  metricType: string;
  timestamp: string;
}

const Metrics: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [previousSummary, setPreviousSummary] = useState<MetricsResponse['summary'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Table UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  
  // Column visibility - load from localStorage or use defaults
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('metrics-visible-columns');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        // Fallback to defaults
      }
    }
    // Default: show all columns
    return new Set([
      'date',
      'type',
      'totalBoxes',
      'totalPallets',
      'totalCarts',
      'byCalibre',
      'byCalibreEggs',
      'byShift',
      'byOperario',
      'byLocation',
      'status',
      'calculatedAt',
    ]);
  });

  // Filters
  const [metricType, setMetricType] = useState<
    'all' | 'PRODUCTION_DAILY' | 'INVENTORY_SNAPSHOT'
  >('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        metricType: metricType === 'all' ? 'all' : metricType,
        startDate,
        endDate,
      };

      const response = await adminMetricsApi.getMetrics(params);

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      const previousEnd = new Date(start);
      previousEnd.setDate(start.getDate() - 1);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - (diffDays - 1));

      const previousResponse = await adminMetricsApi.getMetrics({
        metricType: metricType === 'all' ? 'all' : metricType,
        startDate: previousStart.toISOString().split('T')[0],
        endDate: previousEnd.toISOString().split('T')[0],
      });

      // Debug: Log response structure
      console.log('📊 Metrics response:', {
        count: response.count,
        metricsLength: response.metrics?.length,
        firstMetric: response.metrics?.[0],
        sampleData: response.metrics?.[0]?.data,
      });

      setData(response);
      setPreviousSummary(previousResponse.summary || null);
      showSuccess(`Métricas cargadas: ${response.count} registros encontrados`);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las métricas';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    fetchMetrics();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('es-ES').format(num);

  // Helper function to safely extract number from parsed DynamoDB data
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const boxesComparison = data?.summary
    ? calculatePeriodChange(data.summary.totalBoxes, previousSummary?.totalBoxes || 0)
    : null;
  const palletsComparison = data?.summary
    ? calculatePeriodChange(data.summary.totalPallets, previousSummary?.totalPallets || 0)
    : null;
  const daysComparison = data?.summary
    ? calculatePeriodChange(data.summary.totalDays, previousSummary?.totalDays || 0)
    : null;

  const healthMetrics = useMemo(() => {
    const production = (data?.metrics || []).filter(
      (metric) => metric.metricType === 'PRODUCTION_DAILY'
    );
    const totalPallets = production.reduce(
      (acc, metric) => acc + safeNumber(metric.data?.totalPallets),
      0
    );
    const issueBreakdown = new Map<string, number>();
    const auditGrades = {
      EXCELLENT: 0,
      GOOD: 0,
      WARNING: 0,
      CRITICAL: 0,
    };

    production.forEach((metric) => {
      const issues = metric.data?.auditIssueCounts || {};
      Object.entries(issues).forEach(([issue, value]) => {
        issueBreakdown.set(issue, (issueBreakdown.get(issue) || 0) + safeNumber(value));
      });

      const grades = metric.data?.auditGrades || {};
      (Object.keys(auditGrades) as Array<keyof typeof auditGrades>).forEach((grade) => {
        auditGrades[grade] += safeNumber(grades[grade]);
      });
    });

    const totalIssues = Array.from(issueBreakdown.values()).reduce(
      (acc, value) => acc + value,
      0
    );
    const incidentsPer100 = totalPallets > 0 ? (totalIssues / totalPallets) * 100 : 0;
    const topIssues = Array.from(issueBreakdown.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      incidentsPer100,
      auditGrades,
      topIssues,
    };
  }, [data]);

  // Helper to display key/value aggregates as compact text
  const formatObjectAsText = (obj: any, maxItems: number = 3): string => {
    if (!obj || typeof obj !== 'object') return '-';
    const entries = Object.entries(obj);
    if (entries.length === 0) return '-';
    const displayEntries = entries.slice(0, maxItems);
    const result = displayEntries
      .map(([key, val]) => `${key}: ${formatNumber(safeNumber(val))}`)
      .join(', ');
    return entries.length > maxItems
      ? `${result}... (+${entries.length - maxItems})`
      : result;
  };

  const createDetailTable = (
    obj: any,
    title: string,
    keyLabel: string = 'Código',
    valueLabel: string = 'Cantidad'
  ) => {
    if (!obj || typeof obj !== 'object') return null;
    const entries = Object.entries(obj);
    if (!entries.length) return null;

    // Determinar si es una tabla de calibres
    const isCalibreTable = title === 'Cajas por Calibre' || title === 'Huevos por Calibre';

    // Sort by value (descending) for better readability
    const sortedEntries = entries.sort((a, b) => {
      const aVal = safeNumber(a[1]);
      const bVal = safeNumber(b[1]);
      return bVal - aVal;
    });

    const total = sortedEntries.reduce(
      (sum, [, val]) => sum + safeNumber(val),
      0
    );

    return (
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px 12px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: '#333',
            }}
          >
            {title}
          </h4>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: '#666',
            }}
          >
            Total: {formatNumber(total)} {valueLabel.toLowerCase()}
          </p>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#555',
                    fontSize: '11px',
                    borderRight: '1px solid #e0e0e0',
                    width: '40%',
                  }}
                >
                  {keyLabel}
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#555',
                    fontSize: '11px',
                    width: '35%',
                  }}
                >
                  {valueLabel}
                </th>
                <th
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#555',
                    fontSize: '11px',
                    width: '25%',
                  }}
                >
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(([key, val], index) => {
                const value = safeNumber(val);
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const calibreName = isCalibreTable 
                  ? CALIBRE_MAP[key as keyof typeof CALIBRE_MAP]
                  : null;
                
                return (
                  <tr
                    key={key}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 12px',
                        borderRight: '1px solid #f0f0f0',
                        fontWeight: 500,
                        color: '#333',
                      }}
                    >
                      {isCalibreTable && calibreName ? (
                        <div>
                          <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            {key}
                          </div>
                          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            {calibreName}
                          </div>
                        </div>
                      ) : (
                        key
                      )}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#333',
                      }}
                    >
                      {formatNumber(value)}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#666',
                        fontSize: '11px',
                      }}
                    >
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  const filteredMetrics = useMemo(() => {
    if (!data?.metrics) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.metrics;

    return data.metrics.filter((metric) => {
      const isProduction = metric.metricType === 'PRODUCTION_DAILY';
      const typeLabel = isProduction
        ? 'producción diaria'
        : 'snapshot inventario';
      const dateLabel = formatDate(metric.date || metric.dateKey).toLowerCase();

      return (
        dateLabel.includes(term) ||
        typeLabel.includes(term) ||
        metric.metricType.toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm]);

  type MetricsRow = Metric & { metricData: any; isProduction: boolean };

  const tableRows: MetricsRow[] = useMemo(() => {
    return filteredMetrics.map((metric) => {
      const isProduction = metric.metricType === 'PRODUCTION_DAILY';
      const metricData = metric.data || {};

      return {
        ...metric,
        metricData,
        isProduction,
      };
    });
  }, [filteredMetrics]);

  // Save column visibility to localStorage
  useEffect(() => {
    localStorage.setItem(
      'metrics-visible-columns',
      JSON.stringify(Array.from(visibleColumns))
    );
  }, [visibleColumns]);

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const allColumns: DataTableColumn<MetricsRow>[] = useMemo(
    () => [
      {
        id: 'date',
        header: 'Fecha',
        accessor: (row) => {
          // Return date object for proper sorting
          const dateStr = row.date || row.dateKey;
          return dateStr ? new Date(dateStr).getTime() : 0;
        },
        sortable: true,
        width: 140,
        renderCell: (row) => formatDate(row.date || row.dateKey),
      },
      {
        id: 'type',
        header: 'Tipo',
        accessor: (row) =>
          row.isProduction ? 'Producción Diaria' : 'Snapshot Inventario',
        sortable: true,
        width: 160,
      },
      {
        id: 'totalBoxes',
        header: 'Total Cajas',
        align: 'right',
        sortable: true,
        accessor: (row) => safeNumber(row.metricData.totalBoxes),
        renderCell: (row) =>
          formatNumber(safeNumber(row.metricData.totalBoxes)),
        width: 120,
      },
      {
        id: 'totalPallets',
        header: 'Total Pallets',
        align: 'right',
        sortable: true,
        accessor: (row) => safeNumber(row.metricData.totalPallets),
        renderCell: (row) =>
          formatNumber(safeNumber(row.metricData.totalPallets)),
        width: 120,
      },
      {
        id: 'totalCarts',
        header: 'Total Carros',
        align: 'right',
        sortable: true,
        accessor: (row) =>
          row.isProduction ? safeNumber(row.metricData.totalCarts) : 0,
        renderCell: (row) =>
          row.isProduction ? formatNumber(safeNumber(row.metricData.totalCarts)) : '-',
        width: 120,
      },
      {
        id: 'byCalibre',
        header: 'Cajas por Calibre',
        accessor: (row) =>
          row.isProduction
            ? formatObjectAsText(row.metricData.boxesByCalibre)
            : '-',
        width: 220,
      },
      {
        id: 'byCalibreEggs',
        header: 'Huevos por Calibre',
        accessor: (row) =>
          row.isProduction
            ? formatObjectAsText(row.metricData.eggsByCalibre)
            : '-',
        width: 220,
      },
      {
        id: 'byShift',
        header: 'Cajas por Horario',
        accessor: (row) =>
          row.isProduction
            ? formatObjectAsText(row.metricData.boxesByShift)
            : '-',
        width: 220,
      },
      {
        id: 'byOperario',
        header: 'Cajas por Operario',
        accessor: (row) =>
          row.isProduction
            ? formatObjectAsText(row.metricData.boxesByOperario)
            : '-',
        width: 220,
      },
      {
        id: 'byLocation',
        header: 'Por Ubicación',
        accessor: (row) =>
          !row.isProduction
            ? formatObjectAsText(row.metricData.byLocation)
            : '-',
        width: 220,
      },
      {
        id: 'status',
        header: 'Estado',
        accessor: (row) => (row.isFinal ? 'Final' : 'Preliminar'),
        width: 110,
        renderCell: (row) => (
          <span
            style={{
              padding:
                'var(--0.5) var(--1)',
              borderRadius: 'var(--rounded-sm)',
              backgroundColor: row.isFinal
                ? 'var(--green-500)'
                : 'var(--orange-500)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {row.isFinal ? 'Final' : 'Preliminar'}
          </span>
        ),
      },
      {
        id: 'calculatedAt',
        header: 'Calculado',
        accessor: (row) =>
          row.calculatedAt ? formatDate(row.calculatedAt) : '-',
        width: 140,
      },
    ],
    []
  );

  // Filter columns based on visibility
  const metricsColumns = useMemo(
    () => allColumns.filter((col) => visibleColumns.has(col.id)),
    [allColumns, visibleColumns]
  );

  return (
    <div
      className="animate-fade-in"
      style={{ padding: 'var(--6)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'var(--6)' }}>
        <div
          className="flex items-center gap-4"
          style={{
            justifyContent: 'space-between',
            marginBottom: 'var(--2)',
          }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--text-foreground)' }}
          >
            Métricas del Sistema
          </h1>
          <div className="flex items-center gap-4" style={{ gap: 'var(--1)' }}>
            <Button
              leftIcon={<TrendingUp style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={() => navigate('/admin/metrics/aggregated')}
            >
              Vista Acumulada
            </Button>
            <Button
              leftIcon={<Columns style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={() => setIsColumnSelectorOpen(true)}
              disabled={loading}
            >
              Columnas
            </Button>
            <Button
              leftIcon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-4"
          style={{
            gap: 'var(--3)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
                display: 'block',
              }}
            >
              Tipo de Métrica
            </label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as any)}
              style={{
                width: '100%',
                padding: 'var(--1) var(--2)',
                borderRadius: 'var(--rounded-md)',
                border: '1px solid var(--border-border)',
                backgroundColor: 'var(--bg-background-primary)',
                color: 'var(--text-foreground)',
                fontSize: '14px',
              }}
            >
              <option value="all">Todas</option>
              <option value="PRODUCTION_DAILY">Producción Diaria</option>
              <option value="INVENTORY_SNAPSHOT">Snapshot de Inventario</option>
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
                display: 'block',
              }}
            >
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
                display: 'block',
              }}
            >
              Fecha Fin
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div
            className="flex items-center gap-4"
            style={{
              gap: 'var(--2)',
              alignItems: 'flex-end',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ minWidth: '220px' }}>
              <label
                className="text-sm"
                style={{
                  color: 'var(--text-muted-foreground)',
                  marginBottom: 'var(--0.5)',
                  display: 'block',
                }}
              >
                Buscar en resultados
              </label>
              <Input
                placeholder="Filtrar por fecha o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          <Button
            variant="primary"
            size="medium"
            onClick={fetchMetrics}
            disabled={loading}
          >
            Aplicar Filtros
          </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--4)',
            marginBottom: 'var(--6)',
          }}
        >
          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--2)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--rounded-md)',
                  backgroundColor: 'var(--blue-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package
                  style={{ width: '24px', height: '24px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--text-muted-foreground)',
                    marginBottom: 'var(--0.5)',
                  }}
                >
                  Total Cajas
                </p>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    color: 'var(--text-foreground)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {formatNumber(data.summary.totalBoxes)}
                </p>
                {boxesComparison && (
                  <p className="text-xs text-muted-foreground">
                    {boxesComparison.isNeutral
                      ? 'Sin cambios vs periodo anterior'
                      : `${boxesComparison.isPositive ? 'Sube' : 'Baja'} ${Math.abs(boxesComparison.percentage).toFixed(1)}%`}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--2)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--rounded-md)',
                  backgroundColor: 'var(--orange-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart
                  style={{ width: '24px', height: '24px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--text-muted-foreground)',
                    marginBottom: 'var(--0.5)',
                  }}
                >
                  Total Carros
                </p>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    color: 'var(--text-foreground)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {formatNumber(data.summary.totalCarts || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--2)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--rounded-md)',
                  backgroundColor: 'var(--green-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Palette
                  style={{ width: '24px', height: '24px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--text-muted-foreground)',
                    marginBottom: 'var(--0.5)',
                  }}
                >
                  Total Pallets
                </p>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    color: 'var(--text-foreground)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {formatNumber(data.summary.totalPallets)}
                </p>
                {palletsComparison && (
                  <p className="text-xs text-muted-foreground">
                    {palletsComparison.isNeutral
                      ? 'Sin cambios vs periodo anterior'
                      : `${palletsComparison.isPositive ? 'Sube' : 'Baja'} ${Math.abs(palletsComparison.percentage).toFixed(1)}%`}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--2)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--rounded-md)',
                  backgroundColor: 'var(--indigo-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar
                  style={{ width: '24px', height: '24px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--text-muted-foreground)',
                    marginBottom: 'var(--0.5)',
                  }}
                >
                  Período
                </p>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    color: 'var(--text-foreground)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {data.summary.totalDays} días
                </p>
                {daysComparison && (
                  <p className="text-xs text-muted-foreground">
                    {daysComparison.isNeutral
                      ? 'Sin cambios vs periodo anterior'
                      : `${daysComparison.isPositive ? 'Sube' : 'Baja'} ${Math.abs(daysComparison.percentage).toFixed(1)}%`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {data && (
        <Card variant="default" padding="medium" style={{ marginBottom: 'var(--6)' }}>
          <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--2)' }}>
            Salud Operativa
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--3)',
            }}
          >
            <div>
              <p className="text-sm text-muted-foreground">Incidencias por 100 pallets</p>
              <p className="text-2xl font-semibold">
                {healthMetrics.incidentsPer100.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distribucion de auditoria</p>
              <p className="text-sm">
                EXCELLENT {healthMetrics.auditGrades.EXCELLENT} | GOOD {healthMetrics.auditGrades.GOOD}
              </p>
              <p className="text-sm">
                WARNING {healthMetrics.auditGrades.WARNING} | CRITICAL {healthMetrics.auditGrades.CRITICAL}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top causas de friccion</p>
              {healthMetrics.topIssues.length === 0 ? (
                <p className="text-sm">Sin incidencias en el periodo.</p>
              ) : (
                healthMetrics.topIssues.map(([issue, count]) => (
                  <p key={issue} className="text-sm">
                    {issue}: {formatNumber(count)}
                  </p>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card
          variant="flat"
          padding="medium"
          style={{ marginBottom: 'var(--4)' }}
        >
          <p style={{ color: 'var(--red-500)', margin: 0 }}>❌ {error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--0.50)' }}>
          <RefreshCw
            style={{
              width: '48px',
              height: '48px',
              color: 'var(--blue-500)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            style={{
              marginTop: 'var(--2)',
              color: 'var(--text-muted-foreground)',
            }}
          >
            Cargando métricas...
          </p>
        </div>
      )}

      {/* Column Selector Modal */}
      <Modal
        isOpen={isColumnSelectorOpen}
        onClose={() => setIsColumnSelectorOpen(false)}
        title="Personalizar Columnas"
        size="small"
      >
        <div style={{ padding: 'var(--4)' }}>
          <p
            className="text-sm"
                  style={{
              color: 'var(--text-muted-foreground)',
              marginBottom: 'var(--3)',
                  }}
                >
            Selecciona las columnas que deseas mostrar en la tabla:
          </p>
          <div
                    style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--2)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {allColumns.map((column) => (
              <label
                key={column.id}
                    style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--2)',
                  padding: 'var(--1)',
                  cursor: 'pointer',
                  borderRadius: 'var(--rounded-sm)',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--gray-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column.id)}
                  onChange={() => toggleColumnVisibility(column.id)}
                    style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--blue-500)',
                  }}
                />
                <span
                  className="text-base"
                  style={{ color: 'var(--text-foreground)', flex: 1 }}
                >
                  {column.header}
                </span>
                {column.sortable && (
                  <span
                    className="text-xs"
                        style={{
                      color: 'var(--text-muted-foreground/70)',
                      fontSize: '11px',
                    }}
                  >
                    Ordenable
                  </span>
                )}
              </label>
            ))}
          </div>
          <div
            className="flex items-center gap-4"
                        style={{
              marginTop: 'var(--4)',
              gap: 'var(--1)',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="ghost"
              size="medium"
              onClick={() => {
                // Show all columns
                setVisibleColumns(
                  new Set(allColumns.map((col) => col.id))
                );
              }}
            >
              Mostrar Todas
            </Button>
            <Button
              variant="ghost"
              size="medium"
              onClick={() => {
                // Show only essential columns
                setVisibleColumns(
                  new Set(['date', 'type', 'totalBoxes', 'status'])
                );
              }}
            >
              Solo Esenciales
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setIsColumnSelectorOpen(false)}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Metrics Table */}
      {!loading && data && tableRows.length > 0 && (
        <Card variant="default" padding="none">
          <DataTable<MetricsRow>
            columns={metricsColumns}
            data={tableRows}
            getRowId={(row) => `${row.metricType}-${row.dateKey}`}
            initialSort={{
              columnId: sortColumn || 'date',
              direction: sortDirection,
            }}
            onSortChange={handleSortChange}
            renderExpandedContent={(row) => {
              const { metricData, isProduction } = row;

                  return (
                <div
                      style={{
                    padding: '16px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {isProduction ? (
                    <>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                          gap: '16px',
                        }}
                      >
                        {createDetailTable(
                          metricData.boxesByCalibre,
                          'Cajas por Calibre',
                          'Calibre',
                          'Cajas'
                        ) || (
                          <div
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: 'white',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            Sin datos de calibre
                          </div>
                        )}
                        {createDetailTable(
                          metricData.eggsByCalibre,
                          'Huevos por Calibre',
                          'Calibre',
                          'Huevos'
                        ) || (
                          <div
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: 'white',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            Sin datos de huevos por calibre
                          </div>
                        )}
                        {createDetailTable(
                          metricData.boxesByShift,
                          'Cajas por Horario',
                          'Horario',
                          'Cajas'
                        ) || (
                          <div
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: 'white',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            Sin datos de horario
                          </div>
                        )}
                        {createDetailTable(
                          metricData.boxesByOperario,
                          'Cajas por Operario',
                          'Operario',
                          'Cajas'
                        ) || (
                          <div
                            style={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: 'white',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            Sin datos de operario
                          </div>
                        )}
                      </div>
                      
                      {/* Leyenda de calibres solo si hay datos de calibre */}
                      {metricData.boxesByCalibre && Object.keys(metricData.boxesByCalibre).length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <CalibreLegend 
                            onlyShow={Object.keys(metricData.boxesByCalibre)} 
                            compact={true}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ maxWidth: '600px' }}>
                      {createDetailTable(
                        metricData.byLocation,
                        'Cajas por Ubicación',
                        'Ubicación',
                        'Cajas'
                      ) || (
                        <div
                        style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            padding: '20px',
                          textAlign: 'center',
                            backgroundColor: 'white',
                            color: '#999',
                          fontSize: '12px',
                          }}
                        >
                          Sin datos de ubicación
          </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </Card>
      )}

      {/* Empty State */}
      {!loading && data && data.metrics.length === 0 && (
        <Card variant="flat" padding="large" style={{ textAlign: 'center' }}>
          <BarChart3
            style={{
              width: '64px',
              height: '64px',
              color: 'var(--text-muted-foreground/70)',
              margin: '0 auto var(--3)',
            }}
          />
          <p
            className="text-base"
            style={{
              color: 'var(--text-muted-foreground)',
              marginBottom: 'var(--3)',
            }}
          >
            No se encontraron métricas para el período seleccionado
          </p>
          <Button variant="primary" onClick={fetchMetrics}>
            Actualizar
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Metrics;
