import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/designSystem.css';
import { NetworkOfflineOverlay } from '@/components/design-system';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed
    ? 'var(--macos-width-sidebar-collapsed)'
    : 'var(--macos-width-sidebar)';

  return (
    <div className="macos-window-fullscreen">
      <Sidebar onToggle={setSidebarCollapsed} />
      <main
        className="macos-content macos-animate-fade-in"
        style={{
          marginLeft: sidebarWidth,
          paddingLeft: 'var(--macos-space-6)',
          paddingRight: 'var(--macos-space-6)',
          paddingTop: 'var(--macos-space-6)',
          paddingBottom: 'var(--macos-space-6)',
          minHeight: '100vh',
          overflow: 'auto',
          transition:
            'margin-left var(--macos-duration-normal) var(--macos-ease-out)',
        }}
      >
        <NetworkOfflineOverlay />
        {children}
      </main>
    </div>
  );
};

export default Layout;
