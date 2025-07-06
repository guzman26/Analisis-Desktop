import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import '../styles/designSystem.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="macos-window-fullscreen">
      <Sidebar />
      <main 
        className="macos-content macos-animate-fade-in" 
        style={{ 
          marginLeft: 'var(--macos-width-sidebar)',
          paddingLeft: 'var(--macos-space-6)',
          paddingRight: 'var(--macos-space-6)',
          paddingTop: 'var(--macos-space-6)',
          paddingBottom: 'var(--macos-space-6)',
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
