import { createContext, ReactNode } from 'react';
import { GetSalesOrdersParamsPaginated, Sale } from '@/types';
import { getSalesOrdersPaginated } from '@/api/get';
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
  salesOrdersPaginated: PaginatedSalesOrdersData;
}

export const SalesContext = createContext<SalesContextType>(
  {} as SalesContextType
);

interface Props {
  children: ReactNode;
}

export const SalesProvider: React.FC<Props> = ({ children }) => {
  // Hook de paginación específico para sales orders
  const salesOrdersPaginatedHook = usePagination<Sale>({
    fetchFunction: async (params: GetSalesOrdersParamsPaginated) => {
      const response = await getSalesOrdersPaginated(params);

      const responseData = response as any;

      let salesData;
      if (responseData.body && typeof responseData.body === 'string') {
        // If response has a body string, parse it
        try {
          const bodyData = JSON.parse(responseData.body);
          salesData = bodyData.data || bodyData;
        } catch (error) {
          console.error('SalesContext: Error parsing body:', error);
          salesData = responseData;
        }
      } else {
        // If response is direct data structure
        salesData = responseData;
      }

      return {
        data: {
          items: salesData.salesOrders || [],
          nextKey: salesData.nextKey,
          count: salesData.count || 0,
        },
      };
    },
  });

  const value: SalesContextType = {
    salesOrdersPaginated: {
      data: salesOrdersPaginatedHook.data,
      loading: salesOrdersPaginatedHook.loading,
      error: salesOrdersPaginatedHook.error,
      hasMore: salesOrdersPaginatedHook.hasMore,
      loadMore: salesOrdersPaginatedHook.loadMore,
      refresh: () => salesOrdersPaginatedHook.refresh({}),
    },
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};
