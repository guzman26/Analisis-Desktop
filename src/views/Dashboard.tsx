import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  Package,
  Settings,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  EmptyStateV2,
  MetricCardV2,
  PageHeaderV2,
  SectionCardV2,
} from '@/components/app-v2';
import {
  getClosedPallets,
  getDispatches,
  getIssues,
  getMetrics,
  getOpenPallets,
  getSalesOrders,
} from '@/api/endpoints';
import { calculatePeriodChange } from '@/utils/periodComparison';
import { buildStoryCards } from '@/utils/productionNarratives';
import { StoryCard } from '@/components/story/StoryCard';

interface DashboardKpi {
  label: string;
  value: number;
  previous: number;
}

interface DashboardMetrics {
  producedBoxes: DashboardKpi;
  closedPallets: DashboardKpi;
  bodegaPallets: DashboardKpi;
  confirmedSales: DashboardKpi;
  completedDispatches: DashboardKpi;
  activeAlerts: DashboardKpi;
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function sumMetricValue(metrics: Array<{ data: any }>, key: string): number {
  return metrics.reduce((acc, metric) => {
    const value = metric?.data?.[key];
    const numeric = typeof value === 'number' ? value : Number(value || 0);
    return acc + (Number.isNaN(numeric) ? 0 : numeric);
  }, 0);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value);
}

function formatTrend(value: number, previous: number): string {
  const change = calculatePeriodChange(value, previous);
  if (change.isNeutral) return 'Sin cambios vs periodo anterior';
  const direction = change.isPositive ? 'Sube' : 'Baja';
  return `${direction} ${Math.abs(change.percentage).toFixed(1)}% vs periodo anterior`;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    producedBoxes: { label: 'Cajas producidas', value: 0, previous: 0 },
    closedPallets: { label: 'Pallets cerrados', value: 0, previous: 0 },
    bodegaPallets: { label: 'Pallets en bodega', value: 0, previous: 0 },
    confirmedSales: { label: 'Ventas confirmadas', value: 0, previous: 0 },
    completedDispatches: { label: 'Despachos aprobados', value: 0, previous: 0 },
    activeAlerts: { label: 'Alertas activas', value: 0, previous: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{ title: string; time: string; status: string }>
  >([]);

  const quickActions = [
    {
      title: 'Packing',
      description: 'Gestiona pallets y cajas.',
      icon: Package,
      link: '/packing/openPallets',
      badge: 'Operación',
    },
    {
      title: 'Bodega',
      description: 'Controla inventario y movimientos.',
      icon: Warehouse,
      link: '/bodega/pallets',
      badge: 'Inventario',
    },
    {
      title: 'Ventas',
      description: 'Crea ventas y administra clientes.',
      icon: ShoppingCart,
      link: '/sales/new',
      badge: 'Comercial',
    },
    {
      title: 'Administración',
      description: 'Acceso a configuración y soporte.',
      icon: Settings,
      link: '/admin/issues',
      badge: 'Backoffice',
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const now = new Date();
        const currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 6);
        currentStart.setHours(0, 0, 0, 0);

        const previousStart = new Date(currentStart);
        previousStart.setDate(currentStart.getDate() - 7);
        previousStart.setHours(0, 0, 0, 0);

        const previousEnd = new Date(currentStart);
        previousEnd.setDate(currentStart.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);

        const [production, salesRes, dispatchesRes, openPallets, bodegaRes, issuesRes] =
          await Promise.all([
            getMetrics({
              metricType: 'PRODUCTION_DAILY',
              startDate: toDateString(previousStart),
              endDate: toDateString(now),
              limit: 30,
            }),
            getSalesOrders({ limit: 1000 }),
            getDispatches({ limit: 1000 }),
            getOpenPallets(),
            getClosedPallets({ ubicacion: 'BODEGA', limit: 500 }),
            getIssues({ limit: 200 }),
          ]);

        const productionMetrics = production.metrics || [];
        const currentProduction = productionMetrics.filter((metric) => {
          const date = new Date(metric.date || metric.dateKey);
          return date >= currentStart && date <= now;
        });
        const previousProduction = productionMetrics.filter((metric) => {
          const date = new Date(metric.date || metric.dateKey);
          return date >= previousStart && date <= previousEnd;
        });

        const sales = salesRes.items || [];
        const currentSales = sales.filter((sale) => {
          if (sale.state !== 'CONFIRMED' || !sale.createdAt) return false;
          const date = new Date(sale.createdAt);
          return date >= currentStart && date <= now;
        });
        const previousSales = sales.filter((sale) => {
          if (sale.state !== 'CONFIRMED' || !sale.createdAt) return false;
          const date = new Date(sale.createdAt);
          return date >= previousStart && date <= previousEnd;
        });

        const dispatches = dispatchesRes.items || [];
        const currentDispatches = dispatches.filter((dispatch) => {
          if (dispatch.estado !== 'APPROVED') return false;
          const date = new Date(dispatch.approvedAt || dispatch.createdAt);
          return date >= currentStart && date <= now;
        });
        const previousDispatches = dispatches.filter((dispatch) => {
          if (dispatch.estado !== 'APPROVED') return false;
          const date = new Date(dispatch.approvedAt || dispatch.createdAt);
          return date >= previousStart && date <= previousEnd;
        });

        const activeIssues = (issuesRes.items || []).filter(
          (issue) => issue.status !== 'CLOSED' && issue.status !== 'RESOLVED'
        );
        const previousIssues = (issuesRes.items || []).filter((issue) => {
          const date = new Date(issue.createdAt);
          return (
            date >= previousStart &&
            date <= previousEnd &&
            issue.status !== 'CLOSED' &&
            issue.status !== 'RESOLVED'
          );
        });

        setMetrics({
          producedBoxes: {
            label: 'Cajas producidas',
            value: sumMetricValue(currentProduction, 'totalBoxes'),
            previous: sumMetricValue(previousProduction, 'totalBoxes'),
          },
          closedPallets: {
            label: 'Pallets cerrados',
            value: sumMetricValue(currentProduction, 'totalPallets'),
            previous: sumMetricValue(previousProduction, 'totalPallets'),
          },
          bodegaPallets: {
            label: 'Pallets en bodega',
            value: bodegaRes.items?.length || 0,
            previous: bodegaRes.items?.length || 0,
          },
          confirmedSales: {
            label: 'Ventas confirmadas',
            value: currentSales.length,
            previous: previousSales.length,
          },
          completedDispatches: {
            label: 'Despachos aprobados',
            value: currentDispatches.length,
            previous: previousDispatches.length,
          },
          activeAlerts: {
            label: 'Alertas activas',
            value: activeIssues.length,
            previous: previousIssues.length,
          },
        });

        const activityRows = [
          ...sales.slice(0, 4).map((sale) => ({
            title: `Venta ${sale.saleNumber || sale.saleId.slice(0, 8)} ${sale.state || 'DRAFT'}`,
            time: new Date(sale.createdAt).toLocaleString('es-ES'),
            timestamp: new Date(sale.createdAt).getTime(),
            status: 'Comercial',
          })),
          ...dispatches.slice(0, 4).map((dispatch) => ({
            title: `Despacho ${dispatch.folio} ${dispatch.estado}`,
            time: new Date(dispatch.createdAt).toLocaleString('es-ES'),
            timestamp: new Date(dispatch.createdAt).getTime(),
            status: 'Despacho',
          })),
          ...openPallets.slice(0, 4).map((pallet) => ({
            title: `Pallet abierto ${pallet.codigo}`,
            time: new Date(pallet.fechaCreacion).toLocaleString('es-ES'),
            timestamp: new Date(pallet.fechaCreacion).getTime(),
            status: 'Packing',
          })),
        ]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6)
          .map(({ title, time, status }) => ({ title, time, status }));
        setRecentActivity(activityRows);
      } catch (error) {
        setFetchError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las métricas del dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const kpiCards = useMemo(() => {
    return [
      metrics.producedBoxes,
      metrics.closedPallets,
      metrics.bodegaPallets,
      metrics.confirmedSales,
      metrics.completedDispatches,
      metrics.activeAlerts,
    ];
  }, [metrics]);

  const storyCards = useMemo(() => {
    return buildStoryCards([
      {
        title: 'Produccion',
        value: `Se produjeron ${formatCompactNumber(metrics.producedBoxes.value)} cajas`,
        trend: calculatePeriodChange(
          metrics.producedBoxes.value,
          metrics.producedBoxes.previous
        ),
      },
      {
        title: 'Inventario',
        value: `Hay ${formatCompactNumber(metrics.bodegaPallets.value)} pallets disponibles en bodega`,
      },
      {
        title: 'Comercial',
        value: `Se confirmaron ${formatCompactNumber(metrics.confirmedSales.value)} ventas`,
        trend: calculatePeriodChange(
          metrics.confirmedSales.value,
          metrics.confirmedSales.previous
        ),
      },
      {
        title: 'Despacho',
        value: `Se aprobaron ${formatCompactNumber(metrics.completedDispatches.value)} despachos`,
        trend: calculatePeriodChange(
          metrics.completedDispatches.value,
          metrics.completedDispatches.previous
        ),
      },
    ]);
  }, [metrics]);

  return (
    <div className="v2-page animate-fade-in">
      <PageHeaderV2
        title="Bienvenido a Lomas Altas"
        description="Sistema de gestión operacional para inventario, packing y ventas."
      />

      {fetchError ? (
        <SectionCardV2 title="Estado de carga">
          <p className="text-sm text-destructive">{fetchError}</p>
        </SectionCardV2>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((kpi) => (
          <MetricCardV2
            key={kpi.label}
            label={kpi.label}
            value={formatCompactNumber(kpi.value)}
            hint={formatTrend(kpi.value, kpi.previous)}
          />
        ))}
      </section>

      <SectionCardV2
        title="Historia productiva de la semana"
        subtitle="Lectura rapida del flujo operativo y comercial"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando narrativa...
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {storyCards.map((story) => (
              <StoryCard
                key={story.key}
                title={story.title}
                body={story.body}
                tone={story.tone}
              />
            ))}
          </div>
        )}
      </SectionCardV2>

      <SectionCardV2
        title="Acciones rápidas"
        subtitle="Atajos para los flujos más frecuentes del equipo"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.link}
                className="group rounded-xl border bg-card p-4 transition-all duration-150 hover:-translate-y-px hover:border-foreground/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <Badge
                  variant="secondary"
                  className="mt-3 rounded-full px-2 py-0.5 text-[11px]"
                >
                  {action.badge}
                </Badge>
              </Link>
            );
          })}
        </div>
      </SectionCardV2>

      <SectionCardV2 title="Actividad reciente">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando actividad...
          </div>
        ) : null}
        {recentActivity.length === 0 ? (
          <EmptyStateV2
            title="Sin actividad reciente"
            description="Cuando haya movimientos de pallets, ventas o despachos aparecerán aquí."
          />
        ) : (
          <div className="divide-y rounded-lg border">
            {recentActivity.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span className="v2-chip">{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCardV2>
    </div>
  );
};

export default Dashboard;
