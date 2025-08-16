import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  text = 'Cargando…',
  className,
}) => {
  if (!show) return null;
  return (
    <div
      className={twMerge(
        'fixed inset-0 z-[60] flex items-center justify-center bg-black/20',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 py-2 rounded-macos-sm bg-white/90 border border-macos-border shadow">
        <svg
          className="animate-spin h-4 w-4 text-macos-accent"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="text-sm text-macos-text-secondary">{text}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
