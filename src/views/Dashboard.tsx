import { Link } from 'react-router-dom';
import { Card } from '@/components/design-system';
import { Package, Warehouse, ShoppingCart, Settings, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const quickActions = [
    {
      title: 'Packing',
      description: 'Gestiona pallets y cajas',
      icon: <Package className="w-6 h-6" />,
      link: '/packing/openPallets',
      color: 'bg-blue-500',
    },
    {
      title: 'Bodega',
      description: 'Control de inventario',
      icon: <Warehouse className="w-6 h-6" />,
      link: '/bodega/pallets',
      color: 'bg-green-500',
    },
    {
      title: 'Ventas',
      description: 'Nueva venta o pedido',
      icon: <ShoppingCart className="w-6 h-6" />,
      link: '/sales/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Administración',
      description: 'Configuración y problemas',
      icon: <Settings className="w-6 h-6" />,
      link: '/admin/issues',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-macos-text mb-2">
          Bienvenidos a Lomas Altas
        </h1>
        <p className="text-macos-text-secondary">
          Sistema de gestión de inventario y ventas
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link}>
            <Card
              isPressable
              isHoverable
              className="h-full"
            >
              <div className="flex flex-col items-start space-y-4">
                <div className={`p-3 rounded-macos ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-macos-text mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-macos-text-secondary">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-macos-text-secondary" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="flat">
          <div className="text-center">
            <p className="text-sm text-macos-text-secondary mb-1">Pallets Abiertos</p>
            <p className="text-2xl font-bold text-macos-accent">12</p>
          </div>
        </Card>
        <Card variant="flat">
          <div className="text-center">
            <p className="text-sm text-macos-text-secondary mb-1">Ventas del Día</p>
            <p className="text-2xl font-bold text-macos-success">8</p>
          </div>
        </Card>
        <Card variant="flat">
          <div className="text-center">
            <p className="text-sm text-macos-text-secondary mb-1">Cajas sin Pallet</p>
            <p className="text-2xl font-bold text-macos-warning">24</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <h2 className="text-xl font-semibold text-macos-text mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-macos-border last:border-0">
            <div>
              <p className="text-sm font-medium text-macos-text">Pallet #P001 cerrado</p>
              <p className="text-xs text-macos-text-secondary">Hace 10 minutos</p>
            </div>
            <span className="text-xs text-macos-success">Completado</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-macos-border last:border-0">
            <div>
              <p className="text-sm font-medium text-macos-text">Nueva venta registrada</p>
              <p className="text-xs text-macos-text-secondary">Hace 25 minutos</p>
            </div>
            <span className="text-xs text-macos-accent">Pendiente</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-macos-border last:border-0">
            <div>
              <p className="text-sm font-medium text-macos-text">15 cajas agregadas a bodega</p>
              <p className="text-xs text-macos-text-secondary">Hace 1 hora</p>
            </div>
            <span className="text-xs text-macos-success">Procesado</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
