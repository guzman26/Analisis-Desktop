import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ServerStateContext } from './serverStateContext';

interface ServerStateProviderProps {
  children: ReactNode;
}

export const ServerStateProvider = ({ children }: ServerStateProviderProps) => {
  const [versions, setVersions] = useState<Record<string, number>>({});

  const invalidateScope = useCallback((scope: string) => {
    setVersions((current) => ({
      ...current,
      [scope]: (current[scope] ?? 0) + 1,
    }));
  }, []);

  const value = useMemo(
    () => ({
      versions,
      invalidateScope,
    }),
    [versions, invalidateScope]
  );

  return (
    <ServerStateContext.Provider value={value}>
      {children}
    </ServerStateContext.Provider>
  );
};
