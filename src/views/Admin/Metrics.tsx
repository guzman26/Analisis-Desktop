import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, DataTable, DataTableColumn, Modal } from '@/components/design-system';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Palette,
  BarChart3,
  Calendar,
  Columns,
} from 'lucide-react';
import { getMetrics } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import '../../styles/designSystem.css';

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
      'byCalibre',
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

      const response = await getMetrics(params);

      // Debug: Log response structure
      console.log('📊 Metrics response:', {
        count: response.count,
        metricsLength: response.metrics?.length,
        firstMetric: response.metrics?.[0],
        sampleData: response.metrics?.[0]?.data,
      });

      setData(response);
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
            Total: {formatNumber(total)} cajas
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
                      {key}
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
        id: 'byCalibre',
        header: 'Cajas por Calibre',
        accessor: (row) =>
          row.isProduction
            ? formatObjectAsText(row.metricData.boxesByCalibre)
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
                'var(--macos-space-1) var(--macos-space-2)',
              borderRadius: 'var(--macos-radius-small)',
              backgroundColor: row.isFinal
                ? 'var(--macos-green)'
                : 'var(--macos-orange)',
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
      className="macos-animate-fade-in"
      style={{ padding: 'var(--macos-space-7)' }}
    >
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
            Métricas del Sistema
          </h1>
          <div className="macos-hstack" style={{ gap: 'var(--macos-space-2)' }}>
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
          className="macos-hstack"
          style={{
            gap: 'var(--macos-space-4)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
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
                padding: 'var(--macos-space-2) var(--macos-space-3)',
                borderRadius: 'var(--macos-radius-medium)',
                border: '1px solid var(--macos-border-primary)',
                backgroundColor: 'var(--macos-background-primary)',
                color: 'var(--macos-text-primary)',
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
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
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
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
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
            className="macos-hstack"
            style={{
              gap: 'var(--macos-space-3)',
              alignItems: 'flex-end',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ minWidth: '220px' }}>
              <label
                className="macos-text-footnote"
                style={{
                  color: 'var(--macos-text-secondary)',
                  marginBottom: 'var(--macos-space-1)',
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
            gap: 'var(--macos-space-5)',
            marginBottom: 'var(--macos-space-7)',
          }}
        >
          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-blue)',
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
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                  }}
                >
                  Total Cajas
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {formatNumber(data.summary.totalBoxes)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-green)',
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
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                  }}
                >
                  Total Pallets
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {formatNumber(data.summary.totalPallets)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-indigo)',
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
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                  }}
                >
                  Período
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {data.summary.totalDays} días
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card
          variant="flat"
          padding="medium"
          style={{ marginBottom: 'var(--macos-space-5)' }}
        >
          <p style={{ color: 'var(--macos-red)', margin: 0 }}>❌ {error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--macos-space-10)' }}>
          <RefreshCw
            style={{
              width: '48px',
              height: '48px',
              color: 'var(--macos-blue)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            style={{
              marginTop: 'var(--macos-space-3)',
              color: 'var(--macos-text-secondary)',
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
        <div style={{ padding: 'var(--macos-space-5)' }}>
          <p
            className="macos-text-footnote"
                  style={{
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-4)',
                  }}
                >
            Selecciona las columnas que deseas mostrar en la tabla:
          </p>
          <div
                    style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--macos-space-3)',
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
                  gap: 'var(--macos-space-3)',
                  padding: 'var(--macos-space-2)',
                  cursor: 'pointer',
                  borderRadius: 'var(--macos-radius-small)',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--macos-gray-6)';
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
                    accentColor: 'var(--macos-blue)',
                  }}
                />
                <span
                  className="macos-text-body"
                  style={{ color: 'var(--macos-text-primary)', flex: 1 }}
                >
                  {column.header}
                </span>
                {column.sortable && (
                  <span
                    className="macos-text-caption-1"
                        style={{
                      color: 'var(--macos-text-tertiary)',
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
            className="macos-hstack"
                        style={{
              marginTop: 'var(--macos-space-5)',
              gap: 'var(--macos-space-2)',
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
              color: 'var(--macos-text-tertiary)',
              margin: '0 auto var(--macos-space-4)',
            }}
          />
          <p
            className="macos-text-body"
            style={{
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-4)',
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
