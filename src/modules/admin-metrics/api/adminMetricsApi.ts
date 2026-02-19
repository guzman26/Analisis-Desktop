import { getCustomers, getMetrics, getSalesOrders } from '@/api/endpoints';
import type {
  Customer,
  GetCustomersParams,
  GetSalesOrdersParamsPaginated,
  PaginatedResponse,
  Sale,
} from '@/types';
import { toDomainErrorException } from '@/modules/core';

interface AdminMetric {
  metricType: string;
  dateKey: string;
  date: string;
  data: Record<string, unknown>;
  calculatedAt: string;
  isFinal: boolean;
}

interface MetricsResponse {
  metrics: AdminMetric[];
  summary: {
    totalBoxes: number;
    totalPallets: number;
    totalCarts?: number;
    totalDays: number;
  };
  count: number;
  totalFound: number;
  dateRange: {
    start: string;
    end: string;
  };
  metricType: string;
  timestamp: string;
}

export interface MetricsFilters {
  metricType?: 'PRODUCTION_DAILY' | 'INVENTORY_SNAPSHOT' | 'all';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const adminMetricsApi = {
  getMetrics: async (params?: MetricsFilters): Promise<MetricsResponse> => {
    try {
      return await getMetrics(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getSalesOrders: async (
    params?: GetSalesOrdersParamsPaginated
  ): Promise<PaginatedResponse<Sale>> => {
    try {
      return await getSalesOrders(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getCustomers: async (params?: GetCustomersParams): Promise<Customer[]> => {
    try {
      return await getCustomers(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
