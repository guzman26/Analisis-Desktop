import React, { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PalletProvider } from './PalletContext';
import { BoxesProvider } from './BoxesContext';
import { CustomerProvider } from './CustomerContext';
import { SalesProvider } from './SalesContext';
import { IssuesProvider } from './IssuesContext';

interface AppProvidersProps {
  children: ReactNode;
}

type ProviderType = React.ComponentType<{ children: ReactNode }>;

interface ProviderConfig {
  Provider: ProviderType;
  /** Use this to specify dependencies between providers */
  dependsOn?: ProviderType[];
  /** Fallback component to show while lazy loading (if applicable) */
  fallback?: ReactNode;
  /** Whether to wrap this provider in error boundary */
  withErrorBoundary?: boolean;
  /** Whether to wrap this provider in suspense */
  withSuspense?: boolean;
}

// List of providers with their configurations
const providers: ProviderConfig[] = [
  { Provider: PalletProvider, withErrorBoundary: true },
  { Provider: BoxesProvider, dependsOn: [PalletProvider] },
  { Provider: CustomerProvider, withErrorBoundary: true },
  {
    Provider: SalesProvider,
    dependsOn: [CustomerProvider],
    withErrorBoundary: true,
  },
  { Provider: IssuesProvider },
];

/**
 * Enhanced provider composition function that supports:
 * - Error boundaries
 * - Suspense
 * - Provider dependencies
 */
const composeProviders = (
  providerConfigs: ProviderConfig[],
  children: ReactNode
): ReactNode => {
  // Topologically sort providers based on dependencies
  const sortedConfigs = [...providerConfigs].sort((a, b) => {
    // If B depends on A, A should come first
    if (b.dependsOn?.some((dep) => dep === a.Provider)) return -1;
    // If A depends on B, B should come first
    if (a.dependsOn?.some((dep) => dep === b.Provider)) return 1;
    return 0;
  });

  // Compose the providers
  return sortedConfigs.reduceRight((childContent, config) => {
    const { Provider, withErrorBoundary, withSuspense, fallback } = config;

    let content = <Provider>{childContent}</Provider>;

    // Wrap in error boundary if specified
    if (withErrorBoundary) {
      content = (
        <ErrorBoundary
          fallback={<div className="error-boundary">Something went wrong</div>}
          onError={(error: Error) => console.error(`Provider Error:`, error)}
        >
          {content}
        </ErrorBoundary>
      );
    }

    // Wrap in suspense if specified
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

/**
 * Main application providers component
 * Wraps the application in all required context providers
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return composeProviders(providers, children);
};
