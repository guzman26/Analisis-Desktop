import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CreateDispatchRequest,
  Dispatch,
  UpdateDispatchRequest,
} from '@/types';
import { dispatchApi } from '@/modules/dispatch/api/dispatchApi';
import type { DispatchFilters } from '@/modules/dispatch/model/types';
import { normalizeModuleError } from '@/modules/core';
import {
  useInvalidateServerScope,
  useServerScopeVersion,
} from '@/app/providers';

interface DispatchListResult {
  dispatches: Dispatch[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isEmpty: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const DEFAULT_LIMIT = 20;

export const useDispatchListQuery = (
  filters: DispatchFilters
): DispatchListResult => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const version = useServerScopeVersion('dispatch');

  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchDispatches = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const parsedFilters = JSON.parse(serializedFilters) as DispatchFilters;
        const response = await dispatchApi.list({
          ...parsedFilters,
          limit: DEFAULT_LIMIT,
          lastKey: append ? (nextKey ?? undefined) : undefined,
        });

        setDispatches((current) =>
          append ? [...current, ...response.items] : response.items
        );
        setNextKey(response.nextKey ?? null);
        setHasMore(Boolean(response.nextKey));
      } catch (err) {
        const normalized = normalizeModuleError(err);
        setError(normalized.message);
      } finally {
        setLoading(false);
      }
    },
    [nextKey, serializedFilters]
  );

  useEffect(() => {
    void fetchDispatches(false);
  }, [fetchDispatches, version]);

  const refresh = useCallback(async () => {
    setNextKey(null);
    await fetchDispatches(false);
  }, [fetchDispatches]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextKey) {
      return;
    }

    await fetchDispatches(true);
  }, [fetchDispatches, hasMore, loading, nextKey]);

  return {
    dispatches,
    loading,
    error,
    hasMore,
    isEmpty: dispatches.length === 0,
    refresh,
    loadMore,
  };
};

export const useDispatchDetailQuery = (id?: string) => {
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const version = useServerScopeVersion('dispatch');

  const fetchDispatch = useCallback(async () => {
    if (!id) {
      setDispatch(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dispatchApi.getById(id);
      setDispatch(response);
    } catch (err) {
      const normalized = normalizeModuleError(err);
      setError(normalized.message);
      setDispatch(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDispatch();
  }, [fetchDispatch, version]);

  return {
    dispatch,
    loading,
    error,
    refetch: fetchDispatch,
  };
};

export const useCreateDispatchMutation = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateScope = useInvalidateServerScope();

  const mutateAsync = useCallback(
    async (payload: CreateDispatchRequest) => {
      setIsPending(true);
      setError(null);

      try {
        const response = await dispatchApi.create(payload);
        invalidateScope('dispatch');
        return response;
      } catch (err) {
        const normalized = normalizeModuleError(err);
        setError(normalized.message);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [invalidateScope]
  );

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useApproveDispatchMutation = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateScope = useInvalidateServerScope();

  const mutateAsync = useCallback(
    async (id: string, userId: string) => {
      setIsPending(true);
      setError(null);

      try {
        const response = await dispatchApi.approve(id, userId);
        invalidateScope('dispatch');
        return response;
      } catch (err) {
        const normalized = normalizeModuleError(err);
        setError(normalized.message);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [invalidateScope]
  );

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useUpdateDispatchMutation = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateScope = useInvalidateServerScope();

  const mutateAsync = useCallback(
    async (id: string, updates: UpdateDispatchRequest, userId: string) => {
      setIsPending(true);
      setError(null);

      try {
        const response = await dispatchApi.update(id, updates, userId);
        invalidateScope('dispatch');
        return response;
      } catch (err) {
        const normalized = normalizeModuleError(err);
        setError(normalized.message);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [invalidateScope]
  );

  return {
    mutateAsync,
    isPending,
    error,
  };
};

export const useCancelDispatchMutation = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidateScope = useInvalidateServerScope();

  const mutateAsync = useCallback(
    async (id: string, userId: string, reason?: string) => {
      setIsPending(true);
      setError(null);

      try {
        const response = await dispatchApi.cancel(id, userId, reason);
        invalidateScope('dispatch');
        return response;
      } catch (err) {
        const normalized = normalizeModuleError(err);
        setError(normalized.message);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [invalidateScope]
  );

  return {
    mutateAsync,
    isPending,
    error,
  };
};
