import { useState, useCallback } from 'react';
import { PaginationParams } from '@/types';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';

interface UsePaginationOptions {
  fetchFunction: (params: any) => Promise<any>;
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: (filters?: Record<string, any>) => void;
}

const usePagination = <T>({
  fetchFunction,
}: UsePaginationOptions): UsePaginationReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

  const fetchData = useCallback(
    async (isLoadMore = false, filters = {}) => {
      setLoading(true);
      setError(null);

      const queryParams: PaginationParams & Record<string, any> = {
        limit: 15,
        ...filters,
        ...(isLoadMore && nextKey ? { lastEvaluatedKey: nextKey } : {}),
      };

      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach((key) => {
        if (
          queryParams[key] === '' ||
          queryParams[key] === null ||
          queryParams[key] === undefined
        ) {
          delete queryParams[key];
        }
      });

      try {
        const rawResponse = await fetchFunction(queryParams);

        // Check if response has the expected structure
        if (rawResponse) {
          // Extract pagination metadata BEFORE processing with extractDataFromResponse
          const paginationData = rawResponse.data || rawResponse;
          const nextPageKey = paginationData.nextKey || null;
          const hasMoreItems = !!nextPageKey;

          // Extract the actual data array
          const extractedItems = extractDataFromResponse(rawResponse);

          if (extractedItems && Array.isArray(extractedItems)) {
            setData((prev) => {
              const newData = isLoadMore
                ? [...prev, ...extractedItems]
                : extractedItems;
              return newData;
            });
            setNextKey(nextPageKey);
            setHasMore(hasMoreItems);
          } else {
            console.warn('usePagination: No valid items found in response');
            setData(isLoadMore ? data : []);
            setNextKey(null);
            setHasMore(false);
          }
        } else {
          throw new Error(rawResponse?.message || 'Error al obtener los datos');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error de paginación:', err);
        if (!isLoadMore) {
          setData([]);
          setNextKey(null);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [nextKey, fetchFunction, data]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData(true, currentFilters);
    }
  }, [fetchData, hasMore, loading, currentFilters]);

  const refresh = useCallback(
    (newFilters = {}) => {
      setCurrentFilters(newFilters);
      setData([]);
      setNextKey(null);
      setHasMore(true);
      fetchData(false, newFilters);
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

export default usePagination;
