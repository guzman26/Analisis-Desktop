import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { CreateLooseEggPalletRequest, Location, Pallet } from '@/types';
import { getDataModuleFromPath, isDataV2Enabled } from '@/config/dataFlags';
import { palletsApi, type ClosedPalletFilters } from '../api/palletsApi';
import {
  useClosedPalletsQuery,
  useOpenPalletsQuery,
} from '../queries/usePalletQueries';
import {
  useCloseAllOpenPalletsMutation,
  useClosePalletMutation,
  useCreateLooseEggPalletMutation,
  useCreatePalletMutation,
  useDeletePalletMutation,
  useMoveAllTransitToBodegaMutation,
  useMovePalletMutation,
  useUpdatePalletMutation,
} from '../mutations/usePalletMutations';

interface PalletServerState {
  openPallets: Pallet[];
  closedPalletsInPacking: Pallet[];
  closedPalletsInTransit: Pallet[];
  closedPalletsInBodega: Pallet[];
  selectedPallet: Pallet | null;
  loading: boolean;
  error: string | null;
  fetchPallets: (status?: string, location?: Location) => Promise<void>;
  fetchActivePallets: () => Promise<void>;
  fetchClosedPalletsInPacking: (opts?: {
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    calibre?: string;
    empresa?: string;
    turno?: string;
    searchTerm?: string;
  }) => Promise<void>;
  fetchClosedPalletsInTransit: () => Promise<void>;
  fetchClosedPalletsInBodega: () => Promise<void>;
  selectPallet: (pallet: Pallet) => void;
  clearSelectedPallet: () => void;
  createPallet: (
    data: Partial<Pallet> & { maxBoxes?: number }
  ) => Promise<Pallet>;
  updatePallet: (id: string, data: Partial<Pallet>) => Promise<Pallet>;
  deletePallet: (id: string) => Promise<void>;
  closePallet: (codigo: string) => Promise<void>;
  closeAllOpenPallets: (ubicacion?: string | string[]) => Promise<any>;
  movePallet: (codigo: string, location: Location) => Promise<void>;
  moveAllPalletsFromTransitToBodega: () => Promise<any>;
  createLooseEggPallet: (data: CreateLooseEggPalletRequest) => Promise<Pallet>;
}

const sortByDateDesc = (items: Pallet[]) => {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.fechaCreacion || 0).getTime();
    const bDate = new Date(b.fechaCreacion || 0).getTime();
    return bDate - aDate;
  });
};

export const usePalletServerState = (): PalletServerState => {
  const routerLocation = useLocation();
  const activeModule = getDataModuleFromPath(routerLocation.pathname);
  const useV2 = activeModule ? isDataV2Enabled(activeModule) : false;

  const [selectedPallet, setSelectedPallet] = useState<Pallet | null>(null);
  const [packingFilters, setPackingFilters] = useState<ClosedPalletFilters>({});

  const [legacyOpenPallets, setLegacyOpenPallets] = useState<Pallet[]>([]);
  const [legacyClosedPacking, setLegacyClosedPacking] = useState<Pallet[]>([]);
  const [legacyClosedTransit, setLegacyClosedTransit] = useState<Pallet[]>([]);
  const [legacyClosedBodega, setLegacyClosedBodega] = useState<Pallet[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState<string | null>(null);

  const openQuery = useOpenPalletsQuery({ enabled: useV2 });
  const closedPackingQuery = useClosedPalletsQuery('PACKING', packingFilters, {
    enabled: useV2,
  });
  const closedTransitQuery = useClosedPalletsQuery(
    'TRANSITO',
    {},
    { enabled: useV2 }
  );
  const closedBodegaQuery = useClosedPalletsQuery(
    'BODEGA',
    {},
    { enabled: useV2 }
  );

  // Store refetch functions in refs to avoid unstable callback dependencies
  // (query objects change identity every render, causing infinite loops)
  const openRefetch = useRef(openQuery.refetch);
  openRefetch.current = openQuery.refetch;
  const closedPackingRefetch = useRef(closedPackingQuery.refetch);
  closedPackingRefetch.current = closedPackingQuery.refetch;
  const closedTransitRefetch = useRef(closedTransitQuery.refetch);
  closedTransitRefetch.current = closedTransitQuery.refetch;
  const closedBodegaRefetch = useRef(closedBodegaQuery.refetch);
  closedBodegaRefetch.current = closedBodegaQuery.refetch;

  const createMutation = useCreatePalletMutation();
  const createLooseEggMutation = useCreateLooseEggPalletMutation();
  const closeMutation = useClosePalletMutation();
  const closeAllMutation = useCloseAllOpenPalletsMutation();
  const moveMutation = useMovePalletMutation();
  const moveAllTransitMutation = useMoveAllTransitToBodegaMutation();
  const deleteMutation = useDeletePalletMutation();
  const updateMutation = useUpdatePalletMutation();

  // Store mutateAsync in refs to avoid unstable callback dependencies
  const createMutateAsync = useRef(createMutation.mutateAsync);
  createMutateAsync.current = createMutation.mutateAsync;
  const createLooseEggMutateAsync = useRef(createLooseEggMutation.mutateAsync);
  createLooseEggMutateAsync.current = createLooseEggMutation.mutateAsync;
  const closeMutateAsync = useRef(closeMutation.mutateAsync);
  closeMutateAsync.current = closeMutation.mutateAsync;
  const closeAllMutateAsync = useRef(closeAllMutation.mutateAsync);
  closeAllMutateAsync.current = closeAllMutation.mutateAsync;
  const moveMutateAsync = useRef(moveMutation.mutateAsync);
  moveMutateAsync.current = moveMutation.mutateAsync;
  const moveAllTransitMutateAsync = useRef(moveAllTransitMutation.mutateAsync);
  moveAllTransitMutateAsync.current = moveAllTransitMutation.mutateAsync;
  const deleteMutateAsync = useRef(deleteMutation.mutateAsync);
  deleteMutateAsync.current = deleteMutation.mutateAsync;
  const updateMutateAsync = useRef(updateMutation.mutateAsync);
  updateMutateAsync.current = updateMutation.mutateAsync;

  const refreshLegacyOpen = useCallback(async () => {
    setLegacyLoading(true);
    setLegacyError(null);
    try {
      const data = await palletsApi.getOpenPacking();
      setLegacyOpenPallets(sortByDateDesc(data));
    } catch (error) {
      setLegacyError(
        error instanceof Error ? error.message : 'Error al cargar pallets'
      );
    } finally {
      setLegacyLoading(false);
    }
  }, []);

  const refreshLegacyClosed = useCallback(
    async (ubicacion: Location, filters?: ClosedPalletFilters) => {
      setLegacyLoading(true);
      setLegacyError(null);
      try {
        const response = await palletsApi.getClosedByLocation(
          ubicacion,
          filters
        );
        const items = sortByDateDesc(response.items ?? []);
        if (ubicacion === 'PACKING') setLegacyClosedPacking(items);
        if (ubicacion === 'TRANSITO') setLegacyClosedTransit(items);
        if (ubicacion === 'BODEGA') setLegacyClosedBodega(items);
      } catch (error) {
        setLegacyError(
          error instanceof Error
            ? error.message
            : 'Error al cargar pallets cerrados'
        );
      } finally {
        setLegacyLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (useV2) return;

    const moduleKey = activeModule ?? 'packing';

    if (moduleKey === 'packing') {
      // Only fetch what the current route needs
      const path = routerLocation.pathname;
      const needsOpen =
        path.includes('openPallets') ||
        path.includes('createPallet') ||
        path === '/packing' ||
        path === '/packing/';
      const needsClosed =
        path.includes('closedPallets') || path.includes('closed');

      // Default: if no specific route matched, fetch open pallets
      if (needsOpen || (!needsOpen && !needsClosed)) {
        void refreshLegacyOpen();
      }
      if (needsClosed) {
        void refreshLegacyClosed('PACKING', packingFilters);
      }
    }
    if (moduleKey === 'bodega') {
      void refreshLegacyClosed('BODEGA');
    }
    if (moduleKey === 'transito') {
      void refreshLegacyClosed('TRANSITO');
    }
    if (moduleKey === 'sales') {
      void refreshLegacyClosed('BODEGA');
    }
  }, [
    activeModule,
    packingFilters,
    refreshLegacyClosed,
    refreshLegacyOpen,
    routerLocation.pathname,
    useV2,
  ]);

  const fetchPallets = useCallback(
    async (status?: string, location?: Location) => {
      if (status === 'active') {
        if (useV2) {
          await openRefetch.current();
          return;
        }
        await refreshLegacyOpen();
        return;
      }

      if (status === 'completed') {
        const targetLocation = location ?? 'PACKING';
        if (useV2) {
          if (targetLocation === 'PACKING')
            await closedPackingRefetch.current();
          if (targetLocation === 'TRANSITO')
            await closedTransitRefetch.current();
          if (targetLocation === 'BODEGA') await closedBodegaRefetch.current();
          return;
        }
        await refreshLegacyClosed(targetLocation);
        return;
      }

      if (useV2) {
        await Promise.all([
          openRefetch.current(),
          closedPackingRefetch.current(),
          closedTransitRefetch.current(),
          closedBodegaRefetch.current(),
        ]);
        return;
      }

      await Promise.all([
        refreshLegacyOpen(),
        refreshLegacyClosed('PACKING'),
        refreshLegacyClosed('TRANSITO'),
        refreshLegacyClosed('BODEGA'),
      ]);
    },
    [refreshLegacyClosed, refreshLegacyOpen, useV2]
  );

  const fetchActivePallets = useCallback(async () => {
    if (useV2) {
      await openRefetch.current();
      return;
    }
    await refreshLegacyOpen();
  }, [refreshLegacyOpen, useV2]);

  const fetchClosedPalletsInPacking = useCallback(
    async (opts?: {
      fechaDesde?: string;
      fechaHasta?: string;
      limit?: number;
      calibre?: string;
      empresa?: string;
      turno?: string;
      searchTerm?: string;
    }) => {
      setPackingFilters({ ...(opts ?? {}) });
      if (useV2) {
        await closedPackingRefetch.current();
        return;
      }
      await refreshLegacyClosed('PACKING', opts ?? {});
    },
    [refreshLegacyClosed, useV2]
  );

  const fetchClosedPalletsInTransit = useCallback(async () => {
    if (useV2) {
      await closedTransitRefetch.current();
      return;
    }
    await refreshLegacyClosed('TRANSITO');
  }, [refreshLegacyClosed, useV2]);

  const fetchClosedPalletsInBodega = useCallback(async () => {
    if (useV2) {
      await closedBodegaRefetch.current();
      return;
    }
    await refreshLegacyClosed('BODEGA');
  }, [refreshLegacyClosed, useV2]);

  const createPalletAction = useCallback(
    async (data: Partial<Pallet> & { maxBoxes?: number }) => {
      const baseCode = data.baseCode || '';
      const maxBoxes =
        typeof data.maxBoxes === 'number' && data.maxBoxes > 0
          ? data.maxBoxes
          : 60;
      const created = await createMutateAsync.current({ baseCode, maxBoxes });
      if (!useV2) {
        await refreshLegacyOpen();
      }
      return created;
    },
    [refreshLegacyOpen, useV2]
  );

  const updatePalletAction = useCallback(
    async (id: string, data: Partial<Pallet>) => {
      const status = data.estado || 'open';
      const updated = await updateMutateAsync.current({ codigo: id, status });
      if (!useV2) {
        await fetchPallets();
      }
      return updated;
    },
    [fetchPallets, useV2]
  );

  const deletePalletAction = useCallback(
    async (id: string) => {
      await deleteMutateAsync.current(id);
      if (!useV2) {
        await fetchPallets();
      }
    },
    [fetchPallets, useV2]
  );

  const closePalletAction = useCallback(
    async (codigo: string) => {
      await closeMutateAsync.current(codigo);
      if (!useV2) {
        await fetchPallets();
      }
    },
    [fetchPallets, useV2]
  );

  const closeAllOpenPalletsAction = useCallback(
    async (ubicacion: string | string[] = 'PACKING') => {
      const result = await closeAllMutateAsync.current(ubicacion);
      if (!useV2) {
        await fetchPallets();
      }
      return result;
    },
    [fetchPallets, useV2]
  );

  const movePalletAction = useCallback(
    async (codigo: string, location: Location) => {
      await moveMutateAsync.current({ codigo, ubicacion: location });
      if (!useV2) {
        await fetchPallets();
      }
    },
    [fetchPallets, useV2]
  );

  const moveAllTransitToBodegaAction = useCallback(async () => {
    const result = await moveAllTransitMutateAsync.current();
    if (!useV2) {
      await fetchPallets();
    }
    return result;
  }, [fetchPallets, useV2]);

  const createLooseEggPalletAction = useCallback(
    async (data: CreateLooseEggPalletRequest) => {
      const created = await createLooseEggMutateAsync.current(data);
      if (!useV2) {
        await refreshLegacyOpen();
      }
      return created;
    },
    [refreshLegacyOpen, useV2]
  );

  const loading =
    (useV2 &&
      (openQuery.isFetching ||
        closedPackingQuery.isFetching ||
        closedTransitQuery.isFetching ||
        closedBodegaQuery.isFetching ||
        createMutation.isPending ||
        createLooseEggMutation.isPending ||
        closeMutation.isPending ||
        closeAllMutation.isPending ||
        moveMutation.isPending ||
        moveAllTransitMutation.isPending ||
        deleteMutation.isPending ||
        updateMutation.isPending)) ||
    legacyLoading;

  const error = useMemo(() => {
    if (!useV2) return legacyError;

    const firstError =
      openQuery.error ||
      closedPackingQuery.error ||
      closedTransitQuery.error ||
      closedBodegaQuery.error ||
      createMutation.error ||
      createLooseEggMutation.error ||
      closeMutation.error ||
      closeAllMutation.error ||
      moveMutation.error ||
      moveAllTransitMutation.error ||
      deleteMutation.error ||
      updateMutation.error;

    if (!firstError) return null;
    return firstError instanceof Error
      ? firstError.message
      : 'Error de pallets';
  }, [
    closeAllMutation.error,
    closeMutation.error,
    closedBodegaQuery.error,
    closedPackingQuery.error,
    closedTransitQuery.error,
    createLooseEggMutation.error,
    createMutation.error,
    deleteMutation.error,
    legacyError,
    moveAllTransitMutation.error,
    moveMutation.error,
    openQuery.error,
    updateMutation.error,
    useV2,
  ]);

  return {
    openPallets: useV2 ? (openQuery.data ?? []) : legacyOpenPallets,
    closedPalletsInPacking: useV2
      ? (closedPackingQuery.data?.items ?? [])
      : legacyClosedPacking,
    closedPalletsInTransit: useV2
      ? (closedTransitQuery.data?.items ?? [])
      : legacyClosedTransit,
    closedPalletsInBodega: useV2
      ? (closedBodegaQuery.data?.items ?? [])
      : legacyClosedBodega,
    selectedPallet,
    loading,
    error,
    fetchPallets,
    fetchActivePallets,
    fetchClosedPalletsInPacking,
    fetchClosedPalletsInTransit,
    fetchClosedPalletsInBodega,
    selectPallet: setSelectedPallet,
    clearSelectedPallet: () => setSelectedPallet(null),
    createPallet: createPalletAction,
    updatePallet: updatePalletAction,
    deletePallet: deletePalletAction,
    closePallet: closePalletAction,
    closeAllOpenPallets: closeAllOpenPalletsAction,
    movePallet: movePalletAction,
    moveAllPalletsFromTransitToBodega: moveAllTransitToBodegaAction,
    createLooseEggPallet: createLooseEggPalletAction,
  };
};
