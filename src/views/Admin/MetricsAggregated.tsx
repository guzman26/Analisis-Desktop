import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, DataTable } from '@/components/design-system';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Palette,
  Users,
  Clock,
  BarChart3,
  Calendar,
  CalendarDays,
} from 'lucide-react';
import { getMetrics } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import { useNavigate } from 'react-router-dom';
import PeriodSelector from '@/components/PeriodSelector';
import CalibreLegend from '@/components/CalibreLegend';
import { CALIBRE_MAP } from '@/utils/getParamsFromCodigo';
import {
  PeriodType,
  getPeriodRange,
  filterMetricsByPeriod,
  aggregateByOperario,
  aggregateByCalibre,
  aggregateByHorario,
  aggregateByTemporalPeriod,
  calculateSummary,
  Metric,
} from '@/utils/metricsAggregation';

type ViewType = 'operario' | 'calibre' | 'horario' | 'temporal' | 'summary';

const MetricsAggregated: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [currentView, setCurrentView] = useState<ViewType>('summary');

  const periodRange = useMemo(
    () => getPeriodRange(periodType, customStart, customEnd),
    [periodType, customStart, customEnd]
  );

  const filteredMetrics = useMemo(
    () => filterMetricsByPeriod(allMetrics, periodRange),
    [allMetrics, periodRange]
  );

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch a wide date range to allow aggregation
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Get last year of data

      const params: any = {
        metricType: 'PRODUCTION_DAILY',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      const response = await getMetrics(params);
      setAllMetrics(response.metrics || []);
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

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('es-ES').format(num);

  const handleCustomDatesChange = (start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  // Aggregated data
  const operarioData = useMemo(
    () => aggregateByOperario(filteredMetrics),
    [filteredMetrics]
  );

  const calibreData = useMemo(
    () => aggregateByCalibre(filteredMetrics),
    [filteredMetrics]
  );

  const horarioData = useMemo(
    () => aggregateByHorario(filteredMetrics),
    [filteredMetrics]
  );

  const temporalData = useMemo(
    () => aggregateByTemporalPeriod(filteredMetrics, 'week'),
    [filteredMetrics]
  );

  const summaryData = useMemo(
    () => calculateSummary(filteredMetrics),
    [filteredMetrics]
  );

  // View tabs
  const viewTabs: Array<{ id: ViewType; label: string; icon: React.ReactNode }> = [
    { id: 'summary', label: 'Resumen', icon: <BarChart3 size={16} /> },
    { id: 'operario', label: 'Por Operario', icon: <Users size={16} /> },
    { id: 'calibre', label: 'Por Calibre', icon: <Package size={16} /> },
    { id: 'horario', label: 'Por Horario', icon: <Clock size={16} /> },
    { id: 'temporal', label: 'Evolución', icon: <TrendingUp size={16} /> },
  ];

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
            marginBottom: 'var(--4)',
          }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--text-foreground)' }}
          >
            Métricas Acumuladas
          </h1>
          <div className="flex items-center gap-4" style={{ gap: 'var(--1)' }}>
            <Button
              leftIcon={<CalendarDays style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={() => navigate('/admin/metrics')}
            >
              Vista Diaria
            </Button>
            <Button
              leftIcon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={fetchMetrics}
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card variant="default" padding="medium">
          <PeriodSelector
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
            customStart={customStart}
            customEnd={customEnd}
            onCustomDatesChange={handleCustomDatesChange}
            periodRange={periodRange}
          />
        </Card>
      </div>

      {/* View Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--1)',
          marginBottom: 'var(--4)',
          flexWrap: 'wrap',
        }}
      >
        {viewTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={currentView === tab.id ? 'primary' : 'secondary'}
            size="medium"
            leftIcon={tab.icon}
            onClick={() => setCurrentView(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

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

      {/* Views */}
      {!loading && filteredMetrics.length > 0 && (
        <>
          {/* Summary View */}
          {currentView === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--4)' }}>
              {/* Summary Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--4)',
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
                        {formatNumber(summaryData.totalBoxes)}
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
                        {formatNumber(summaryData.totalPallets)}
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
                        Días con Producción
                      </p>
                      <p
                        className="text-2xl font-semibold"
                        style={{
                          color: 'var(--text-foreground)',
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {summaryData.totalDays}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Rankings */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 'var(--4)',
                }}
              >
                {/* Top Operarios */}
                <Card variant="default" padding="medium">
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      marginBottom: 'var(--3)',
                      color: 'var(--text-foreground)',
                    }}
                  >
                    Top 5 Operarios
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--1)' }}>
                    {summaryData.topOperarios.map((op, index) => (
                      <div
                        key={op.operario}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--1)',
                          backgroundColor: index % 2 === 0 ? 'var(--gray-50)' : 'transparent',
                          borderRadius: 'var(--rounded-sm)',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--text-foreground)',
                            }}
                          >
                            #{index + 1} {op.operario}
                          </span>
                          <p
                            className="text-xs"
                            style={{
                              color: 'var(--text-muted-foreground)',
                              margin: 0,
                            }}
                          >
                            {op.daysWorked} días trabajados
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--text-foreground)',
                            }}
                          >
                            {formatNumber(op.totalBoxes)}
                          </span>
                          <p
                            className="text-xs"
                            style={{
                              color: 'var(--text-muted-foreground)',
                              margin: 0,
                            }}
                          >
                            {op.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Calibres */}
                <Card variant="default" padding="medium">
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      marginBottom: 'var(--3)',
                      color: 'var(--text-foreground)',
                    }}
                  >
                    Top 5 Calibres
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--1)' }}>
                    {summaryData.topCalibres.map((cal, index) => {
                      const calibreName = CALIBRE_MAP[cal.calibre as keyof typeof CALIBRE_MAP] || 'Desconocido';
                      return (
                        <div
                          key={cal.calibre}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--1)',
                            backgroundColor: index % 2 === 0 ? 'var(--gray-50)' : 'transparent',
                            borderRadius: 'var(--rounded-sm)',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontWeight: 600,
                                color: 'var(--text-foreground)',
                              }}
                            >
                              {cal.calibre}
                            </span>
                            <p
                              className="text-xs"
                              style={{
                                color: 'var(--text-muted-foreground)',
                                margin: 0,
                              }}
                            >
                              {calibreName}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: 'var(--text-foreground)',
                              }}
                            >
                              {formatNumber(cal.totalBoxes)}
                            </span>
                            <p
                              className="text-xs"
                              style={{
                                color: 'var(--text-muted-foreground)',
                                margin: 0,
                              }}
                            >
                              {cal.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Operario View */}
          {currentView === 'operario' && (
            <Card variant="default" padding="none">
              <DataTable
                columns={[
                  {
                    id: 'rank',
                    header: '#',
                    width: 60,
                    renderCell: (row) => {
                      const index = operarioData.findIndex((op) => op.operario === row.operario);
                      return (
                        <span style={{ fontWeight: 600, color: 'var(--text-muted-foreground)' }}>
                          #{index + 1}
                        </span>
                      );
                    },
                  },
                  {
                    id: 'operario',
                    header: 'Operario',
                    width: 150,
                    accessor: (row) => row.operario,
                    sortable: true,
                  },
                  {
                    id: 'totalBoxes',
                    header: 'Total Cajas',
                    align: 'right',
                    width: 140,
                    accessor: (row) => row.totalBoxes,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalBoxes),
                  },
                  {
                    id: 'totalPallets',
                    header: 'Total Pallets',
                    align: 'right',
                    width: 140,
                    accessor: (row) => row.totalPallets,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalPallets),
                  },
                  {
                    id: 'daysWorked',
                    header: 'Días Trabajados',
                    align: 'right',
                    width: 140,
                    accessor: (row) => row.daysWorked,
                    sortable: true,
                  },
                  {
                    id: 'percentage',
                    header: 'Participación',
                    align: 'right',
                    width: 120,
                    accessor: (row) => row.percentage,
                    sortable: true,
                    renderCell: (row) => `${row.percentage.toFixed(2)}%`,
                  },
                ]}
                data={operarioData}
                getRowId={(row) => row.operario}
                initialSort={{ columnId: 'totalBoxes', direction: 'desc' }}
              />
            </Card>
          )}

          {/* Calibre View */}
          {currentView === 'calibre' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--4)' }}>
              <Card variant="default" padding="none">
                <DataTable
                  columns={[
                    {
                      id: 'rank',
                      header: '#',
                      width: 60,
                      renderCell: (row) => {
                        const index = calibreData.findIndex((cal) => cal.calibre === row.calibre);
                        return (
                          <span style={{ fontWeight: 600, color: 'var(--text-muted-foreground)' }}>
                            #{index + 1}
                          </span>
                        );
                      },
                    },
                    {
                      id: 'calibre',
                      header: 'Calibre',
                      width: 120,
                      accessor: (row) => row.calibre,
                      sortable: true,
                      renderCell: (row) => {
                        const calibreName = CALIBRE_MAP[row.calibre as keyof typeof CALIBRE_MAP] || 'Desconocido';
                        return (
                          <div>
                            <div style={{ fontWeight: 600 }}>{row.calibre}</div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-muted-foreground)' }}
                            >
                              {calibreName}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      id: 'totalBoxes',
                      header: 'Total Cajas',
                      align: 'right',
                      width: 180,
                      accessor: (row) => row.totalBoxes,
                      sortable: true,
                      renderCell: (row) => formatNumber(row.totalBoxes),
                    },
                    {
                      id: 'percentage',
                      header: 'Distribución',
                      align: 'right',
                      width: 150,
                      accessor: (row) => row.percentage,
                      sortable: true,
                      renderCell: (row) => `${row.percentage.toFixed(2)}%`,
                    },
                  ]}
                  data={calibreData}
                  getRowId={(row) => row.calibre}
                  initialSort={{ columnId: 'totalBoxes', direction: 'desc' }}
                />
              </Card>
              
              <CalibreLegend onlyShow={calibreData.map((c) => c.calibre)} />
            </div>
          )}

          {/* Horario View */}
          {currentView === 'horario' && (
            <Card variant="default" padding="none">
              <DataTable
                columns={[
                  {
                    id: 'horario',
                    header: 'Turno',
                    width: 120,
                    accessor: (row) => row.horario,
                    sortable: true,
                  },
                  {
                    id: 'totalBoxes',
                    header: 'Total Cajas',
                    align: 'right',
                    width: 180,
                    accessor: (row) => row.totalBoxes,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalBoxes),
                  },
                  {
                    id: 'totalPallets',
                    header: 'Total Pallets',
                    align: 'right',
                    width: 180,
                    accessor: (row) => row.totalPallets,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalPallets),
                  },
                  {
                    id: 'percentage',
                    header: 'Participación',
                    align: 'right',
                    width: 150,
                    accessor: (row) => row.percentage,
                    sortable: true,
                    renderCell: (row) => `${row.percentage.toFixed(2)}%`,
                  },
                ]}
                data={horarioData}
                getRowId={(row) => row.horario}
                initialSort={{ columnId: 'horario', direction: 'asc' }}
              />
            </Card>
          )}

          {/* Temporal View */}
          {currentView === 'temporal' && (
            <Card variant="default" padding="none">
              <DataTable
                columns={[
                  {
                    id: 'period',
                    header: 'Período',
                    width: 200,
                    accessor: (row) => row.period,
                    sortable: true,
                  },
                  {
                    id: 'totalBoxes',
                    header: 'Total Cajas',
                    align: 'right',
                    width: 180,
                    accessor: (row) => row.totalBoxes,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalBoxes),
                  },
                  {
                    id: 'totalPallets',
                    header: 'Total Pallets',
                    align: 'right',
                    width: 180,
                    accessor: (row) => row.totalPallets,
                    sortable: true,
                    renderCell: (row) => formatNumber(row.totalPallets),
                  },
                ]}
                data={temporalData}
                getRowId={(row) => row.period}
                initialSort={{ columnId: 'period', direction: 'asc' }}
              />
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredMetrics.length === 0 && (
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

export default MetricsAggregated;

