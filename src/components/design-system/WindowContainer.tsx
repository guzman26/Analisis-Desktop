import React from 'react';

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
