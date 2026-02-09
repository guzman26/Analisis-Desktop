import { useCallback, useEffect, useRef, useState } from 'react';
import { handleApiError } from './apiUtils';
import { Status } from './createContext';

// Generic paginated data interface
export interface PaginatedData<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  currentPage: number;
  pageSize: number;
}

// Generic paginated fetch function type
export type FetchFunctionPaginated<T, P = Record<string, any>> = (
  params: P & { page?: number; pageSize?: number }
) => Promise<{
  data: T[];
  totalCount?: number;
  hasMore?: boolean;
}>;

// Hook for fetching paginated data
export function usePaginatedData<T, P = Record<string, any>>(
  fetchFunction: FetchFunctionPaginated<T, P>,
  options?: {
    initialParams?: P;
    initialPage?: number;
    pageSize?: number;
    immediate?: boolean;
    preprocessData?: (data: T[]) => T[];
  }
): PaginatedData<T> {
  const {
    initialParams = {} as P,
    initialPage = 1,
    pageSize = 10,
    immediate = true,
    preprocessData,
  } = options || {};

  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [params] = useState<P>(initialParams);

  // Store currentPage in a ref to avoid recreating fetchData on page changes
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  // Store fetchFunction and preprocessData in refs for stable callbacks
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;
  const preprocessDataRef = useRef(preprocessData);
  preprocessDataRef.current = preprocessData;

  const fetchData = useCallback(
    async (page?: number, reset = false) => {
      const targetPage = page ?? currentPageRef.current;
      setStatus('loading');
      setError(null);

      try {
        const response = await fetchFunctionRef.current({
          ...params,
          page: targetPage,
          pageSize,
        });

        let processedData = response.data;
        if (preprocessDataRef.current) {
          processedData = preprocessDataRef.current(processedData);
        }

        setData((prev) =>
          reset ? processedData : [...prev, ...processedData]
        );
        setHasMore(response.hasMore ?? processedData.length === pageSize);
        setCurrentPage(targetPage);
        setStatus('success');
      } catch (err) {
        setError(handleApiError(err));
        setStatus('error');
      }
    },
    [pageSize, params]
  );

  const loadMore = useCallback(async () => {
    if (status !== 'loading' && hasMore) {
      await fetchData(currentPageRef.current + 1);
    }
  }, [fetchData, status, hasMore]);

  const refresh = useCallback(async () => {
    setCurrentPage(initialPage);
    await fetchData(initialPage, true);
  }, [fetchData, initialPage]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      refresh();
    }
  }, [immediate, refresh]);

  // When params change, refresh data
  useEffect(() => {
    if (
      immediate &&
      params &&
      typeof params === 'object' &&
      Object.keys(params as object).length > 0
    ) {
      refresh();
    }
  }, [params, immediate, refresh]);

  return {
    data,
    loading: status === 'loading',
    error,
    hasMore,
    loadMore,
    refresh,
    currentPage,
    pageSize,
  };
}

// Hook for singular data fetching
export function useDataFetch<T, P = void>(
  fetchFunction: (params: P) => Promise<T>,
  options?: {
    initialParams?: P;
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const {
    initialParams,
    immediate = false,
    onSuccess,
    onError,
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Store callback refs to avoid unstable dependencies
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(
    async (params?: P) => {
      setStatus('loading');
      setError(null);

      try {
        const result = await fetchFunctionRef.current(
          params ?? (initialParams as P)
        );
        setData(result);
        setStatus('success');
        onSuccessRef.current?.(result);
        return result;
      } catch (err) {
        const errorObj = handleApiError(err);
        setError(errorObj);
        setStatus('error');
        onErrorRef.current?.(errorObj);
        throw errorObj;
      }
    },
    [initialParams]
  );

  useEffect(() => {
    if (immediate && initialParams !== undefined) {
      execute(initialParams);
    }
  }, [immediate, execute, initialParams]);

  return {
    data,
    execute,
    loading: status === 'loading',
    error,
    status,
  };
}

// Hook for data mutation (create, update, delete)
export function useDataMutation<T, P>(
  mutationFunction: (params: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: Error, params: P) => void;
  }
) {
  const { onSuccess, onError } = options || {};
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Store callback refs to avoid unstable dependencies
  const mutationFunctionRef = useRef(mutationFunction);
  mutationFunctionRef.current = mutationFunction;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(async (params: P) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await mutationFunctionRef.current(params);
      setData(result);
      setStatus('success');
      onSuccessRef.current?.(result, params);
      return result;
    } catch (err) {
      const errorObj = handleApiError(err);
      setError(errorObj);
      setStatus('error');
      onErrorRef.current?.(errorObj, params);
      throw errorObj;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    execute,
    reset,
    data,
    loading: status === 'loading',
    error,
    status,
    isSuccess: status === 'success',
    isError: status === 'error',
    isLoading: status === 'loading',
    isIdle: status === 'idle',
  };
}
