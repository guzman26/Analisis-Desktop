import React, { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { IssuesProvider } from '@/contexts/IssuesContext';

interface LegacyDomainProvidersProps {
  children: ReactNode;
}

type ProviderType = React.ComponentType<{ children: ReactNode }>;

interface ProviderConfig {
  Provider: ProviderType;
  dependsOn?: ProviderType[];
  fallback?: ReactNode;
  withErrorBoundary?: boolean;
  withSuspense?: boolean;
}

const providers: ProviderConfig[] = [
  { Provider: CustomerProvider, withErrorBoundary: true },
  { Provider: IssuesProvider },
];

const composeProviders = (
  providerConfigs: ProviderConfig[],
  children: ReactNode
): ReactNode => {
  const sortedConfigs = [...providerConfigs].sort((a, b) => {
    if (b.dependsOn?.some((dep) => dep === a.Provider)) return -1;
    if (a.dependsOn?.some((dep) => dep === b.Provider)) return 1;
    return 0;
  });

  return sortedConfigs.reduceRight((childContent, config) => {
    const { Provider, withErrorBoundary, withSuspense, fallback } = config;

    let content = <Provider>{childContent}</Provider>;

    if (withErrorBoundary) {
      content = (
        <ErrorBoundary
          fallback={<div className="error-boundary">Something went wrong</div>}
          onError={(error: Error) => console.error('Provider Error:', error)}
        >
          {content}
        </ErrorBoundary>
      );
    }

    if (withSuspense) {
      content = (
        <Suspense fallback={fallback || <div>Loading...</div>}>
          {content}
        </Suspense>
      );
    }

    return content;
  }, children);
};

export const LegacyDomainProviders = ({
  children,
}: LegacyDomainProvidersProps) => {
  return composeProviders(providers, children);
};
