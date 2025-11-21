import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, DataTable, DataTableColumn } from '@/components/design-system';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Palette,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { getMetrics } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
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
    averageEfficiency: number;
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

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Table UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const createChipsFromObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return null;
    const entries = Object.entries(obj);
    if (!entries.length) return null;

    return (
      <div className="macos-hstack" style={{ flexWrap: 'wrap', gap: 4 }}>
        {entries.map(([key, val]) => (
          <span
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 999,
              backgroundColor: 'var(--macos-gray-6)',
              fontSize: 11,
              color: 'var(--macos-text-secondary)',
            }}
          >
            <span style={{ fontWeight: 600, marginRight: 4 }}>{key}</span>
            <span>{formatNumber(safeNumber(val))}</span>
          </span>
        ))}
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

  const metricsColumns: DataTableColumn<MetricsRow>[] = useMemo(
    () => [
      {
        id: 'date',
        header: 'Fecha',
        accessor: (row) => formatDate(row.date || row.dateKey),
        sortable: true,
        width: 140,
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
        id: 'efficiency',
        header: 'Eficiencia',
        align: 'right',
        sortable: true,
        accessor: (row) => safeNumber(row.metricData.efficiency),
        renderCell: (row) =>
          row.metricData.efficiency !== undefined &&
          row.metricData.efficiency !== null
            ? `${safeNumber(row.metricData.efficiency).toFixed(2)}%`
            : '-',
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
                  backgroundColor: 'var(--macos-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp
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
                  Eficiencia Promedio
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {data.summary.averageEfficiency.toFixed(2)}%
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
                <>
                  {isProduction && (
                    <>
                      <div>
                        <p
                          className="macos-text-footnote"
                        style={{
                            color: 'var(--macos-text-secondary)',
                            marginBottom: 'var(--macos-space-1)',
                          fontWeight: 600,
                        }}
                      >
                        Cajas por Calibre
                        </p>
                        {createChipsFromObject(metricData.boxesByCalibre) || (
                          <p
                            className="macos-text-caption-1"
                        style={{
                              color: 'var(--macos-text-tertiary)',
                              margin: 0,
                            }}
                          >
                            Sin datos de calibre.
                          </p>
                        )}
                      </div>
                      <div>
                        <p
                          className="macos-text-footnote"
                        style={{
                            color: 'var(--macos-text-secondary)',
                            marginBottom: 'var(--macos-space-1)',
                          fontWeight: 600,
                          }}
                        >
                          Cajas por Horario
                        </p>
                        {createChipsFromObject(metricData.boxesByShift) || (
                          <p
                            className="macos-text-caption-1"
                      style={{
                              color: 'var(--macos-text-tertiary)',
                              margin: 0,
                            }}
                          >
                            Sin datos de horario.
                          </p>
                        )}
                      </div>
                      <div>
                        <p
                          className="macos-text-footnote"
                    style={{
                            color: 'var(--macos-text-secondary)',
                            marginBottom: 'var(--macos-space-1)',
                      fontWeight: 600,
                          }}
                        >
                          Cajas por Operario
                        </p>
                        {createChipsFromObject(metricData.boxesByOperario) || (
                          <p
                            className="macos-text-caption-1"
                    style={{
                              color: 'var(--macos-text-tertiary)',
                              margin: 0,
                            }}
                          >
                            Sin datos de operario.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {!isProduction && (
                    <div>
                      <p
                        className="macos-text-footnote"
                      style={{
                          color: 'var(--macos-text-secondary)',
                          marginBottom: 'var(--macos-space-1)',
                            fontWeight: 600,
                          }}
                        >
                        Cajas por Ubicación
                      </p>
                      {createChipsFromObject(metricData.byLocation) || (
                        <p
                          className="macos-text-caption-1"
                        style={{
                            color: 'var(--macos-text-tertiary)',
                            margin: 0,
                          }}
                        >
                          Sin datos de ubicación.
                        </p>
                      )}
          </div>
                  )}
                </>
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
