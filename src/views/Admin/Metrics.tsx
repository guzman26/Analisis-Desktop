import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '@/components/design-system';
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

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
      {!loading && data && data.metrics.length > 0 && (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--macos-background-secondary)',
                    borderBottom: '1px solid var(--macos-border-primary)',
                  }}
                >
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'var(--macos-background-secondary)',
                      zIndex: 1,
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Tipo
                  </th>
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Total Cajas
                  </th>
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Total Pallets
                  </th>
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Eficiencia
                  </th>
                  {metricType === 'all' || metricType === 'PRODUCTION_DAILY' ? (
                    <>
                      <th
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--macos-text-primary)',
                          fontSize: '14px',
                        }}
                      >
                        Cajas por Calibre
                      </th>
                      <th
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--macos-text-primary)',
                          fontSize: '14px',
                        }}
                      >
                        Cajas por Horario
                      </th>
                      <th
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--macos-text-primary)',
                          fontSize: '14px',
                        }}
                      >
                        Cajas por Operario
                      </th>
                    </>
                  ) : null}
                  {metricType === 'all' ||
                  metricType === 'INVENTORY_SNAPSHOT' ? (
                    <th
                      style={{
                        padding: 'var(--macos-space-3)',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--macos-text-primary)',
                        fontSize: '14px',
                      }}
                    >
                      Por Ubicación
                    </th>
                  ) : null}
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: 'var(--macos-space-3)',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                      fontSize: '14px',
                    }}
                  >
                    Calculado
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.metrics.map((metric, index) => {
                  const isProduction = metric.metricType === 'PRODUCTION_DAILY';
                  const metricData = metric.data || {};

                  // Helper function to safely extract number from parsed DynamoDB data
                  const safeNumber = (value: any): number => {
                    if (value === null || value === undefined) return 0;
                    if (typeof value === 'number') return value;
                    if (typeof value === 'string') {
                      const num = parseFloat(value);
                      return isNaN(num) ? 0 : num;
                    }
                    return 0;
                  };

                  // Helper function to format object as string for display
                  const formatObjectAsText = (
                    obj: any,
                    maxItems: number = 3
                  ): string => {
                    if (!obj || typeof obj !== 'object') return '-';
                    const entries = Object.entries(obj);
                    if (entries.length === 0) return '-';
                    const displayEntries = entries.slice(0, maxItems);
                    const result = displayEntries
                      .map(
                        ([key, val]) =>
                          `${key}: ${formatNumber(safeNumber(val))}`
                      )
                      .join(', ');
                    return entries.length > maxItems
                      ? `${result}... (+${entries.length - maxItems})`
                      : result;
                  };

                  return (
                    <tr
                      key={`${metric.metricType}-${metric.dateKey}`}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? 'var(--macos-background-primary)'
                            : 'var(--macos-background-secondary)',
                        borderBottom: '1px solid var(--macos-border-primary)',
                      }}
                    >
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'inherit',
                        }}
                      >
                        {formatDate(metric.date || metric.dateKey)}
                      </td>
                      <td style={{ padding: 'var(--macos-space-3)' }}>
                        {isProduction
                          ? 'Producción Diaria'
                          : 'Snapshot Inventario'}
                      </td>
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'right',
                        }}
                      >
                        {formatNumber(safeNumber(metricData.totalBoxes))}
                      </td>
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'right',
                        }}
                      >
                        {formatNumber(safeNumber(metricData.totalPallets))}
                      </td>
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'right',
                        }}
                      >
                        {metricData.efficiency !== undefined &&
                        metricData.efficiency !== null
                          ? `${safeNumber(metricData.efficiency).toFixed(2)}%`
                          : '-'}
                      </td>
                      {metricType === 'all' ||
                      metricType === 'PRODUCTION_DAILY' ? (
                        <>
                          <td
                            style={{
                              padding: 'var(--macos-space-3)',
                              textAlign: 'left',
                              fontSize: '12px',
                            }}
                          >
                            {isProduction
                              ? formatObjectAsText(metricData.boxesByCalibre)
                              : '-'}
                          </td>
                          <td
                            style={{
                              padding: 'var(--macos-space-3)',
                              textAlign: 'left',
                              fontSize: '12px',
                            }}
                          >
                            {isProduction
                              ? formatObjectAsText(metricData.boxesByShift)
                              : '-'}
                          </td>
                          <td
                            style={{
                              padding: 'var(--macos-space-3)',
                              textAlign: 'left',
                              fontSize: '12px',
                            }}
                          >
                            {isProduction
                              ? formatObjectAsText(metricData.boxesByOperario)
                              : '-'}
                          </td>
                        </>
                      ) : null}
                      {metricType === 'all' ||
                      metricType === 'INVENTORY_SNAPSHOT' ? (
                        <td
                          style={{
                            padding: 'var(--macos-space-3)',
                            textAlign: 'left',
                            fontSize: '12px',
                          }}
                        >
                          {!isProduction
                            ? formatObjectAsText(metricData.byLocation)
                            : '-'}
                        </td>
                      ) : null}
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'center',
                        }}
                      >
                        <span
                          style={{
                            padding:
                              'var(--macos-space-1) var(--macos-space-2)',
                            borderRadius: 'var(--macos-radius-small)',
                            backgroundColor: metric.isFinal
                              ? 'var(--macos-green)'
                              : 'var(--macos-orange)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {metric.isFinal ? 'Final' : 'Preliminar'}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: 'var(--macos-space-3)',
                          textAlign: 'center',
                          fontSize: '12px',
                          color: 'var(--macos-text-secondary)',
                        }}
                      >
                        {metric.calculatedAt
                          ? formatDate(metric.calculatedAt)
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
