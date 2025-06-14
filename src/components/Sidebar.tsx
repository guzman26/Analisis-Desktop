import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '@/styles/Sidebar.css';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
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
    path: '/openPallets',
    label: 'Pallets Abiertos',
    icon: '📦',
  },
];

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle?.(newCollapsedState);
  };

  useEffect(() => {
    onToggle?.(isCollapsed);
  }, []);

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
          {sidebarItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span
                  className={`sidebar-label ${isCollapsed ? 'hidden' : ''}`}
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
