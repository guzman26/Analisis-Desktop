import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Box, BoxFilterParams, Location } from '@/types';
import { getDataModuleFromPath, isDataV2Enabled } from '@/config/dataFlags';
import { useLocation } from 'react-router-dom';
import { boxesApi } from '../api/boxesApi';
import { mapBoxList } from '../mappers/boxMappers';
import { useUnassignedBoxesInfiniteQuery } from '../queries/useBoxQueries';

interface UseUnassignedBoxesStateResult {
  unassignedBoxes: Box[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setServerFilters: (filters: BoxFilterParams) => Promise<void>;
}

const DEFAULT_LIMIT = 50;

export const useUnassignedBoxesState = (
  ubicacion: Location
): UseUnassignedBoxesStateResult => {
  const routerLocation = useLocation();
  const activeModule = getDataModuleFromPath(routerLocation.pathname);
  const useV2 = activeModule ? isDataV2Enabled(activeModule) : false;

  const [filters, setFilters] = useState<BoxFilterParams>({});

  const [legacyItems, setLegacyItems] = useState<Box[]>([]);
  const [legacyNextKey, setLegacyNextKey] = useState<string | null>(null);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState<string | null>(null);

  // Store legacyNextKey in a ref to avoid recreating fetchLegacy on every fetch
  const legacyNextKeyRef = useRef(legacyNextKey);
  legacyNextKeyRef.current = legacyNextKey;

  const v2Query = useUnassignedBoxesInfiniteQuery({
    ubicacion,
    filters,
    limit: DEFAULT_LIMIT,
    enabled: useV2,
  });

  // Store v2Query methods in refs to avoid unstable dependencies
  const v2RefetchRef = useRef(v2Query.refetch);
  v2RefetchRef.current = v2Query.refetch;
  const v2FetchNextPageRef = useRef(v2Query.fetchNextPage);
  v2FetchNextPageRef.current = v2Query.fetchNextPage;

  const fetchLegacy = useCallback(
    async (append = false, explicitFilters?: BoxFilterParams) => {
      setLegacyLoading(true);
      setLegacyError(null);
      try {
        const nextFilters = explicitFilters ?? filters;
        const response = await boxesApi.getUnassigned({
          ubicacion,
          filters: nextFilters,
          limit: DEFAULT_LIMIT,
          lastKey: append ? (legacyNextKeyRef.current ?? undefined) : undefined,
        });

        const mapped = mapBoxList(response.items ?? []);
        setLegacyItems((current) => {
          if (!append) return mapped;
          const map = new Map<string, Box>();
          for (const box of current) map.set(box.codigo, box);
          for (const box of mapped) map.set(box.codigo, box);
          return mapBoxList(Array.from(map.values()));
        });

        setLegacyNextKey(response.nextKey ?? null);
      } catch (error) {
        setLegacyError(
          error instanceof Error ? error.message : 'Error al cargar cajas'
        );
      } finally {
        setLegacyLoading(false);
      }
    },
    [filters, ubicacion]
  );

  useEffect(() => {
    if (useV2) return;
    void fetchLegacy(false);
  }, [fetchLegacy, useV2]);

  const loadMore = useCallback(async () => {
    if (useV2) {
      await v2FetchNextPageRef.current();
      return;
    }

    if (!legacyNextKeyRef.current || legacyLoading) return;
    await fetchLegacy(true);
  }, [fetchLegacy, legacyLoading, useV2]);

  const refresh = useCallback(async () => {
    if (useV2) {
      await v2RefetchRef.current();
      return;
    }
    setLegacyNextKey(null);
    await fetchLegacy(false);
  }, [fetchLegacy, useV2]);

  const setServerFilters = useCallback(
    async (nextFilters: BoxFilterParams) => {
      setFilters(nextFilters);

      if (useV2) {
        await v2RefetchRef.current();
        return;
      }

      setLegacyNextKey(null);
      await fetchLegacy(false, nextFilters);
    },
    [fetchLegacy, useV2]
  );

  const v2Items = useMemo(
    () =>
      mapBoxList(
        (v2Query.data?.pages ?? []).flatMap((page) => page.items ?? []) as Box[]
      ),
    [v2Query.data?.pages]
  );

  return {
    unassignedBoxes: useV2 ? v2Items : legacyItems,
    loading: useV2 ? v2Query.isFetching : legacyLoading,
    error: useV2
      ? v2Query.error instanceof Error
        ? v2Query.error.message
        : null
      : legacyError,
    hasMore: useV2 ? Boolean(v2Query.hasNextPage) : Boolean(legacyNextKey),
    loadMore,
    refresh,
    setServerFilters,
  };
};
