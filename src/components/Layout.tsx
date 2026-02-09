import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { NetworkOfflineOverlay } from '@/components/design-system';
import AppShellV2 from '@/components/layout/AppShellV2';
import { getUiFlags, getViewFromPath, isViewV2, UiV2View } from '@/app/flags';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });
  const flags = getUiFlags();

  const sidebarWidth = sidebarCollapsed ? '16rem' : '20rem';
  const activeView = useMemo(
    () => getViewFromPath(location.pathname),
    [location.pathname]
  );
  const isScopedViewEnabled = activeView ? isViewV2(activeView) : false;

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (activeView && isScopedViewEnabled && flags.shellV2) {
    return (
      <AppShellV2 activeView={activeView as UiV2View}>
        <div className="v2-page">{children}</div>
      </AppShellV2>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen overflow-x-hidden',
        isScopedViewEnabled && 'ui-v2-enabled ui-v2-module'
      )}
    >
      <Sidebar
        onToggle={setSidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      {isMobile ? (
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-card/95 shadow-sm backdrop-blur lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}
      <main
        className="min-h-screen overflow-y-auto px-4 pb-4 pt-16 transition-[margin-left] duration-200 ease-out lg:px-6 lg:pb-6 lg:pt-6"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
        }}
      >
        <NetworkOfflineOverlay />
        <div className={cn(isScopedViewEnabled && 'v2-page')}>{children}</div>
      </main>
    </div>
  );
};

export default Layout;
