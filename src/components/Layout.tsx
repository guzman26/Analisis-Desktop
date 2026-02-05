import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { NetworkOfflineOverlay } from '@/components/design-system';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed
    ? '16rem'
    : '20rem';

  return (
    <div className="min-h-screen h-screen">
      <Sidebar onToggle={setSidebarCollapsed} />
      <main
        className="flex-1 overflow-y-auto animate-fade-in"
        style={{
          marginLeft: sidebarWidth,
          paddingLeft: 'var(--5)',
          paddingRight: 'var(--5)',
          paddingTop: 'var(--5)',
          paddingBottom: 'var(--5)',
          minHeight: '100vh',
          overflow: 'auto',
          transition:
            'margin-left 0.2s ease-out',
        }}
      >
        <NetworkOfflineOverlay />
        {children}
      </main>
    </div>
  );
};

export default Layout;
