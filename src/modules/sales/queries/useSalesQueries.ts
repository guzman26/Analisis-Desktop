import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Sale } from '@/types';
import { salesApi, type SalesOrderState } from '../api/salesApi';
import { salesKeys } from './keys';
import { mapSalesList } from '../mappers/saleMappers';
import { getDataModuleFromPath, isDataV2Enabled } from '@/config/dataFlags';
import { useLocation } from 'react-router-dom';

const DEFAULT_LIMIT = 20;

interface LegacySalesState {
  data: Sale[];
  loading: boolean;
  error: string | null;
  nextKey: string | null;
}

const useSalesOrdersInfiniteQuery = (
  state: SalesOrderState,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: salesKeys.orders(state),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await salesApi.getOrders(state, {
        limit: DEFAULT_LIMIT,
        lastKey: pageParam ?? undefined,
      });

      return {
        items: mapSalesList(response.items ?? []),
        nextKey: response.nextKey ?? null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextKey ?? undefined,
    enabled: options?.enabled ?? true,
  });
};

const useLegacySalesOrders = (state: SalesOrderState, enabled: boolean) => {
  const [legacy, setLegacy] = useState<LegacySalesState>({
    data: [],
    loading: false,
    error: null,
    nextKey: null,
  });

  // Store nextKey in a ref to avoid recreating fetchData on every fetch
  const nextKeyRef = useRef(legacy.nextKey);
  nextKeyRef.current = legacy.nextKey;

  const fetchData = useCallback(
    async (append = false) => {
      if (!enabled) return;

      setLegacy((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await salesApi.getOrders(state, {
          limit: DEFAULT_LIMIT,
          lastKey: append ? (nextKeyRef.current ?? undefined) : undefined,
        });

        setLegacy((prev) => ({
          data: append
            ? mapSalesList([...prev.data, ...(response.items ?? [])])
            : mapSalesList(response.items ?? []),
          loading: false,
          error: null,
          nextKey: response.nextKey ?? null,
        }));
      } catch (error) {
        setLegacy((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Error al cargar ventas',
        }));
      }
    },
    [enabled, state]
  );

  useEffect(() => {
    if (!enabled) return;
    void fetchData(false);
  }, [enabled, fetchData]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLegacy((prev) => ({ ...prev, nextKey: null }));
    await fetchData(false);
  }, [enabled, fetchData]);

  const loadMore = useCallback(async () => {
    if (!enabled || !nextKeyRef.current || legacy.loading) return;
    await fetchData(true);
  }, [enabled, fetchData, legacy.loading]);

  return {
    data: legacy.data,
    loading: legacy.loading,
    error: legacy.error,
    hasMore: Boolean(legacy.nextKey),
    refresh,
    loadMore,
  };
};

const useSalesOrdersState = (state: SalesOrderState) => {
  const routerLocation = useLocation();
  const activeModule = getDataModuleFromPath(routerLocation.pathname);
  const useV2 = activeModule === 'sales' ? isDataV2Enabled('sales') : false;

  const query = useSalesOrdersInfiniteQuery(state, { enabled: useV2 });
  const legacy = useLegacySalesOrders(state, !useV2);

  // Store query and legacy methods in refs to avoid unstable dependencies
  const queryRefetchRef = useRef(query.refetch);
  queryRefetchRef.current = query.refetch;
  const queryFetchNextPageRef = useRef(query.fetchNextPage);
  queryFetchNextPageRef.current = query.fetchNextPage;
  const legacyRefreshRef = useRef(legacy.refresh);
  legacyRefreshRef.current = legacy.refresh;
  const legacyLoadMoreRef = useRef(legacy.loadMore);
  legacyLoadMoreRef.current = legacy.loadMore;

  const data = useMemo(
    () =>
      useV2
        ? mapSalesList(
            (query.data?.pages ?? []).flatMap(
              (page) => page.items ?? []
            ) as Sale[]
          )
        : legacy.data,
    [legacy.data, query.data?.pages, useV2]
  );

  const refresh = useCallback(async () => {
    if (useV2) {
      await queryRefetchRef.current();
      return;
    }
    await legacyRefreshRef.current();
  }, [useV2]);

  const loadMore = useCallback(async () => {
    if (useV2) {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        await queryFetchNextPageRef.current();
      }
      return;
    }
    await legacyLoadMoreRef.current();
  }, [query.hasNextPage, query.isFetchingNextPage, useV2]);

  return {
    data,
    loading: useV2 ? query.isFetching : legacy.loading,
    error:
      useV2 && query.error instanceof Error
        ? query.error.message
        : useV2
          ? null
          : legacy.error,
    hasMore: useV2 ? Boolean(query.hasNextPage) : legacy.hasMore,
    refresh,
    loadMore,
  };
};

export const useDraftSalesOrdersInfiniteQuery = () => {
  return useSalesOrdersState('DRAFT');
};

export const useConfirmedSalesOrdersInfiniteQuery = () => {
  return useSalesOrdersState('CONFIRMED');
};

export const useSaleByIdQuery = (saleId?: string | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: salesKeys.orderDetail(saleId ?? ''),
    queryFn: async () => {
      if (!saleId) return null;
      return salesApi.getById(saleId);
    },
    enabled: Boolean(saleId),
    initialData: () => {
      if (!saleId) return null;

      const draftPages = queryClient.getQueryData<{
        pages: Array<{ items: Sale[] }>;
      }>(salesKeys.orders('DRAFT'));
      const confirmedPages = queryClient.getQueryData<{
        pages: Array<{ items: Sale[] }>;
      }>(salesKeys.orders('CONFIRMED'));

      const fromDraft = draftPages?.pages
        ?.flatMap((page) => page.items ?? [])
        .find((sale) => sale.saleId === saleId);
      if (fromDraft) return fromDraft;

      const fromConfirmed = confirmedPages?.pages
        ?.flatMap((page) => page.items ?? [])
        .find((sale) => sale.saleId === saleId);
      return fromConfirmed ?? null;
    },
  });
};
