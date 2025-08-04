import { Link } from 'react-router-dom';
import { Card } from '@/components/design-system';
import {
  Package,
  Warehouse,
  ShoppingCart,
  Settings,
  ArrowRight,
} from 'lucide-react';
import '../styles/designSystem.css';
import ModalDemo from '@/components/examples/ModalDemo';

const Dashboard = () => {
  const quickActions = [
    {
      title: 'Packing',
      description: 'Gestiona pallets y cajas',
      icon: <Package style={{ width: '24px', height: '24px' }} />,
      link: '/packing/openPallets',
      color: 'var(--macos-blue)',
    },
    {
      title: 'Bodega',
      description: 'Control de inventario',
      icon: <Warehouse style={{ width: '24px', height: '24px' }} />,
      link: '/bodega/pallets',
      color: 'var(--macos-green)',
    },
    {
      title: 'Ventas',
      description: 'Nueva venta o pedido',
      icon: <ShoppingCart style={{ width: '24px', height: '24px' }} />,
      link: '/sales/new',
      color: 'var(--macos-purple)',
    },
    {
      title: 'Administración',
      description: 'Configuración y problemas',
      icon: <Settings style={{ width: '24px', height: '24px' }} />,
      link: '/admin/issues',
      color: 'var(--macos-orange)',
    },
  ];

  return (
    <div className="macos-animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--macos-space-8)' }}>
        <h1
          className="macos-text-large-title"
          style={{
            marginBottom: 'var(--macos-space-2)',
            color: 'var(--macos-text-primary)',
          }}
        >
          Bienvenidos a Lomas Altas
        </h1>
        <p
          className="macos-text-body"
          style={{ color: 'var(--macos-text-secondary)' }}
        >
          Sistema de gestión de inventario y ventas
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div
        className="macos-grid"
        style={{ marginBottom: 'var(--macos-space-8)' }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            style={{ textDecoration: 'none' }}
          >
            <Card isPressable isHoverable style={{ height: '100%' }}>
              <div className="macos-stack">
                <div
                  style={{
                    padding: 'var(--macos-space-4)',
                    borderRadius: 'var(--macos-radius-large)',
                    backgroundColor: action.color,
                    color: 'var(--macos-text-on-color)',
                    width: 'fit-content',
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    className="macos-text-headline"
                    style={{
                      marginBottom: 'var(--macos-space-1)',
                      color: 'var(--macos-text-primary)',
                    }}
                  >
                    {action.title}
                  </h3>
                  <p
                    className="macos-text-subheadline"
                    style={{ color: 'var(--macos-text-secondary)' }}
                  >
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'var(--macos-text-secondary)',
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
          gap: 'var(--macos-space-5)',
          marginBottom: 'var(--macos-space-8)',
        }}
      >
        <Card variant="flat">
          <div style={{ textAlign: 'center' }}>
            <p
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Pallets Abiertos
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-blue)',
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
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Ventas del Día
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-green)',
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
              className="macos-text-footnote"
              style={{
                color: 'var(--macos-text-secondary)',
                marginBottom: 'var(--macos-space-1)',
              }}
            >
              Cajas sin Pallet
            </p>
            <p
              className="macos-text-title-1"
              style={{
                color: 'var(--macos-orange)',
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
          className="macos-text-title-2"
          style={{
            marginBottom: 'var(--macos-space-5)',
            color: 'var(--macos-text-primary)',
          }}
        >
          Actividad Reciente
        </h2>
        <div className="macos-stack">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--macos-space-3)',
              borderBottom: '1px solid var(--macos-separator)',
            }}
          >
            <div>
              <p
                className="macos-text-subheadline"
                style={{
                  fontWeight: 500,
                  color: 'var(--macos-text-primary)',
                  marginBottom: 'var(--macos-space-1)',
                }}
              >
                Pallet #P001 cerrado
              </p>
              <p
                className="macos-text-caption-1"
                style={{ color: 'var(--macos-text-secondary)' }}
              >
                Hace 10 minutos
              </p>
            </div>
            <span
              className="macos-text-caption-1"
              style={{
                color: 'var(--macos-green)',
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
              paddingBottom: 'var(--macos-space-3)',
              borderBottom: '1px solid var(--macos-separator)',
            }}
          >
            <div>
              <p
                className="macos-text-subheadline"
                style={{
                  fontWeight: 500,
                  color: 'var(--macos-text-primary)',
                  marginBottom: 'var(--macos-space-1)',
                }}
              >
                Nueva venta registrada
              </p>
              <p
                className="macos-text-caption-1"
                style={{ color: 'var(--macos-text-secondary)' }}
              >
                Hace 25 minutos
              </p>
            </div>
            <span
              className="macos-text-caption-1"
              style={{
                color: 'var(--macos-blue)',
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
                className="macos-text-subheadline"
                style={{
                  fontWeight: 500,
                  color: 'var(--macos-text-primary)',
                  marginBottom: 'var(--macos-space-1)',
                }}
              >
                15 cajas agregadas a bodega
              </p>
              <p
                className="macos-text-caption-1"
                style={{ color: 'var(--macos-text-secondary)' }}
              >
                Hace 1 hora
              </p>
            </div>
            <span
              className="macos-text-caption-1"
              style={{
                color: 'var(--macos-green)',
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
