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
import { Button } from '@/components/design-system';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Packing',
    icon: <Package className="h-5 w-5" />,
    children: [
      {
        path: '/packing/openPallets',
        label: 'Pallets Abiertos',
        icon: <ClipboardList className="h-4 w-4" />,
      },
      {
        path: '/packing/closedPallets',
        label: 'Pallets Cerrados',
        icon: <CheckSquare className="h-4 w-4" />,
      },
      {
        path: '/packing/carts',
        label: 'Carros',
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        path: '/packing/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: <Box className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Tránsito',
    icon: <Truck className="h-5 w-5" />,
    children: [
      {
        path: '/transito/pallets',
        label: 'Pallets en Tránsito',
        icon: <Tag className="h-4 w-4" />,
      },
      {
        path: '/transito/carts',
        label: 'Carros en Tránsito',
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        path: '/dispatch/list',
        label: 'Listar Despachos',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        path: '/dispatch/create',
        label: 'Crear Despacho',
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Bodega',
    icon: <Warehouse className="h-5 w-5" />,
    children: [
      {
        path: '/bodega/pallets',
        label: 'Pallets en Bodega',
        icon: <Tag className="h-4 w-4" />,
      },
      {
        path: '/bodega/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: <Box className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Ventas',
    icon: <ShoppingCart className="h-5 w-5" />,
    children: [
      {
        path: '/sales/new',
        label: 'Nueva Venta',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        path: '/sales/customers',
        label: 'Clientes',
        icon: <UserPlus className="h-4 w-4" />,
      },
      {
        path: '/sales/createCustomer',
        label: 'Crear Cliente',
        icon: <UserPlus className="h-4 w-4" />,
      },
      {
        path: '/sales/orders',
        label: 'Preventas',
        icon: <Pin className="h-4 w-4" />,
      },
      {
        path: '/sales/confirmed',
        label: 'Ventas Confirmadas',
        icon: <CircleCheck className="h-4 w-4" />,
      },
    ],
  },
  {
    label: 'Administracion',
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        path: '/admin/issues',
        label: 'Problemas',
        icon: <Search className="h-4 w-4" />,
      },
      {
        label: 'Métricas',
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
          {
            path: '/admin/metrics',
            label: 'Métricas Producción',
            icon: <BarChart3 className="h-4 w-4" />,
          },
          {
            path: '/admin/metrics/sales',
            label: 'Métricas Ventas',
            icon: <BarChart3 className="h-4 w-4" />,
          },
        ],
      },
      {
        path: '/admin/danger-zone',
        label: 'Zona de Peligro',
        icon: <AlertTriangle className="h-4 w-4" />,
      },
    ],
  },
];

const Sidebar = ({
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);
  const collapsed = isMobile ? false : isCollapsed;

  const toggleSidebar = () => {
    if (isMobile) {
      onMobileClose?.();
      return;
    }
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
    if (isMobile) return;
    onToggle?.(isCollapsed);
  }, [isCollapsed, isMobile, onToggle]);

  const renderMenuItem = (item: SidebarItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <li key={item.label} className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-between gap-2 rounded-md px-2 py-2 text-sm font-medium',
              collapsed && 'justify-center'
            )}
            onClick={() => toggleSubfolder(item.label)}
            title={collapsed ? item.label : ''}
          >
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </span>
            {!collapsed && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isExpanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            )}
          </Button>
          {!collapsed && isExpanded && (
            <ul className="space-y-1 pl-4">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path!}
          onClick={() => {
            if (isMobile) onMobileClose?.();
          }}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              depth > 0 ? 'pl-6' : 'pl-2',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted/60',
              collapsed && 'justify-center'
            )
          }
          title={collapsed ? item.label : ''}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {isMobile && mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={onMobileClose}
          aria-label="Cerrar menú"
        />
      ) : null}

      <aside
        className={cn(
          'sidebar-shell fixed left-0 top-0 z-50 h-screen border-r bg-muted/60 backdrop-blur transition-transform duration-200 ease-out',
          isMobile ? 'w-72 max-w-[85vw]' : collapsed ? 'w-64' : 'w-80',
          isMobile ? (mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        )}
      >
        <div className="flex min-h-[3.5rem] items-center justify-between border-b px-4 py-3">
          {!collapsed && (
            <h2 className="text-base font-semibold">Análisis Desktop</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={
              isMobile
                ? 'Cerrar sidebar'
                : collapsed
                  ? 'Expandir sidebar'
                  : 'Colapsar sidebar'
            }
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <nav className="p-2">
            <ul className="space-y-1">
              {sidebarItems.map((item) => renderMenuItem(item))}
            </ul>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
