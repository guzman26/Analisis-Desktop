import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Card, Button, DataTable, Input } from '@/components/design-system';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from 'lucide-react';
import { getSalesOrders, getCustomers } from '@/api/endpoints';
import { useNotifications } from '@/components/Notification/Notification';
import PeriodSelector from '@/components/PeriodSelector';
import {
  PeriodType,
  getPeriodRange,
  PeriodRange,
} from '@/utils/metricsAggregation';
import {
  filterSalesByPeriod,
  aggregateByCustomer,
  aggregateByType,
  aggregateByState,
  aggregateByTemporalPeriod,
  calculateSalesSummary,
  getPreviousPeriod,
  compareSalesPeriods,
  compareAggregatedData,
  ChangeIndicator,
  ComparisonResult,
  AggregatedByCustomer,
  AggregatedByType,
  AggregatedByState,
} from '@/utils/salesMetricsAggregation';
import { exportSalesToExcel } from '@/utils/exportToExcel';
import { Sale, SaleType, SaleState, Customer } from '@/types';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  filterValid,
  isValidSale,
  isValidCustomer,
  isValidPaginatedResponse,
} from '@/utils/dataValidation';
import '../../styles/designSystem.css';

const SalesMetrics: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const { handleError, getError } = useErrorHandler();

  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    suggestion?: string;
    requestId?: string;
    details?: any;
  } | null>(null);

  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();
  const [selectedState, setSelectedState] = useState<SaleState | 'all'>('all');
  const [selectedType, setSelectedType] = useState<SaleType | 'all'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Comparison state
  const [enableComparison, setEnableComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'auto' | 'custom'>('auto');
  const [comparisonPeriod1] = useState<PeriodRange | null>(null);
  const [comparisonPeriod2] = useState<PeriodRange | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(['totalSales', 'totalBoxes', 'totalPallets', 'averages', 'byCustomer', 'byType', 'byState', 'temporal'])
  );

  const periodRange = useMemo(
    () => getPeriodRange(periodType, customStart, customEnd),
    [periodType, customStart, customEnd]
  );

  // Calculate comparison periods
  const comparisonPeriods = useMemo(() => {
    if (!enableComparison) return { period1: null, period2: null };

    if (comparisonMode === 'auto') {
      const period1 = periodRange;
      const period2 = getPreviousPeriod(periodType, customStart, customEnd);
      return { period1, period2 };
    } else {
      return {
        period1: comparisonPeriod1 || periodRange,
        period2: comparisonPeriod2 || getPreviousPeriod(periodType, customStart, customEnd),
      };
    }
  }, [enableComparison, comparisonMode, periodRange, periodType, customStart, customEnd, comparisonPeriod1, comparisonPeriod2]);

  // Fetch all sales (we'll filter client-side for now)
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch a wide date range to allow filtering
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const response = await getSalesOrders({
        filters: {
          // We'll fetch all and filter client-side for flexibility
        },
        limit: 10000, // Large limit to get all sales
      });

      // Handle paginated response with validation
      let allSalesData: Sale[] = [];
      
      if (Array.isArray(response)) {
        // Direct array response - validate each item
        allSalesData = filterValid(response, isValidSale);
      } else if (isValidPaginatedResponse<Sale>(response)) {
        // PaginatedResponse structure - validate items
        allSalesData = filterValid(response.items, isValidSale);
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Response with data property
        const data = (response as any).data;
        if (Array.isArray(data)) {
          allSalesData = filterValid(data, isValidSale);
        } else if (isValidPaginatedResponse<Sale>(data)) {
          allSalesData = filterValid(data.items, isValidSale);
        }
      }

      // Log warning if some items were filtered out
      const totalReceived = Array.isArray(response)
        ? response.length
        : isValidPaginatedResponse(response)
        ? response.items.length
        : (response as any)?.data?.length || 0;
      
      if (totalReceived > allSalesData.length) {
        console.warn(
          `Se filtraron ${totalReceived - allSalesData.length} ventas inválidas de ${totalReceived} recibidas`
        );
      }

      setAllSales(allSalesData);
      showSuccess(`Ventas cargadas: ${allSalesData.length} registros encontrados`);
    } catch (err) {
      const { formattedMessage, errorInfo } = getError(err);
      setError(formattedMessage);
      setErrorDetails({
        title: errorInfo.title,
        message: errorInfo.message,
        suggestion: errorInfo.suggestion,
        requestId: errorInfo.requestId,
        details: errorInfo.details,
      });
      handleError(err, {
        title: 'Error al cargar ventas',
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  }, [showSuccess, handleError]);

  // Fetch customers for filter
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await getCustomers();
      
      // Validate and filter customers
      let customersData: Customer[] = [];
      if (Array.isArray(response)) {
        customersData = filterValid(response, isValidCustomer);
      } else if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as any).data;
        if (Array.isArray(data)) {
          customersData = filterValid(data, isValidCustomer);
        }
      }
      
      setCustomers(customersData);
    } catch (err) {
      handleError(err, {
        title: 'Error al cargar clientes',
        duration: 6000,
      });
    }
  }, [handleError]);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, [fetchSales, fetchCustomers]);

  // Filter sales based on all criteria
  const filteredSales = useMemo(() => {
    let filtered = filterSalesByPeriod(allSales, periodRange);

    if (selectedState !== 'all') {
      filtered = filtered.filter((sale) => sale.state === selectedState);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((sale) => sale.type === selectedType);
    }

    if (selectedCustomerId !== 'all') {
      filtered = filtered.filter((sale) => sale.customerId === selectedCustomerId);
    }

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.saleId.toLowerCase().includes(term) ||
          (sale.customerName || sale.customerInfo?.name || '').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allSales, periodRange, selectedState, selectedType, selectedCustomerId, debouncedSearchTerm]);

  // Filter sales for comparison period
  const filteredSalesComparison = useMemo(() => {
    if (!enableComparison || !comparisonPeriods.period2) return [];

    let filtered = filterSalesByPeriod(allSales, comparisonPeriods.period2);

    if (selectedState !== 'all') {
      filtered = filtered.filter((sale) => sale.state === selectedState);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((sale) => sale.type === selectedType);
    }

    if (selectedCustomerId !== 'all') {
      filtered = filtered.filter((sale) => sale.customerId === selectedCustomerId);
    }

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.saleId.toLowerCase().includes(term) ||
          (sale.customerName || sale.customerInfo?.name || '').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allSales, comparisonPeriods.period2, selectedState, selectedType, selectedCustomerId, debouncedSearchTerm, enableComparison]);

  // Calculate aggregated metrics
  const summaryData = useMemo(
    () => calculateSalesSummary(filteredSales),
    [filteredSales]
  );

  const customersData = useMemo(
    () => aggregateByCustomer(filteredSales),
    [filteredSales]
  );

  const typeData = useMemo(() => aggregateByType(filteredSales), [filteredSales]);
  const stateData = useMemo(() => aggregateByState(filteredSales), [filteredSales]);
  const temporalData = useMemo(
    () => aggregateByTemporalPeriod(filteredSales, 'day'),
    [filteredSales]
  );

  // Calculate comparison metrics
  const summaryDataComparison = useMemo(
    () => (enableComparison ? calculateSalesSummary(filteredSalesComparison) : null),
    [filteredSalesComparison, enableComparison]
  );

  const customersDataComparison = useMemo(
    () => (enableComparison ? aggregateByCustomer(filteredSalesComparison) : []),
    [filteredSalesComparison, enableComparison]
  );

  const typeDataComparison = useMemo(
    () => (enableComparison ? aggregateByType(filteredSalesComparison) : []),
    [filteredSalesComparison, enableComparison]
  );

  const stateDataComparison = useMemo(
    () => (enableComparison ? aggregateByState(filteredSalesComparison) : []),
    [filteredSalesComparison, enableComparison]
  );

  const temporalDataComparison = useMemo(
    () => (enableComparison ? aggregateByTemporalPeriod(filteredSalesComparison, 'day') : []),
    [filteredSalesComparison, enableComparison]
  );

  // Calculate period comparison
  const periodComparison = useMemo(() => {
    if (!enableComparison || !summaryDataComparison) return null;
    return compareSalesPeriods(summaryData, summaryDataComparison);
  }, [enableComparison, summaryData, summaryDataComparison]);

  // Memoize format functions
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleCustomDatesChange = useCallback((start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
  }, []);

  const handleToggleComparison = useCallback(() => {
    setEnableComparison((prev) => !prev);
  }, []);

  const handleComparisonModeChange = useCallback((mode: 'auto' | 'custom') => {
    setComparisonMode(mode);
  }, []);

  const handleMetricToggle = useCallback((metric: string) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) {
        next.delete(metric);
      } else {
        next.add(metric);
      }
      return next;
    });
  }, []);

  // Helper to render change indicator as badge - memoized
  const renderChangeIndicator = useCallback((change: ChangeIndicator | null) => {
    if (!change) return null;

    const color = change.isPositive
      ? '#10B981'
      : change.isNegative
      ? '#EF4444'
      : '#6B7280';
    const bgColor = change.isPositive
      ? 'rgba(16, 185, 129, 0.1)'
      : change.isNegative
      ? 'rgba(239, 68, 68, 0.1)'
      : 'rgba(107, 114, 128, 0.1)';
    const icon = change.isPositive ? '↑' : change.isNegative ? '↓' : '→';
    const sign = change.value > 0 ? '+' : '';

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: 'var(--macos-space-2)',
          padding: '4px 8px',
          backgroundColor: bgColor,
          borderRadius: 'var(--macos-radius-small)',
          border: `1px solid ${color}40`,
        }}
      >
        <span style={{ color, fontWeight: 700, fontSize: '12px' }}>{icon}</span>
        <span
          style={{
            color,
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {sign}
          {formatNumber(Math.abs(change.value))}
        </span>
        <span
          style={{
            color,
            fontSize: '10px',
            fontWeight: 500,
            opacity: 0.8,
          }}
        >
          ({sign}
          {change.percentage.toFixed(1)}%)
        </span>
      </div>
    );
  }, [formatNumber]);

  const handleExportToExcel = useCallback(() => {
    try {
      exportSalesToExcel(
        filteredSales,
        summaryData,
        customersData,
        typeData,
        stateData,
        temporalData,
        enableComparison && summaryDataComparison && periodComparison
          ? {
              summaryComparison: summaryDataComparison,
              periodComparison,
              customersComparison: customersDataComparison,
              typeComparison: typeDataComparison,
              stateComparison: stateDataComparison,
              temporalComparison: temporalDataComparison,
              period1Label: comparisonPeriods.period1?.label,
              period2Label: comparisonPeriods.period2?.label,
            }
          : undefined
      );
      showSuccess('Archivo Excel exportado exitosamente');
    } catch (error) {
      handleError(error, {
        title: 'Error al exportar a Excel',
        duration: 6000,
      });
    }
  }, [
    filteredSales,
    summaryData,
    customersData,
    typeData,
    stateData,
    temporalData,
    enableComparison,
    summaryDataComparison,
    periodComparison,
    customersDataComparison,
    typeDataComparison,
    stateDataComparison,
    temporalDataComparison,
    comparisonPeriods,
    showSuccess,
    showError,
  ]);

  // State labels - memoized constant
  const stateLabels = useMemo<Record<SaleState, string>>(
    () => ({
      DRAFT: 'Borrador',
      CONFIRMED: 'Confirmada',
      DISPATCHED: 'Despachada',
      PARTIALLY_RETURNED: 'Parcialmente Devuelta',
      FULLY_RETURNED: 'Totalmente Devuelta',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    }),
    []
  );

  // Table columns - memoized
  const salesColumns = useMemo(
    () => [
    {
      id: 'saleId',
      header: 'ID Venta',
      width: 150,
      accessor: (row: Sale) => row.saleId,
      sortable: true,
    },
    {
      id: 'createdAt',
      header: 'Fecha',
      width: 120,
      accessor: (row: Sale) => row.createdAt,
      sortable: true,
      renderCell: (row: Sale) => formatDate(row.createdAt),
    },
    {
      id: 'customer',
      header: 'Cliente',
      width: 200,
      accessor: (row: Sale) => row.customerName || row.customerInfo?.name || 'Sin nombre',
      sortable: true,
    },
    {
      id: 'type',
      header: 'Tipo',
      width: 120,
      accessor: (row: Sale) => row.type,
      sortable: true,
    },
    {
      id: 'state',
      header: 'Estado',
      width: 140,
      accessor: (row: Sale) => row.state || 'DRAFT',
      sortable: true,
      renderCell: (row: Sale) => {
        const state = row.state || 'DRAFT';
        return stateLabels[state] || state;
      },
    },
    {
      id: 'totalBoxes',
      header: 'Total Cajas',
      align: 'right' as const,
      width: 120,
      accessor: (row: Sale) => {
        if (row.totalBoxes !== undefined) return row.totalBoxes;
        if (row.items) {
          return row.items.reduce((sum, item) => sum + (item.boxIds?.length || 0), 0);
        }
        return row.boxes?.length || 0;
      },
      sortable: true,
      renderCell: (row: Sale) => {
        const total = row.totalBoxes || row.items?.reduce((sum, item) => sum + (item.boxIds?.length || 0), 0) || row.boxes?.length || 0;
        return formatNumber(total);
      },
    },
    {
      id: 'totalPallets',
      header: 'Total Pallets',
      align: 'right' as const,
      width: 120,
      accessor: (row: Sale) => {
        if (row.items) {
          const uniquePallets = new Set(row.items.map((item) => item.palletId).filter(Boolean));
          return uniquePallets.size;
        }
        return row.pallets?.length || 0;
      },
      sortable: true,
      renderCell: (row: Sale) => {
        if (row.items) {
          const uniquePallets = new Set(row.items.map((item) => item.palletId).filter(Boolean));
          return formatNumber(uniquePallets.size);
        }
        return formatNumber(row.pallets?.length || 0);
      },
    },
    {
      id: 'confirmedAt',
      header: 'Confirmación',
      width: 120,
      accessor: (row: Sale) => row.confirmedAt,
      sortable: true,
      renderCell: (row: Sale) => row.confirmedAt ? formatDate(row.confirmedAt) : '-',
    },
    {
      id: 'dispatchedAt',
      header: 'Despacho',
      width: 120,
      accessor: (row: Sale) => row.dispatchedAt,
      sortable: true,
      renderCell: (row: Sale) => row.dispatchedAt ? formatDate(row.dispatchedAt) : '-',
    },
    {
      id: 'completedAt',
      header: 'Completado',
      width: 120,
      accessor: (row: Sale) => row.completedAt,
      sortable: true,
      renderCell: (row: Sale) => row.completedAt ? formatDate(row.completedAt) : '-',
    },
  ],
    [formatDate, formatNumber, stateLabels]
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
            marginBottom: 'var(--macos-space-5)',
          }}
        >
          <h1
            className="macos-text-large-title"
            style={{ color: 'var(--macos-text-primary)' }}
          >
            Métricas de Ventas
          </h1>
          <div className="macos-hstack" style={{ gap: 'var(--macos-space-2)' }}>
            <Button
              leftIcon={<FileSpreadsheet style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={handleExportToExcel}
              disabled={loading || filteredSales.length === 0}
            >
              Exportar Excel
            </Button>
            <Button
              leftIcon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
              variant="secondary"
              size="medium"
              onClick={fetchSales}
              disabled={loading}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card variant="default" padding="none">
          <div
            style={{
              padding: 'var(--macos-space-4)',
              borderBottom: filtersExpanded ? '1px solid var(--macos-gray-4)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--macos-space-2)' }}>
              <Filter style={{ width: '18px', height: '18px', color: 'var(--macos-text-secondary)' }} />
              <h3
                className="macos-text-title-3"
                style={{ margin: 0, color: 'var(--macos-text-primary)' }}
              >
                Filtros y Comparación
              </h3>
            </div>
            {filtersExpanded ? (
              <ChevronUp style={{ width: '18px', height: '18px', color: 'var(--macos-text-secondary)' }} />
            ) : (
              <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--macos-text-secondary)' }} />
            )}
          </div>

          {filtersExpanded && (
            <div
              style={{
                padding: 'var(--macos-space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--macos-space-4)',
              }}
            >
              <PeriodSelector
                periodType={periodType}
                onPeriodTypeChange={setPeriodType}
                customStart={customStart}
                customEnd={customEnd}
                onCustomDatesChange={handleCustomDatesChange}
                periodRange={periodRange}
              />

              {/* Comparison Toggle - Improved Switch */}
              <div
                style={{
                  padding: 'var(--macos-space-4)',
                  backgroundColor: enableComparison ? 'rgba(0, 122, 255, 0.05)' : 'var(--macos-gray-6)',
                  borderRadius: 'var(--macos-radius-medium)',
                  border: `2px solid ${enableComparison ? 'var(--macos-blue)' : 'var(--macos-gray-4)'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: enableComparison ? 'var(--macos-space-3)' : 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--macos-space-3)' }}>
                    <label
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '48px',
                        height: '28px',
                        cursor: 'pointer',
                      }}
                      aria-label="Activar comparación de períodos"
                    >
                      <input
                        type="checkbox"
                        checked={enableComparison}
                        onChange={handleToggleComparison}
                        role="switch"
                        aria-checked={enableComparison}
                        aria-label="Comparar con período anterior"
                        style={{
                          opacity: 0,
                          width: 0,
                          height: 0,
                          position: 'absolute',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: enableComparison ? 'var(--macos-blue)' : 'var(--macos-gray-4)',
                          borderRadius: '28px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            height: '22px',
                            width: '22px',
                            left: '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            transform: enableComparison ? 'translateX(20px)' : 'translateX(0)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                      </span>
                    </label>
                    <span
                      className="macos-text-subheadline"
                      style={{
                        color: 'var(--macos-text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      Comparar con período anterior
                    </span>
                  </div>
                </div>

                {enableComparison && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--macos-space-3)',
                      paddingTop: 'var(--macos-space-3)',
                      borderTop: '1px solid var(--macos-gray-4)',
                    }}
                  >
                    {/* Period Labels - More Visible */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--macos-space-3)',
                        padding: 'var(--macos-space-3)',
                        backgroundColor: 'var(--macos-background)',
                        borderRadius: 'var(--macos-radius-small)',
                      }}
                    >
                      <div>
                        <p
                          className="macos-text-caption-1"
                          style={{
                            color: 'var(--macos-text-secondary)',
                            marginBottom: '4px',
                          }}
                        >
                          Período Actual
                        </p>
                        <p
                          className="macos-text-body"
                          style={{
                            color: 'var(--macos-blue)',
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {comparisonPeriods.period1?.label || periodRange.label}
                        </p>
                      </div>
                      <div>
                        <p
                          className="macos-text-caption-1"
                          style={{
                            color: 'var(--macos-text-secondary)',
                            marginBottom: '4px',
                          }}
                        >
                          Período Comparado
                        </p>
                        <p
                          className="macos-text-body"
                          style={{
                            color: 'var(--macos-text-tertiary)',
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {comparisonPeriods.period2?.label || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Mode Selector */}
                    <div style={{ display: 'flex', gap: 'var(--macos-space-2)' }}>
                      <Button
                        variant={comparisonMode === 'auto' ? 'primary' : 'secondary'}
                        size="small"
                        onClick={() => handleComparisonModeChange('auto')}
                        style={{ flex: 1 }}
                      >
                        Automático
                      </Button>
                      <Button
                        variant={comparisonMode === 'custom' ? 'primary' : 'secondary'}
                        size="small"
                        onClick={() => handleComparisonModeChange('custom')}
                        style={{ flex: 1 }}
                      >
                        Personalizado
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            {/* Custom Period Selectors (when comparison mode is custom) */}
            {enableComparison && comparisonMode === 'custom' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 'var(--macos-space-3)',
                  padding: 'var(--macos-space-3)',
                  backgroundColor: 'var(--macos-gray-6)',
                  borderRadius: 'var(--macos-radius-medium)',
                }}
              >
                <div>
                  <label
                    className="macos-text-footnote"
                    style={{
                      color: 'var(--macos-text-secondary)',
                      marginBottom: 'var(--macos-space-1)',
                      display: 'block',
                    }}
                  >
                    Período 1
                  </label>
                  <PeriodSelector
                    periodType={periodType}
                    onPeriodTypeChange={setPeriodType}
                    customStart={customStart}
                    customEnd={customEnd}
                    onCustomDatesChange={handleCustomDatesChange}
                    periodRange={comparisonPeriods.period1 || periodRange}
                  />
                </div>
                <div>
                  <label
                    className="macos-text-footnote"
                    style={{
                      color: 'var(--macos-text-secondary)',
                      marginBottom: 'var(--macos-space-1)',
                      display: 'block',
                    }}
                  >
                    Período 2
                  </label>
                  <p
                    className="macos-text-caption-1"
                    style={{
                      color: 'var(--macos-text-tertiary)',
                      margin: '4px 0',
                    }}
                  >
                    {comparisonPeriods.period2?.label || 'Seleccione período anterior'}
                  </p>
                </div>
              </div>
            )}

              {/* Metrics Selector - Badge Style */}
              {enableComparison && (
                <div>
                  <label
                    className="macos-text-footnote"
                    style={{
                      color: 'var(--macos-text-secondary)',
                      marginBottom: 'var(--macos-space-2)',
                      display: 'block',
                      fontWeight: 500,
                    }}
                  >
                    Selecciona las métricas a comparar:
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--macos-space-2)',
                    }}
                  >
                    {[
                      { id: 'totalSales', label: 'Total Ventas', icon: <BarChart3 size={14} /> },
                      { id: 'totalBoxes', label: 'Total Cajas', icon: <Package size={14} /> },
                      { id: 'totalPallets', label: 'Total Pallets', icon: <Package size={14} /> },
                      { id: 'averages', label: 'Promedios', icon: <TrendingUp size={14} /> },
                      { id: 'byCustomer', label: 'Por Cliente', icon: <Users size={14} /> },
                      { id: 'byType', label: 'Por Tipo', icon: <BarChart3 size={14} /> },
                      { id: 'byState', label: 'Por Estado', icon: <BarChart3 size={14} /> },
                      { id: 'temporal', label: 'Evolución', icon: <CalendarDays size={14} /> },
                    ].map((metric) => {
                      const isSelected = selectedMetrics.has(metric.id);
                      return (
                        <button
                          key={metric.id}
                          type="button"
                          onClick={() => handleMetricToggle(metric.id)}
                          aria-pressed={isSelected}
                          aria-label={`${isSelected ? 'Desactivar' : 'Activar'} comparación de ${metric.label}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: isSelected ? 'var(--macos-blue)' : 'var(--macos-gray-6)',
                            color: isSelected ? 'white' : 'var(--macos-text-primary)',
                            border: `1px solid ${isSelected ? 'var(--macos-blue)' : 'var(--macos-gray-4)'}`,
                            borderRadius: 'var(--macos-radius-medium)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'var(--macos-gray-5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'var(--macos-gray-6)';
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleMetricToggle(metric.id);
                            }
                          }}
                        >
                          {metric.icon}
                          {metric.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--macos-space-3)',
                }}
              >
              {/* Search */}
              <div>
                <label
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    display: 'block',
                  }}
                >
                  Buscar
                </label>
                <Input
                  type="text"
                  placeholder="ID o Cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* State Filter */}
              <div>
                <label
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    display: 'block',
                  }}
                >
                  Estado
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value as SaleState | 'all')}
                  style={{
                    width: '100%',
                    padding: 'var(--macos-space-2)',
                    borderRadius: 'var(--macos-radius-medium)',
                    border: '1px solid var(--macos-gray-4)',
                    backgroundColor: 'var(--macos-background)',
                    color: 'var(--macos-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="DISPATCHED">Despachada</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="PARTIALLY_RETURNED">Parcialmente Devuelta</option>
                  <option value="FULLY_RETURNED">Totalmente Devuelta</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    display: 'block',
                  }}
                >
                  Tipo
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as SaleType | 'all')}
                  style={{
                    width: '100%',
                    padding: 'var(--macos-space-2)',
                    borderRadius: 'var(--macos-radius-medium)',
                    border: '1px solid var(--macos-gray-4)',
                    backgroundColor: 'var(--macos-background)',
                    color: 'var(--macos-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="Venta">Venta</option>
                  <option value="Reposición">Reposición</option>
                  <option value="Donación">Donación</option>
                  <option value="Inutilizado">Inutilizado</option>
                  <option value="Ración">Ración</option>
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    display: 'block',
                  }}
                >
                  Cliente
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--macos-space-2)',
                    borderRadius: 'var(--macos-radius-medium)',
                    border: '1px solid var(--macos-gray-4)',
                    backgroundColor: 'var(--macos-background)',
                    color: 'var(--macos-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="all">Todos</option>
                  {customers.map((customer) => (
                    <option key={customer.customerId} value={customer.customerId}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            </div>
          )}
        </Card>
      </div>

      {/* Error State */}
      {error && errorDetails && (
        <Card
          variant="flat"
          padding="large"
          style={{
            marginBottom: 'var(--macos-space-5)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '2px solid var(--macos-red)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--macos-space-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--macos-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                className="macos-text-title-3"
                style={{
                  color: 'var(--macos-red)',
                  margin: '0 0 var(--macos-space-2) 0',
                  fontWeight: 600,
                }}
              >
                {errorDetails.title}
              </h3>
              <p
                className="macos-text-body"
                style={{
                  color: 'var(--macos-text-primary)',
                  margin: '0 0 var(--macos-space-2) 0',
                  fontWeight: 500,
                }}
              >
                {errorDetails.message}
              </p>
              {errorDetails.suggestion && (
                <div
                  style={{
                    padding: 'var(--macos-space-3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 'var(--macos-radius-small)',
                    marginBottom: 'var(--macos-space-2)',
                  }}
                >
                  <p
                    className="macos-text-caption-1"
                    style={{
                      color: 'var(--macos-text-secondary)',
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    💡 {errorDetails.suggestion}
                  </p>
                </div>
              )}
              {errorDetails.details && typeof errorDetails.details === 'object' && (
                <div
                  style={{
                    padding: 'var(--macos-space-3)',
                    backgroundColor: 'var(--macos-gray-6)',
                    borderRadius: 'var(--macos-radius-small)',
                    marginBottom: 'var(--macos-space-2)',
                  }}
                >
                  <p
                    className="macos-text-caption-1"
                    style={{
                      color: 'var(--macos-text-secondary)',
                      margin: '0 0 var(--macos-space-1) 0',
                      fontWeight: 600,
                    }}
                  >
                    Detalles adicionales:
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      color: 'var(--macos-text-tertiary)',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(errorDetails.details, null, 2)}
                  </pre>
                </div>
              )}
              {errorDetails.requestId && (
                <p
                  className="macos-text-caption-1"
                  style={{
                    color: 'var(--macos-text-tertiary)',
                    margin: '0 0 var(--macos-space-3) 0',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                >
                  ID de solicitud: {errorDetails.requestId}
                </p>
              )}
              <div style={{ display: 'flex', gap: 'var(--macos-space-2)', marginTop: 'var(--macos-space-3)' }}>
                <Button
                  variant="primary"
                  size="small"
                  onClick={fetchSales}
                >
                  Intentar de nuevo
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setError(null);
                    setErrorDetails(null);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card
          variant="flat"
          padding="large"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--macos-space-5)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              marginBottom: 'var(--macos-space-4)',
            }}
          >
            <RefreshCw
              style={{
                width: '64px',
                height: '64px',
                color: 'var(--macos-blue)',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
          <h3
            className="macos-text-title-3"
            style={{
              color: 'var(--macos-text-primary)',
              margin: '0 0 var(--macos-space-2) 0',
              fontWeight: 600,
            }}
          >
            Cargando métricas de ventas
          </h3>
          <p
            className="macos-text-body"
            style={{
              color: 'var(--macos-text-secondary)',
              margin: 0,
            }}
          >
            Por favor espera mientras obtenemos los datos...
          </p>
        </Card>
      )}

      {/* Summary Cards */}
      {!loading && filteredSales.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--macos-space-5)',
            marginBottom: 'var(--macos-space-5)',
          }}
        >
          <Card variant="flat" padding="medium" isHoverable>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
                }}
              >
                <BarChart3
                  style={{ width: '28px', height: '28px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    fontWeight: 500,
                  }}
                >
                  Total Ventas
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                    fontSize: '28px',
                  }}
                >
                  {formatNumber(summaryData.totalSales)}
                </p>
                {enableComparison && periodComparison && selectedMetrics.has('totalSales') && (
                  <div style={{ marginTop: 'var(--macos-space-2)' }}>
                    {summaryDataComparison && (
                      <p
                        className="macos-text-caption-1"
                        style={{
                          color: 'var(--macos-text-tertiary)',
                          margin: '0 0 4px 0',
                          fontSize: '11px',
                        }}
                      >
                        Anterior: {formatNumber(summaryDataComparison.totalSales)}
                      </p>
                    )}
                    {renderChangeIndicator(periodComparison.totalSales)}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium" isHoverable>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(52, 199, 89, 0.2)',
                }}
              >
                <Package
                  style={{ width: '28px', height: '28px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    fontWeight: 500,
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
                    fontSize: '28px',
                  }}
                >
                  {formatNumber(summaryData.totalBoxes)}
                </p>
                {enableComparison && periodComparison && selectedMetrics.has('totalBoxes') && (
                  <div style={{ marginTop: 'var(--macos-space-2)' }}>
                    {summaryDataComparison && (
                      <p
                        className="macos-text-caption-1"
                        style={{
                          color: 'var(--macos-text-tertiary)',
                          margin: '0 0 4px 0',
                          fontSize: '11px',
                        }}
                      >
                        Anterior: {formatNumber(summaryDataComparison.totalBoxes)}
                      </p>
                    )}
                    {renderChangeIndicator(periodComparison.totalBoxes)}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium" isHoverable>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(88, 86, 214, 0.2)',
                }}
              >
                <Package
                  style={{ width: '28px', height: '28px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    fontWeight: 500,
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
                    fontSize: '28px',
                  }}
                >
                  {formatNumber(summaryData.totalPallets)}
                </p>
                {enableComparison && periodComparison && selectedMetrics.has('totalPallets') && (
                  <div style={{ marginTop: 'var(--macos-space-2)' }}>
                    {summaryDataComparison && (
                      <p
                        className="macos-text-caption-1"
                        style={{
                          color: 'var(--macos-text-tertiary)',
                          margin: '0 0 4px 0',
                          fontSize: '11px',
                        }}
                      >
                        Anterior: {formatNumber(summaryDataComparison.totalPallets)}
                      </p>
                    )}
                    {renderChangeIndicator(periodComparison.totalPallets)}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card variant="flat" padding="medium" isHoverable>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--macos-radius-medium)',
                  backgroundColor: 'var(--macos-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 149, 0, 0.2)',
                }}
              >
                <TrendingUp
                  style={{ width: '28px', height: '28px', color: 'white' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="macos-text-footnote"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    marginBottom: 'var(--macos-space-1)',
                    fontWeight: 500,
                  }}
                >
                  Promedio Cajas/Venta
                </p>
                <p
                  className="macos-text-title-1"
                  style={{
                    color: 'var(--macos-text-primary)',
                    fontWeight: 700,
                    margin: 0,
                    fontSize: '28px',
                  }}
                >
                  {summaryData.averageBoxesPerSale.toFixed(1)}
                </p>
                {enableComparison && periodComparison && selectedMetrics.has('averages') && (
                  <div style={{ marginTop: 'var(--macos-space-2)' }}>
                    {summaryDataComparison && (
                      <p
                        className="macos-text-caption-1"
                        style={{
                          color: 'var(--macos-text-tertiary)',
                          margin: '0 0 4px 0',
                          fontSize: '11px',
                        }}
                      >
                        Anterior: {summaryDataComparison.averageBoxesPerSale.toFixed(1)}
                      </p>
                    )}
                    {renderChangeIndicator(periodComparison.averageBoxesPerSale)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Metrics Panels */}
      {!loading && filteredSales.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--macos-space-5)',
            marginBottom: 'var(--macos-space-5)',
          }}
        >
          {/* Top Customers */}
          <Card variant="default" padding="medium">
            <h3
              className="macos-text-title-3"
              style={{
                marginBottom: 'var(--macos-space-4)',
                color: 'var(--macos-text-primary)',
              }}
            >
              Top 5 Clientes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--macos-space-2)' }}>
              {summaryData.topCustomers.map((customer, index) => (
                <div
                  key={customer.customerId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--macos-space-2)',
                    backgroundColor: index % 2 === 0 ? 'var(--macos-gray-6)' : 'transparent',
                    borderRadius: 'var(--macos-radius-small)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--macos-text-primary)',
                      }}
                    >
                      #{index + 1} {customer.customerName}
                    </span>
                    <p
                      className="macos-text-caption-1"
                      style={{
                        color: 'var(--macos-text-secondary)',
                        margin: 0,
                      }}
                    >
                      {customer.totalSales} ventas
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--macos-text-primary)',
                      }}
                    >
                      {formatNumber(customer.totalBoxes)}
                    </span>
                    <p
                      className="macos-text-caption-1"
                      style={{
                        color: 'var(--macos-text-secondary)',
                        margin: 0,
                      }}
                    >
                      {customer.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sales by Type */}
          <Card variant="default" padding="medium">
            <h3
              className="macos-text-title-3"
              style={{
                marginBottom: 'var(--macos-space-4)',
                color: 'var(--macos-text-primary)',
              }}
            >
              Ventas por Tipo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--macos-space-2)' }}>
              {summaryData.salesByType.map((type, index) => (
                <div
                  key={type.type}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--macos-space-2)',
                    backgroundColor: index % 2 === 0 ? 'var(--macos-gray-6)' : 'transparent',
                    borderRadius: 'var(--macos-radius-small)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                    }}
                  >
                    {type.type}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--macos-text-primary)',
                      }}
                    >
                      {formatNumber(type.totalSales)}
                    </span>
                    <p
                      className="macos-text-caption-1"
                      style={{
                        color: 'var(--macos-text-secondary)',
                        margin: 0,
                      }}
                    >
                      {type.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sales by State */}
          <Card variant="default" padding="medium">
            <h3
              className="macos-text-title-3"
              style={{
                marginBottom: 'var(--macos-space-4)',
                color: 'var(--macos-text-primary)',
              }}
            >
              Ventas por Estado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--macos-space-2)' }}>
              {summaryData.salesByState.map((state, index) => (
                <div
                  key={state.state}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--macos-space-2)',
                    backgroundColor: index % 2 === 0 ? 'var(--macos-gray-6)' : 'transparent',
                    borderRadius: 'var(--macos-radius-small)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--macos-text-primary)',
                    }}
                  >
                    {stateLabels[state.state]}
                  </span>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-text-primary)',
                        }}
                      >
                        {formatNumber(state.totalSales)}
                      </span>
                      <p
                        className="macos-text-caption-1"
                        style={{
                          color: 'var(--macos-text-secondary)',
                          margin: 0,
                        }}
                      >
                      {state.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Comparison Tables */}
      {!loading && enableComparison && filteredSales.length > 0 && (
        <div style={{ marginBottom: 'var(--macos-space-5)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--macos-space-4)',
            }}
          >
            <h2
              className="macos-text-title-2"
              style={{
                margin: 0,
                color: 'var(--macos-text-primary)',
              }}
            >
              Comparación de Períodos
            </h2>
            <div
              style={{
                display: 'flex',
                gap: 'var(--macos-space-2)',
                padding: 'var(--macos-space-2) var(--macos-space-3)',
                backgroundColor: 'var(--macos-gray-6)',
                borderRadius: 'var(--macos-radius-medium)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--macos-blue)',
                  }}
                />
                <span className="macos-text-caption-1" style={{ color: 'var(--macos-text-secondary)' }}>
                  {comparisonPeriods.period1?.label || 'Período 1'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--macos-gray-4)',
                  }}
                />
                <span className="macos-text-caption-1" style={{ color: 'var(--macos-text-secondary)' }}>
                  {comparisonPeriods.period2?.label || 'Período 2'}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison by Customer */}
          {selectedMetrics.has('byCustomer') && (
            <Card variant="default" padding="none" style={{ marginBottom: 'var(--macos-space-5)' }}>
              <div
                style={{
                  padding: 'var(--macos-space-4)',
                  borderBottom: '1px solid var(--macos-gray-4)',
                }}
              >
                <h3
                  className="macos-text-title-3"
                  style={{
                    margin: 0,
                    color: 'var(--macos-text-primary)',
                  }}
                >
                  Comparación por Cliente
                </h3>
                <p
                  className="macos-text-caption-1"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    margin: '4px 0 0 0',
                  }}
                >
                  {comparisonPeriods.period1?.label} vs {comparisonPeriods.period2?.label}
                </p>
              </div>
              <DataTable
                columns={[
                  {
                    id: 'customer',
                    header: 'Cliente',
                    width: 200,
                    accessor: (row: ComparisonResult<AggregatedByCustomer>) => row.key,
                    sortable: true,
                  },
                  {
                    id: 'period1',
                    header: comparisonPeriods.period1?.label || 'Período 1',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByCustomer>) => row.current?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByCustomer>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-blue)',
                          padding: '2px 6px',
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.current?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'period2',
                    header: comparisonPeriods.period2?.label || 'Período 2',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByCustomer>) => row.previous?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByCustomer>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-text-secondary)',
                          padding: '2px 6px',
                          backgroundColor: 'var(--macos-gray-6)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.previous?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'difference',
                    header: 'Diferencia',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByCustomer>) => row.change.value,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByCustomer>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.value > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {formatNumber(change.value)}
                        </span>
                      );
                    },
                  },
                  {
                    id: 'percentage',
                    header: '% Cambio',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByCustomer>) => row.change.percentage,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByCustomer>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.percentage > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {change.percentage.toFixed(1)}%
                        </span>
                      );
                    },
                  },
                ]}
                data={compareAggregatedData(
                  customersData,
                  customersDataComparison,
                  'customerId',
                  'totalSales'
                )}
                getRowId={(row) => row.key}
                initialSort={{ columnId: 'difference', direction: 'desc' }}
              />
            </Card>
          )}

          {/* Comparison by Type */}
          {selectedMetrics.has('byType') && (
            <Card variant="default" padding="none" style={{ marginBottom: 'var(--macos-space-5)' }}>
              <div
                style={{
                  padding: 'var(--macos-space-4)',
                  borderBottom: '1px solid var(--macos-gray-4)',
                }}
              >
                <h3
                  className="macos-text-title-3"
                  style={{
                    margin: 0,
                    color: 'var(--macos-text-primary)',
                  }}
                >
                  Comparación por Tipo
                </h3>
                <p
                  className="macos-text-caption-1"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    margin: '4px 0 0 0',
                  }}
                >
                  {comparisonPeriods.period1?.label} vs {comparisonPeriods.period2?.label}
                </p>
              </div>
              <DataTable
                columns={[
                  {
                    id: 'type',
                    header: 'Tipo',
                    width: 150,
                    accessor: (row: ComparisonResult<AggregatedByType>) => row.key,
                    sortable: true,
                  },
                  {
                    id: 'period1',
                    header: comparisonPeriods.period1?.label || 'Período 1',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByType>) => row.current?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByType>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-blue)',
                          padding: '2px 6px',
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.current?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'period2',
                    header: comparisonPeriods.period2?.label || 'Período 2',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByType>) => row.previous?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByType>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-text-secondary)',
                          padding: '2px 6px',
                          backgroundColor: 'var(--macos-gray-6)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.previous?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'difference',
                    header: 'Diferencia',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByType>) => row.change.value,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByType>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.value > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {formatNumber(change.value)}
                        </span>
                      );
                    },
                  },
                  {
                    id: 'percentage',
                    header: '% Cambio',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByType>) => row.change.percentage,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByType>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.percentage > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {change.percentage.toFixed(1)}%
                        </span>
                      );
                    },
                  },
                ]}
                data={compareAggregatedData(typeData, typeDataComparison, 'type', 'totalSales')}
                getRowId={(row) => row.key}
                initialSort={{ columnId: 'difference', direction: 'desc' }}
              />
            </Card>
          )}

          {/* Comparison by State */}
          {selectedMetrics.has('byState') && (
            <Card variant="default" padding="none" style={{ marginBottom: 'var(--macos-space-5)' }}>
              <div
                style={{
                  padding: 'var(--macos-space-4)',
                  borderBottom: '1px solid var(--macos-gray-4)',
                }}
              >
                <h3
                  className="macos-text-title-3"
                  style={{
                    margin: 0,
                    color: 'var(--macos-text-primary)',
                  }}
                >
                  Comparación por Estado
                </h3>
                <p
                  className="macos-text-caption-1"
                  style={{
                    color: 'var(--macos-text-secondary)',
                    margin: '4px 0 0 0',
                  }}
                >
                  {comparisonPeriods.period1?.label} vs {comparisonPeriods.period2?.label}
                </p>
              </div>
              <DataTable
                columns={[
                  {
                    id: 'state',
                    header: 'Estado',
                    width: 180,
                    accessor: (row: ComparisonResult<AggregatedByState>) => row.key,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByState>) => {
                      return stateLabels[row.key as SaleState] || row.key;
                    },
                  },
                  {
                    id: 'period1',
                    header: comparisonPeriods.period1?.label || 'Período 1',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByState>) => row.current?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByState>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-blue)',
                          padding: '2px 6px',
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.current?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'period2',
                    header: comparisonPeriods.period2?.label || 'Período 2',
                    align: 'right' as const,
                    width: 140,
                    accessor: (row: ComparisonResult<AggregatedByState>) => row.previous?.totalSales || 0,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByState>) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--macos-text-secondary)',
                          padding: '2px 6px',
                          backgroundColor: 'var(--macos-gray-6)',
                          borderRadius: 'var(--macos-radius-small)',
                        }}
                      >
                        {formatNumber(row.previous?.totalSales || 0)}
                      </span>
                    ),
                  },
                  {
                    id: 'difference',
                    header: 'Diferencia',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByState>) => row.change.value,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByState>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.value > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {formatNumber(change.value)}
                        </span>
                      );
                    },
                  },
                  {
                    id: 'percentage',
                    header: '% Cambio',
                    align: 'right' as const,
                    width: 120,
                    accessor: (row: ComparisonResult<AggregatedByState>) => row.change.percentage,
                    sortable: true,
                    renderCell: (row: ComparisonResult<AggregatedByState>) => {
                      const change = row.change;
                      const color = change.isPositive ? '#10B981' : change.isNegative ? '#EF4444' : '#6B7280';
                      const bgColor = change.isPositive
                        ? 'rgba(16, 185, 129, 0.1)'
                        : change.isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)';
                      const sign = change.percentage > 0 ? '+' : '';
                      return (
                        <span
                          style={{
                            color,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: bgColor,
                            borderRadius: 'var(--macos-radius-small)',
                            display: 'inline-block',
                          }}
                        >
                          {sign}
                          {change.percentage.toFixed(1)}%
                        </span>
                      );
                    },
                  },
                ]}
                data={compareAggregatedData(stateData, stateDataComparison, 'state', 'totalSales')}
                getRowId={(row) => row.key}
                initialSort={{ columnId: 'difference', direction: 'desc' }}
              />
            </Card>
          )}
        </div>
      )}

      {/* Sales Table */}
      {!loading && filteredSales.length > 0 && (
        <Card variant="default" padding="none">
          <div
            style={{
              padding: 'var(--macos-space-4)',
              borderBottom: '1px solid var(--macos-gray-4)',
            }}
          >
            <h3
              className="macos-text-title-3"
              style={{
                margin: 0,
                color: 'var(--macos-text-primary)',
              }}
            >
              Listado de Ventas ({formatNumber(filteredSales.length)})
            </h3>
          </div>
          <DataTable
            columns={salesColumns}
            data={filteredSales}
            getRowId={(row) => row.saleId}
            initialSort={{ columnId: 'createdAt', direction: 'desc' }}
          />
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredSales.length === 0 && (
        <Card
          variant="flat"
          padding="large"
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--macos-gray-6)',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: 'var(--macos-gray-5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--macos-space-5)',
            }}
          >
            <BarChart3
              style={{
                width: '48px',
                height: '48px',
                color: 'var(--macos-text-tertiary)',
              }}
            />
          </div>
          <h3
            className="macos-text-title-2"
            style={{
              color: 'var(--macos-text-primary)',
              margin: '0 0 var(--macos-space-2) 0',
              fontWeight: 600,
            }}
          >
            No se encontraron ventas
          </h3>
          <p
            className="macos-text-body"
            style={{
              color: 'var(--macos-text-secondary)',
              marginBottom: 'var(--macos-space-5)',
              maxWidth: '400px',
              margin: '0 auto var(--macos-space-5)',
            }}
          >
            No hay ventas que coincidan con los filtros seleccionados. Intenta ajustar el período, estado, tipo o cliente.
          </p>
          <div style={{ display: 'flex', gap: 'var(--macos-space-2)', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => {
              setSelectedState('all');
              setSelectedType('all');
              setSelectedCustomerId('all');
              setSearchTerm('');
            }}>
              Limpiar filtros
            </Button>
            <Button variant="primary" onClick={fetchSales}>
              Actualizar datos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesMetrics;

