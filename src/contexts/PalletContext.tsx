import { Pallet, GetPalletsParamsPaginated } from '@/types';
import { getPallets, getPalletsPaginated } from '@/api/get';
import { createContext, ReactNode, useState, useCallback } from 'react';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import { movePallet } from '@/api/post';
import { getCalibreFromCodigo } from '@/utils/getParamsFromCodigo';
import usePagination from '@/hooks/usePagination';

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
  movePalletFunction: (
    codigo: string,
    ubicacion: 'TRANSITO' | 'BODEGA' | 'VENTA'
  ) => Promise<any>;
  palletsInBodega: Pallet[];
  fetchPalletsInBodega: () => Promise<void>;

  // Nueva funcionalidad paginada solo para activePallets
  activePalletsPaginated: PaginatedPalletsData;
  closedPalletsInPackingPaginated: PaginatedPalletsData;
  closedPalletsInTransitPaginated: PaginatedPalletsData;
  closedPalletsInBodegaPaginated: PaginatedPalletsData;
}

export const PalletContext = createContext<PalletContextType>(
  {} as PalletContextType
);

interface Props {
  children: ReactNode;
}

export const PalletProvider: React.FC<Props> = ({ children }) => {
  const [palletsInBodega, setPalletsInBodega] = useState<Pallet[]>([]);
  // Función auxiliar para procesar pallets y asignarles el calibre
  const processPalletsWithCalibre = useCallback(
    (pallets: Pallet[]): Pallet[] => {
      return pallets.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      }));
    },
    []
  );

  // Hook de paginación específico para activePallets
  const activePalletsPaginatedHook = usePagination<Pallet>({
    fetchFunction: async (params: GetPalletsParamsPaginated) => {
      const response = await getPalletsPaginated({ estado: 'open', ...params });
      return response;
    },
  });

  const closedPalletsInPackingPaginatedHook = usePagination<Pallet>({
    fetchFunction: async (params: GetPalletsParamsPaginated) => {
      const response = await getPalletsPaginated({
        estado: 'closed',
        ubicacion: 'PACKING',
        ...params,
      });
      return response;
    },
  });

  const closedPalletsInTransitPaginatedHook = usePagination<Pallet>({
    fetchFunction: async (params: GetPalletsParamsPaginated) => {
      const response = await getPalletsPaginated({
        estado: 'closed',
        ubicacion: 'TRANSITO',
        ...params,
      });
      return response;
    },
  });

  const closedPalletsInBodegaPaginatedHook = usePagination<Pallet>({
    fetchFunction: async (params: GetPalletsParamsPaginated) => {
      const response = await getPalletsPaginated({
        estado: 'closed',
        ubicacion: 'BODEGA',
        ...params,
      });
      return response;
    },
  });

  const movePalletFunction = useCallback(
    async (codigo: string, ubicacion: 'TRANSITO' | 'BODEGA' | 'VENTA') => {
      return await movePallet(codigo, ubicacion);
    },
    []
  );

  const fetchPalletsInBodega = useCallback(async () => {
    try {
      const response = await getPallets({ ubicacion: 'BODEGA' });
      const pallets = extractDataFromResponse(response);
      const palletsWithCalibre = processPalletsWithCalibre(pallets);
      setPalletsInBodega(palletsWithCalibre);
    } catch (error) {
      console.error('PalletContext: Error fetching pallets in bodega:', error);
      setPalletsInBodega([]);
    }
  }, [processPalletsWithCalibre]);

  const value: PalletContextType = {
    movePalletFunction,
    palletsInBodega,
    fetchPalletsInBodega,

    // Nueva funcionalidad paginada solo para activePallets
    activePalletsPaginated: {
      data: activePalletsPaginatedHook.data.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      })),
      loading: activePalletsPaginatedHook.loading,
      error: activePalletsPaginatedHook.error,
      hasMore: activePalletsPaginatedHook.hasMore,
      loadMore: activePalletsPaginatedHook.loadMore,
      refresh: () => activePalletsPaginatedHook.refresh({}),
    },
    closedPalletsInPackingPaginated: {
      data: closedPalletsInPackingPaginatedHook.data.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      })),
      loading: closedPalletsInPackingPaginatedHook.loading,
      error: closedPalletsInPackingPaginatedHook.error,
      hasMore: closedPalletsInPackingPaginatedHook.hasMore,
      loadMore: closedPalletsInPackingPaginatedHook.loadMore,
      refresh: () => closedPalletsInPackingPaginatedHook.refresh({}),
    },
    closedPalletsInTransitPaginated: {
      data: closedPalletsInTransitPaginatedHook.data.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      })),
      loading: closedPalletsInTransitPaginatedHook.loading,
      error: closedPalletsInTransitPaginatedHook.error,
      hasMore: closedPalletsInTransitPaginatedHook.hasMore,
      loadMore: closedPalletsInTransitPaginatedHook.loadMore,
      refresh: () => closedPalletsInTransitPaginatedHook.refresh({}),
    },
    closedPalletsInBodegaPaginated: {
      data: closedPalletsInBodegaPaginatedHook.data.map((pallet) => ({
        ...pallet,
        calibre: getCalibreFromCodigo(pallet.codigo),
      })),
      loading: closedPalletsInBodegaPaginatedHook.loading,
      error: closedPalletsInBodegaPaginatedHook.error,
      hasMore: closedPalletsInBodegaPaginatedHook.hasMore,
      loadMore: closedPalletsInBodegaPaginatedHook.loadMore,
      refresh: () => closedPalletsInBodegaPaginatedHook.refresh({}),
    },
  };
  return (
    <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
  );
};
