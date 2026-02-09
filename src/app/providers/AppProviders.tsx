import { ReactNode } from 'react';
import { ServerStateProvider } from './ServerStateProvider';
import { LegacyDomainProviders } from './LegacyDomainProviders';
import { QueryProvider } from './query/QueryProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <ServerStateProvider>
        <LegacyDomainProviders>{children}</LegacyDomainProviders>
      </ServerStateProvider>
    </QueryProvider>
  );
};
