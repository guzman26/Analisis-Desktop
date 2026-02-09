import React, {
  createContext as createReactContext,
  useReducer,
  useMemo,
  useContext,
  useCallback,
} from 'react';

// Generic state types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface BaseState {
  status: Status;
  error: Error | null;
}

export type BaseAction<T extends string = string, P = any> = {
  type: T;
  payload?: P;
};

// Create factory for context creation
export function createContextFactory<
  State extends BaseState,
  Action extends BaseAction,
  API extends Record<string, (...args: any[]) => any>,
>(options: {
  name: string;
  initialState: State;
  reducer: (state: State, action: Action) => State;
  createAPI: (dispatch: React.Dispatch<Action>) => API;
}) {
  const { name, initialState, reducer, createAPI } = options;

  // Create the context with proper typing
  type ContextValue = [State, API];
  const StateContext = createReactContext<ContextValue | undefined>(undefined);

  // Provider component
  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Create the API functions
    const api = useMemo(() => createAPI(dispatch), [dispatch]);

    // Memoize the context value
    const contextValue = useMemo<ContextValue>(
      () => [state, api],
      [state, api]
    );

    return (
      <StateContext.Provider value={contextValue}>
        {children}
      </StateContext.Provider>
    );
  };

  // Create hook for using the context
  function useContextValue(): ContextValue {
    const context = useContext(StateContext);

    if (context === undefined) {
      throw new Error(
        `use${name}Context must be used within a ${name}Provider`
      );
    }

    return context;
  }

  return {
    Provider,
    useContext: useContextValue,
    StateContext,
  };
}

// Helper hooks for common state operations
export function useAsyncAction<T>(
  asyncFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const [status, setStatus] = React.useState<Status>('idle');
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  // Store callback refs to avoid unstable dependencies
  const asyncFnRef = React.useRef(asyncFn);
  asyncFnRef.current = asyncFn;
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = React.useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await asyncFnRef.current();
      setData(result);
      setStatus('success');
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      onErrorRef.current?.(error);
      throw error;
    }
  }, []);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset: () => {
      setStatus('idle');
      setData(null);
      setError(null);
    },
  };
}

// Type guard helper for error checking
export function isError<T>(result: T | Error): result is Error {
  return result instanceof Error;
}
