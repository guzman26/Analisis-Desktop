import { createContext, useContext } from 'react';

export interface ServerStateContextValue {
  versions: Record<string, number>;
  invalidateScope: (scope: string) => void;
}

export const ServerStateContext = createContext<
  ServerStateContextValue | undefined
>(undefined);

export const useServerStateContext = () => {
  const context = useContext(ServerStateContext);
  if (!context) {
    throw new Error(
      'useServerStateContext must be used within ServerStateProvider'
    );
  }

  return context;
};
