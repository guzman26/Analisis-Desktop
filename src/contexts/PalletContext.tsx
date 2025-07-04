import { createContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { Pallet, GetPalletsParamsPaginated, PalletState, Location } from '@/types';
import { getPallets, movePallet } from '@/api/endpoints';
import { extractDataFromResponse, getCalibreFromCodigo } from '@/utils';
import { usePagination } from '@/hooks/usePagination';

// Interfaz para los datos paginados de activePallets
interface PaginatedPalletsData {
  data: Pallet[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface PalletContextType {
  movePalletFunction: (codigo: string, ubicacion: Exclude<Location, 'PACKING'>) => Promise<any>;
  palletsInBodega: Pallet[];
  fetchPalletsInBodega: () => Promise<void>;
  activePalletsPaginated: PaginatedPalletsData;
  closedPalletsInPackingPaginated: PaginatedPalletsData;
  closedPalletsInTransitPaginated: PaginatedPalletsData;
  closedPalletsInBodegaPaginated: PaginatedPalletsData;
}

export const PalletContext = createContext<PalletContextType>({} as PalletContextType);

export const PalletProvider = ({ children }: { children: ReactNode }) => {
  const [palletsInBodega, setPalletsInBodega] = useState<Pallet[]>([]);

  // Generic hook creator for paginated pallets
  const createPaginatedPalletsHook = (estado?: PalletState, ubicacion?: Location) =>
    usePagination<Pallet>({
      fetchFunction: (params: GetPalletsParamsPaginated) =>
        getPallets({ estado, ubicacion, ...params }),
    });

  // Create hooks for different pallet states/locations
  const activePallets = createPaginatedPalletsHook('open');
  const closedPackingPallets = createPaginatedPalletsHook('closed', 'PACKING');
  const closedTransitPallets = createPaginatedPalletsHook('closed', 'TRANSITO');
  const closedBodegaPallets = createPaginatedPalletsHook('closed', 'BODEGA');

  // Helper to add calibre to pallets
  const addCalibreToPallets = useCallback((pallets: Pallet[]): Pallet[] =>
    pallets.map(pallet => ({
      ...pallet,
      calibre: getCalibreFromCodigo(pallet.codigo),
    })), []
  );

  // Helper to create paginated data with calibre
  const createPaginatedData = (hook: ReturnType<typeof createPaginatedPalletsHook>): PaginatedPalletsData => ({
    data: addCalibreToPallets(hook.data),
    loading: hook.loading,
    error: hook.error,
    hasMore: hook.hasMore,
    loadMore: hook.loadMore,
    refresh: () => hook.refresh({}),
  });

  const movePalletFunction = useCallback(
    async (codigo: string, ubicacion: Exclude<Location, 'PACKING'>) =>
      await movePallet(codigo, ubicacion),
    []
  );

  const fetchPalletsInBodega = useCallback(async () => {
    try {
      const response = await getPallets({ ubicacion: 'BODEGA' });
      const pallets = extractDataFromResponse(response);
      setPalletsInBodega(addCalibreToPallets(pallets));
    } catch (error) {
      console.error('Error fetching pallets in bodega:', error);
      setPalletsInBodega([]);
    }
  }, [addCalibreToPallets]);

  const value = useMemo<PalletContextType>(() => ({
    movePalletFunction,
    palletsInBodega,
    fetchPalletsInBodega,
    activePalletsPaginated: createPaginatedData(activePallets),
    closedPalletsInPackingPaginated: createPaginatedData(closedPackingPallets),
    closedPalletsInTransitPaginated: createPaginatedData(closedTransitPallets),
    closedPalletsInBodegaPaginated: createPaginatedData(closedBodegaPallets),
  }), [
    movePalletFunction,
    palletsInBodega,
    fetchPalletsInBodega,
    activePallets,
    closedPackingPallets,
    closedTransitPallets,
    closedBodegaPallets,
    addCalibreToPallets,
  ]);

  return <PalletContext.Provider value={value}>{children}</PalletContext.Provider>;
};
