import { useState, useCallback } from 'react';
import { PaginationParams } from '@/types';
import { extractDataFromResponse } from '@/utils';

interface UsePaginationOptions {
  fetchFunction: (params: any) => Promise<any>;
  limit?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: (filters?: Record<string, any>) => void;
}

export const usePagination = <T>({
  fetchFunction,
  limit = 15,
}: UsePaginationOptions): UsePaginationReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchData = useCallback(
    async (isLoadMore = false, newFilters = filters) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      const params: PaginationParams & Record<string, any> = {
        limit,
        ...newFilters,
        ...(isLoadMore && nextKey ? { lastEvaluatedKey: nextKey } : {}),
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      try {
        const response = await fetchFunction(params);

        // Extract pagination metadata
        const paginationData = response?.data || response;
        const newNextKey = paginationData?.nextKey || null;
        const items = extractDataFromResponse(response);

        if (Array.isArray(items)) {
          setData((prev: T[]) => (isLoadMore ? [...prev, ...items] : items));
          setNextKey(newNextKey);
          setHasMore(!!newNextKey);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        if (!isLoadMore) {
          setData([]);
          setNextKey(null);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [nextKey, fetchFunction, filters, loading, limit]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) fetchData(true);
  }, [fetchData, hasMore, loading]);

  const refresh = useCallback(
    (newFilters = {}) => {
      setFilters(newFilters);
      setData([]);
      setNextKey(null);
      setHasMore(true);
      fetchData(false, newFilters);
    },
    [fetchData]
  );

  return { data, loading, error, hasMore, loadMore, refresh };
};

export default usePagination;
