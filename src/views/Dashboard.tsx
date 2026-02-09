import { Link } from 'react-router-dom';
import {
  ArrowRight,
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

const Dashboard = () => {
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

  const recentActivity = [
    {
      title: 'Pallet #P001 cerrado',
      time: 'Hace 10 minutos',
      status: 'Completado',
    },
    {
      title: 'Nueva venta registrada',
      time: 'Hace 25 minutos',
      status: 'Pendiente',
    },
    {
      title: '15 cajas agregadas a bodega',
      time: 'Hace 1 hora',
      status: 'Procesado',
    },
  ];

  return (
    <div className="v2-page animate-fade-in">
      <PageHeaderV2
        title="Bienvenido a Lomas Altas"
        description="Sistema de gestión operacional para inventario, packing y ventas."
      />

      <section className="v2-grid-stats">
        <MetricCardV2 label="Pallets abiertos" value="12" />
        <MetricCardV2 label="Ventas del día" value="8" />
        <MetricCardV2 label="Cajas sin pallet" value="24" />
      </section>

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
