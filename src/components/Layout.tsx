import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-macos-bg">
      <Sidebar onToggle={handleToggleSidebar} />
      <main className={`
        flex-1 overflow-auto
        transition-all duration-300 ease-out
        ${isCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
