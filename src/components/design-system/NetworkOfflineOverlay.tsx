import React from 'react';

const NetworkOfflineOverlay: React.FC = () => {
  const [isOffline, setIsOffline] = React.useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleRequestError = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.offline === true) setIsOffline(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network:request-error', handleRequestError as any);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'network:request-error',
        handleRequestError as any
      );
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-macos-sm shadow-xl border border-macos-border px-6 py-5 max-w-lg text-center">
        <h2 className="text-lg font-semibold text-macos-text mb-2">
          Sin conexión a internet
        </h2>
        <p className="text-macos-text-secondary mb-4">
          Parece que no hay conexión. Verifica tu red Wi‑Fi o datos móviles.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-4 py-2 rounded-macos-sm border border-macos-border hover:bg-gray-50"
            onClick={() => setIsOffline(!navigator.onLine ? true : false)}
          >
            Reintentar
          </button>
          <button
            className="px-4 py-2 rounded-macos-sm bg-macos-accent text-white hover:bg-macos-accent/90"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkOfflineOverlay;
