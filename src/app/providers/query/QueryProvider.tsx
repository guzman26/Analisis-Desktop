import { ReactNode, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { isDataV2DevtoolsEnabled } from '@/config/dataFlags';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30000,
            gcTime: 600000,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
    []
  );

  const showDevtools = isDataV2DevtoolsEnabled();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
};
