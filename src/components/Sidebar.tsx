import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search
} from 'lucide-react';

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
        <li key={item.label}>
          <button
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 
              text-macos-text hover:bg-macos-sidebar-hover
              rounded-macos-sm transition-all duration-200
              ${isCollapsed ? 'justify-center' : 'justify-between'}
            `}
            onClick={() => toggleSubfolder(item.label)}
            title={isCollapsed ? item.label : ''}
          >
            <div className="flex items-center gap-3">
              <span className="text-macos-text-secondary">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <motion.div
                animate={{ rotate: isExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-macos-text-secondary" />
              </motion.div>
            )}
          </button>
          <AnimatePresence>
            {isExpanded && !isCollapsed && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 mt-1 space-y-0.5 overflow-hidden"
              >
                {item.children?.map((child) => renderMenuItem(child, depth + 1))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path!}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 rounded-macos-sm
            transition-all duration-200 group
            ${isActive 
              ? 'bg-macos-accent text-white' 
              : 'text-macos-text hover:bg-macos-sidebar-hover'
            }
            ${isCollapsed ? 'justify-center' : ''}
            ${depth > 0 ? 'pl-9' : ''}
          `}
          title={isCollapsed ? item.label : ''}
        >
          <span className="text-inherit">
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="text-sm font-medium">{item.label}</span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <motion.aside
      className={`
        fixed left-0 top-0 h-full bg-macos-sidebar
        border-r border-macos-border z-40
        transition-all duration-300 ease-out
      `}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-macos-border">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-macos-text">
              Análisis Desktop
            </h2>
          )}
          <button
            className={`
              p-1.5 rounded-macos-sm text-macos-text-secondary
              hover:bg-macos-sidebar-hover hover:text-macos-text
              transition-colors duration-200
              ${isCollapsed ? 'mx-auto' : ''}
            `}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
