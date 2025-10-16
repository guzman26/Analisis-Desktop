import React, { createContext, ReactNode, useCallback } from 'react';
import { GetSalesOrdersParamsPaginated, Sale } from '@/types';
import { getSalesOrders } from '@/api/endpoints';
import usePagination from '@/hooks/usePagination';

// Interfaz para los datos paginados de sales orders
interface PaginatedSalesOrdersData {
  data: Sale[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface SalesContextType {
  salesOrdersDRAFTPaginated: PaginatedSalesOrdersData;
  salesOrdersCONFIRMEDPaginated: PaginatedSalesOrdersData;
  refreshAllSales: () => void;
}

export const SalesContext = createContext<SalesContextType>(
  {} as SalesContextType
);

interface Props {
  children: ReactNode;
}

export const SalesProvider: React.FC<Props> = ({ children }) => {
  // Hook de paginación específico para sales orders
  const salesOrdersDRAFTPaginatedHook = usePagination<Sale>({
    fetchFunction: async (params: GetSalesOrdersParamsPaginated) => {
      const response = await getSalesOrders({
        ...params,
        state: 'DRAFT',
      });

      return {
        data: {
          items: response.items || [],
          nextKey: response.nextKey,
          count: response.count || 0,
        },
      };
    },
  });

  const salesOrdersCONFIRMEDPaginatedHook = usePagination<Sale>({
    fetchFunction: async (params: GetSalesOrdersParamsPaginated) => {
      const response = await getSalesOrders({
        ...params,
        state: 'CONFIRMED',
      });
      return {
        data: {
          items: response.items || [],
          nextKey: response.nextKey,
          count: response.count || 0,
        },
      };
    },
  });

  const refreshAllSales = useCallback(() => {
    salesOrdersDRAFTPaginatedHook.refresh({});
    salesOrdersCONFIRMEDPaginatedHook.refresh({});
  }, [salesOrdersDRAFTPaginatedHook, salesOrdersCONFIRMEDPaginatedHook]);

  const value: SalesContextType = {
    salesOrdersDRAFTPaginated: {
      data: salesOrdersDRAFTPaginatedHook.data,
      loading: salesOrdersDRAFTPaginatedHook.loading,
      error: salesOrdersDRAFTPaginatedHook.error,
      hasMore: salesOrdersDRAFTPaginatedHook.hasMore,
      loadMore: salesOrdersDRAFTPaginatedHook.loadMore,
      refresh: () => salesOrdersDRAFTPaginatedHook.refresh({}),
    },
    salesOrdersCONFIRMEDPaginated: {
      data: salesOrdersCONFIRMEDPaginatedHook.data,
      loading: salesOrdersCONFIRMEDPaginatedHook.loading,
      error: salesOrdersCONFIRMEDPaginatedHook.error,
      hasMore: salesOrdersCONFIRMEDPaginatedHook.hasMore,
      loadMore: salesOrdersCONFIRMEDPaginatedHook.loadMore,
      refresh: () => salesOrdersCONFIRMEDPaginatedHook.refresh({}),
    },
    refreshAllSales,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};
