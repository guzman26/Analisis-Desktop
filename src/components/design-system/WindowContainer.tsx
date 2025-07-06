import React from 'react';
import '../../styles/designSystem.css';

export interface WindowContainerProps {
  title: string;
  children: React.ReactNode;
  fullscreen?: boolean;
  showTrafficLights?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

const WindowContainer: React.FC<WindowContainerProps> = ({
  title,
  children,
  fullscreen = true,
  showTrafficLights = true,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}) => {
  return (
    <div className={`macos-window ${fullscreen ? 'macos-window-fullscreen' : ''} ${className}`}>
      {/* macOS Title Bar */}
      <header className="macos-titlebar">
        {showTrafficLights && (
          <div className="macos-traffic-lights">
            {/* Close Button */}
            <button
              className="macos-control macos-control-close"
              onClick={onClose}
              aria-label="Close"
              disabled={!onClose}
            >
              <div className="macos-control-icon">
                <svg width="6" height="6" viewBox="0 0 6 6">
                  <path
                    d="M1 1L5 5M5 1L1 5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>

            {/* Minimize Button */}
            <button
              className="macos-control macos-control-minimize"
              onClick={onMinimize}
              aria-label="Minimize"
              disabled={!onMinimize}
            >
              <div className="macos-control-icon">
                <svg width="8" height="1" viewBox="0 0 8 1">
                  <path
                    d="M0 0H8"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>

            {/* Maximize Button */}
            <button
              className="macos-control macos-control-maximize"
              onClick={onMaximize}
              aria-label="Maximize"
              disabled={!onMaximize}
            >
              <div className="macos-control-icon">
                <svg width="6" height="6" viewBox="0 0 6 6">
                  <path
                    d="M1 3L3 1L5 3"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}

        <h1 className="macos-window-title">{title}</h1>
      </header>

      {/* Content Area */}
      <main className="macos-content macos-animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default WindowContainer;