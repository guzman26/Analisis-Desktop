// Type declarations for react-error-boundary

declare module 'react-error-boundary' {
  import * as React from 'react';

  export interface FallbackProps {
    error: Error;
    resetErrorBoundary: (...args: any[]) => void;
  }

  export interface ErrorBoundaryProps {
    onError?: (error: Error, info: { componentStack: string }) => void;
    onReset?: (...args: any[]) => void;
    resetKeys?: any[];
    fallback?: React.ReactElement | null;
    fallbackRender?: (props: FallbackProps) => React.ReactElement | null;
    FallbackComponent?: React.ComponentType<FallbackProps>;
    children?: React.ReactNode;
  }

  export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {}

  export function useErrorHandler<E = Error>(error?: E | null | undefined): (error: E) => void;

  export function withErrorBoundary<P>(
    Component: React.ComponentType<P>,
    errorBoundaryProps: ErrorBoundaryProps
  ): React.ComponentType<P>;
}
