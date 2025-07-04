import { useCallback, useEffect, useState } from 'react';
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

  const fetchData = useCallback(
    async (page = currentPage, reset = false) => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetchFunction({
          ...params,
          page,
          pageSize,
        });

        let processedData = response.data;
        if (preprocessData) {
          processedData = preprocessData(processedData);
        }

        setData((prev) =>
          reset ? processedData : [...prev, ...processedData]
        );
        setHasMore(response.hasMore ?? processedData.length === pageSize);
        setCurrentPage(page);
        setStatus('success');
      } catch (err) {
        setError(handleApiError(err));
        setStatus('error');
      }
    },
    [fetchFunction, currentPage, pageSize, params, preprocessData]
  );

  const loadMore = useCallback(async () => {
    if (status !== 'loading' && hasMore) {
      await fetchData(currentPage + 1);
    }
  }, [fetchData, currentPage, status, hasMore]);

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

  const execute = useCallback(
    async (params?: P) => {
      setStatus('loading');
      setError(null);

      try {
        const result = await fetchFunction(params ?? (initialParams as P));
        setData(result);
        setStatus('success');
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj = handleApiError(err);
        setError(errorObj);
        setStatus('error');
        onError?.(errorObj);
        throw errorObj;
      }
    },
    [fetchFunction, initialParams, onSuccess, onError]
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

  const execute = useCallback(
    async (params: P) => {
      setStatus('loading');
      setError(null);

      try {
        const result = await mutationFunction(params);
        setData(result);
        setStatus('success');
        onSuccess?.(result, params);
        return result;
      } catch (err) {
        const errorObj = handleApiError(err);
        setError(errorObj);
        setStatus('error');
        onError?.(errorObj, params);
        throw errorObj;
      }
    },
    [mutationFunction, onSuccess, onError]
  );

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
