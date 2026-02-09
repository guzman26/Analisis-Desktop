import React from 'react';
import { useLocation } from 'react-router-dom';
import { getViewFromPath, isViewV2 } from '@/config/uiFlags';
import { cn } from '@/lib/utils';

export interface WindowContainerProps {
  title: string;
  children: React.ReactNode;
  fullscreen?: boolean;
  className?: string;
}

const WindowContainer: React.FC<WindowContainerProps> = ({
  title,
  children,
  fullscreen = true,
  className = '',
}) => {
  const location = useLocation();
  const activeView = getViewFromPath(location.pathname);
  const isV2View = activeView ? isViewV2(activeView) : false;

  if (isV2View) {
    return (
      <div
        className={cn(
          'v2-page flex min-h-screen flex-col gap-4',
          fullscreen && 'h-screen',
          className
        )}
      >
        <header className="rounded-xl border bg-card px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${fullscreen ? 'h-screen' : ''} ${className}`}
    >
      {/* Title Bar */}
      <header className="flex items-center h-14 px-6 bg-background border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </header>

      {/* Content Area */}
      <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default WindowContainer;
