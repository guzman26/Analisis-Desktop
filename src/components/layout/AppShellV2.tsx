import { ReactNode, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { NetworkOfflineOverlay } from '@/components/design-system';
import { UiV2View } from '@/app/flags';
import { Badge } from '@/components/ui/badge';
import { Menu } from 'lucide-react';

export interface AppShellV2Props {
  children: ReactNode;
  activeView: UiV2View;
}

const sectionNameMap: Record<UiV2View, string> = {
  shell: 'Shell',
  dashboard: 'Dashboard',
  packing: 'Packing',
  bodega: 'Bodega',
  transito: 'Tránsito',
  'sales-core': 'Ventas',
  'dispatch-core': 'Despachos',
};

const AppShellV2 = ({ children, activeView }: AppShellV2Props) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });

  const sidebarWidth = sidebarCollapsed ? '16rem' : '20rem';

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

  return (
    <div className="ui-v2-enabled ui-v2-shell min-h-screen overflow-x-hidden">
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
        className="min-h-screen overflow-y-auto px-4 pb-6 pt-16 transition-[margin-left] duration-200 ease-out lg:px-6 lg:pb-8 lg:pt-4"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <div className="route-content space-y-4">
          <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between rounded-xl border bg-card/95 px-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Lomas Altas
              </p>
              <p className="text-sm font-medium text-foreground">
                Panel Operativo
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {sectionNameMap[activeView]}
            </Badge>
          </header>

          <NetworkOfflineOverlay />
          <div className="ui-v2-module route-content">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AppShellV2;
