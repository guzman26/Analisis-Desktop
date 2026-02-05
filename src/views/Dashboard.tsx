import { Link } from 'react-router-dom';
import { Card } from '@/components/design-system';
import {
  Package,
  Warehouse,
  ShoppingCart,
  Settings,
  ArrowRight,
} from 'lucide-react';
import ModalDemo from '@/components/examples/ModalDemo';

const Dashboard = () => {
  const quickActions = [
    {
      title: 'Packing',
      description: 'Gestiona pallets y cajas',
      icon: <Package style={{ width: '24px', height: '24px' }} />,
      link: '/packing/openPallets',
      color: 'var(--blue-500)',
    },
    {
      title: 'Bodega',
      description: 'Control de inventario',
      icon: <Warehouse style={{ width: '24px', height: '24px' }} />,
      link: '/bodega/pallets',
      color: 'var(--green-500)',
    },
    {
      title: 'Ventas',
      description: 'Nueva venta o pedido',
      icon: <ShoppingCart style={{ width: '24px', height: '24px' }} />,
      link: '/sales/new',
      color: 'var(--purple-500)',
    },
    {
      title: 'Administración',
      description: 'Configuración y problemas',
      icon: <Settings style={{ width: '24px', height: '24px' }} />,
      link: '/admin/issues',
      color: 'var(--orange-500)',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--8)' }}>
        <h1
          className="text-3xl font-bold"
          style={{
            marginBottom: 'var(--1)',
            color: 'var(--text-foreground)',
          }}
        >
          Bienvenidos a Lomas Altas
        </h1>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted-foreground)' }}
        >
          Sistema de gestión de inventario y ventas
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div
        className="grid gap-4"
        style={{ marginBottom: 'var(--8)' }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            style={{ textDecoration: 'none' }}
          >
            <Card isPressable isHoverable style={{ height: '100%' }}>
              <div className="flex flex-col gap-4">
                <div
                  style={{
                    padding: 'var(--3)',
                    borderRadius: '0.75rem',
                    backgroundColor: action.color,
                    color: 'var(--text-white)',
                    width: 'fit-content',
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    className="text-base font-semibold"
                    style={{
                      marginBottom: 'var(--0.5)',
                      color: 'var(--text-foreground)',
                    }}
                  >
                    {action.title}
                  </h3>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-muted-foreground)' }}
                  >
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'var(--text-muted-foreground)',
                    alignSelf: 'flex-end',
                  }}
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--4)',
          marginBottom: 'var(--8)',
        }}
      >
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
              }}
            >
              Pallets Abiertos
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color: 'var(--blue-500)',
                fontWeight: 700,
              }}
            >
              12
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
              }}
            >
              Ventas del Día
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color: 'var(--green-500)',
                fontWeight: 700,
              }}
            >
              8
            </p>
          </div>
        </Card>
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="text-sm"
              style={{
                color: 'var(--text-muted-foreground)',
                marginBottom: 'var(--0.5)',
              }}
            >
              Cajas sin Pallet
            </p>
            <p
              className="text-2xl font-semibold"
              style={{
                color: 'var(--orange-500)',
                fontWeight: 700,
              }}
            >
              24
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2
          className="text-xl font-semibold"
          style={{
            marginBottom: 'var(--4)',
            color: 'var(--text-foreground)',
          }}
        >
          Actividad Reciente
        </h2>
        <div className="flex flex-col gap-4">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--2)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  fontWeight: 500,
                  color: 'var(--text-foreground)',
                  marginBottom: 'var(--0.5)',
                }}
              >
                Pallet #P001 cerrado
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted-foreground)' }}
              >
                Hace 10 minutos
              </p>
            </div>
            <span
              className="text-xs"
              style={{
                color: 'var(--green-500)',
                fontWeight: 500,
              }}
            >
              Completado
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--2)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  fontWeight: 500,
                  color: 'var(--text-foreground)',
                  marginBottom: 'var(--0.5)',
                }}
              >
                Nueva venta registrada
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted-foreground)' }}
              >
                Hace 25 minutos
              </p>
            </div>
            <span
              className="text-xs"
              style={{
                color: 'var(--blue-500)',
                fontWeight: 500,
              }}
            >
              Pendiente
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  fontWeight: 500,
                  color: 'var(--text-foreground)',
                  marginBottom: 'var(--0.5)',
                }}
              >
                15 cajas agregadas a bodega
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted-foreground)' }}
              >
                Hace 1 hora
              </p>
            </div>
            <span
              className="text-xs"
              style={{
                color: 'var(--green-500)',
                fontWeight: 500,
              }}
            >
              Procesado
            </span>
          </div>
        </div>
      </Card>
      <ModalDemo />
    </div>
  );
};

export default Dashboard;
