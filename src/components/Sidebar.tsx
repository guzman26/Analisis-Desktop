import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Settings,
  ClipboardList,
  CheckSquare,
  Box,
  Tag,
  FileText,
  UserPlus,
  Pin,
  CircleCheck,
  Search,
  AlertTriangle,
  Truck,
  BarChart3,
} from 'lucide-react';
import '../styles/designSystem.css';

interface SidebarItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const sidebarItems: SidebarItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Packing',
    icon: <Package className="w-5 h-5" />,
    children: [
      {
        path: '/packing/openPallets',
        label: 'Pallets Abiertos',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        path: '/packing/closedPallets',
        label: 'Pallets Cerrados',
        icon: <CheckSquare className="w-4 h-4" />,
      },
      {
        path: '/packing/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: <Box className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Tránsito',
    icon: <Truck className="w-5 h-5" />,
    children: [
      {
        path: '/transito/pallets',
        label: 'Pallets en Tránsito',
        icon: <Tag className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Bodega',
    icon: <Warehouse className="w-5 h-5" />,
    children: [
      {
        path: '/bodega/pallets',
        label: 'Pallets en Bodega',
        icon: <Tag className="w-4 h-4" />,
      },
      {
        path: '/bodega/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: <Box className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Ventas',
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      {
        path: '/sales/new',
        label: 'Nueva Venta',
        icon: <FileText className="w-4 h-4" />,
      },
      {
        path: '/sales/customers',
        label: 'Clientes',
        icon: <UserPlus className="w-4 h-4" />,
      },
      {
        path: '/sales/createCustomer',
        label: 'Crear Cliente',
        icon: <UserPlus className="w-4 h-4" />,
      },
      {
        path: '/sales/orders',
        label: 'Preventas',
        icon: <Pin className="w-4 h-4" />,
      },
      {
        path: '/sales/confirmed',
        label: 'Ventas Confirmadas',
        icon: <CircleCheck className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Administracion',
    icon: <Settings className="w-5 h-5" />,
    children: [
      {
        path: '/admin/issues',
        label: 'Problemas',
        icon: <Search className="w-4 h-4" />,
      },
      {
        label: 'Métricas',
        icon: <BarChart3 className="w-4 h-4" />,
        children: [
          {
            path: '/admin/metrics',
            label: 'Métricas Producción',
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            path: '/admin/metrics/sales',
            label: 'Métricas Ventas',
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ],
      },
      {
        path: '/admin/danger-zone',
        label: 'Zona de Peligro',
        icon: <AlertTriangle className="w-4 h-4" />,
      },
    ],
  },
];

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle?.(newCollapsedState);
  };

  const toggleSubfolder = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  useEffect(() => {
    onToggle?.(isCollapsed);
  }, []);

  const renderMenuItem = (item: SidebarItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <li key={item.label} style={{ marginBottom: 'var(--macos-space-1)' }}>
          <button
            className="macos-interactive"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: 'var(--macos-space-3)',
              padding: 'var(--macos-space-3)',
              color: 'var(--macos-text-primary)',
              borderRadius: 'var(--macos-radius-medium)',
              transition:
                'all var(--macos-duration-fast) var(--macos-ease-out)',
            }}
            onClick={() => toggleSubfolder(item.label)}
            title={isCollapsed ? item.label : ''}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--macos-space-3)',
              }}
            >
              <span style={{ color: 'var(--macos-text-secondary)' }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span
                  className="macos-text-subheadline"
                  style={{ fontWeight: 500 }}
                >
                  {item.label}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div
                style={{
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition:
                    'transform var(--macos-duration-fast) var(--macos-ease-out)',
                }}
              >
                <ChevronDown
                  style={{
                    width: '16px',
                    height: '16px',
                    color: 'var(--macos-text-secondary)',
                  }}
                />
              </div>
            )}
          </button>
          {isExpanded && !isCollapsed && (
            <ul
              className="macos-animate-slide-in"
              style={{
                marginLeft: 'var(--macos-space-3)',
                marginTop: 'var(--macos-space-1)',
                listStyle: 'none',
                padding: 0,
              }}
            >
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path} style={{ marginBottom: 'var(--macos-space-1)' }}>
        <NavLink
          to={item.path!}
          className={({ isActive }) => {
            return `macos-interactive ${isActive ? 'active-nav-link' : 'inactive-nav-link'}`;
          }}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--macos-space-3)',
            padding: 'var(--macos-space-3)',
            borderRadius: 'var(--macos-radius-medium)',
            textDecoration: 'none',
            transition: 'all var(--macos-duration-fast) var(--macos-ease-out)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            paddingLeft:
              depth > 0
                ? 'calc(var(--macos-space-8) + var(--macos-space-3))'
                : 'var(--macos-space-3)',
            backgroundColor: isActive ? 'var(--macos-blue)' : 'transparent',
            color: isActive
              ? 'var(--macos-text-on-color)'
              : 'var(--macos-text-primary)',
          })}
          title={isCollapsed ? item.label : ''}
        >
          <span style={{ flexShrink: 0 }}>{item.icon}</span>
          {!isCollapsed && (
            <span
              className="macos-text-subheadline"
              style={{ fontWeight: 500 }}
            >
              {item.label}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: isCollapsed
          ? 'var(--macos-width-sidebar-collapsed)'
          : 'var(--macos-width-sidebar)',
        background: 'var(--macos-sidebar-bg)',
        backdropFilter: 'var(--macos-backdrop-blur-light)',
        WebkitBackdropFilter: 'var(--macos-backdrop-blur-light)',
        borderRight: '1px solid var(--macos-border-primary)',
        zIndex: 'var(--macos-z-fixed)',
        transition: 'width var(--macos-duration-normal) var(--macos-ease-out)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--macos-space-5)',
          borderBottom: '1px solid var(--macos-border-primary)',
          minHeight: 'var(--macos-height-titlebar)',
        }}
      >
        {!isCollapsed && (
          <h2
            className="macos-text-headline"
            style={{ margin: 0, color: 'var(--macos-text-primary)' }}
          >
            Análisis Desktop
          </h2>
        )}
        <button
          className="macos-focusable macos-interactive"
          style={{
            padding: 'var(--macos-space-2)',
            borderRadius: 'var(--macos-radius-medium)',
            color: 'var(--macos-text-secondary)',
            margin: isCollapsed ? '0 auto' : '0',
          }}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          ) : (
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--macos-space-3)',
        }}
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sidebarItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>

    </aside>
  );
};

export default Sidebar;
