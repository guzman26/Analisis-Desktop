import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import '@/styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="layout">
      <Sidebar onToggle={handleToggleSidebar} />
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
