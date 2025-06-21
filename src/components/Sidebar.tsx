import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '@/styles/Sidebar.css';

interface SidebarItem {
  path?: string;
  label: string;
  icon: string;
  children?: SidebarItem[];
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

const sidebarItems: SidebarItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    label: 'Packing',
    icon: '📦',
    children: [
      {
        path: '/packing/openPallets',
        label: 'Pallets Abiertos',
        icon: '📋',
      },
      {
        path: '/packing/closedPallets',
        label: 'Pallets Cerrados',
        icon: '✅',
      },
      {
        path: '/packing/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: '📦',
      },
    ],
  },
  {
    label: 'Bodega',
    icon: '🏬',
    children: [
      {
        path: '/bodega/pallets',
        label: 'Pallets en Bodega',
        icon: '🏷️',
      },
      {
        path: '/bodega/unassignedBoxes',
        label: 'Cajas sin Pallet',
        icon: '📦',
      },
    ],
  },
  {
    label: 'Ventas',
    icon: '💰',
    children: [
      {
        path: '/sales/new',
        label: 'Nueva Venta',
        icon: '📝',
      },
      {
        path: '/sales/createCustomer',
        label: 'Crear Cliente',
        icon: '📝',
      },
      {
        path: '/sales/orders',
        label: 'Borradores de Ventas',
        icon: '📌',
      },
      {
        path: '/sales/confirmed',
        label: 'Ventas Confirmadas',
        icon: '✅',
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
        <li key={item.label} className="sidebar-menu-item">
          <button
            className="sidebar-link subfolder-toggle"
            onClick={() => toggleSubfolder(item.label)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}>
              {item.label}
            </span>
            <span
              className={`expand-icon ${isCollapsed ? 'hidden' : ''} ${isExpanded ? 'expanded' : ''}`}
            >
              ▼
            </span>
          </button>
          {isExpanded && !isCollapsed && (
            <ul className="sidebar-submenu">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li
        key={item.path}
        className={`sidebar-menu-item ${depth > 0 ? 'submenu-item' : ''}`}
      >
        <NavLink
          to={item.path!}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${depth > 0 ? 'submenu-link' : ''}`
          }
          title={isCollapsed ? item.label : ''}
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}>
            {item.label}
          </span>
        </NavLink>
      </li>
    );
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className={`sidebar-title ${isCollapsed ? 'hidden' : ''}`}>
          Análisis Desktop
        </h2>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>
            {isCollapsed ? '➤' : '◀'}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {sidebarItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
