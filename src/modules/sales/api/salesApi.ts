import {
  addBoxesToSale,
  completeSale,
  confirmSale,
  createSale,
  dispatchSale,
  getSaleById,
  getSalesOrders,
  returnBoxes,
} from '@/api/endpoints';
import type {
  AddBoxesToSaleRequest,
  GetSalesOrdersParamsPaginated,
  PaginatedResponse,
  ReturnBoxesRequest,
  Sale,
  SaleRequest,
} from '@/types';
import { toDomainErrorException } from '@/modules/core';

export type SalesOrderState = 'DRAFT' | 'CONFIRMED';

export const salesApi = {
  getOrders: async (
    state: SalesOrderState,
    params: Omit<GetSalesOrdersParamsPaginated, 'state'> = {}
  ): Promise<PaginatedResponse<Sale>> => {
    try {
      return await getSalesOrders({
        ...params,
        state,
        limit: params.limit ?? 20,
      });
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getById: async (saleId: string): Promise<Sale> => {
    try {
      return await getSaleById(saleId);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  create: async (payload: SaleRequest): Promise<Sale> => {
    try {
      return await createSale(payload);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  confirm: async (saleId: string) => {
    try {
      return await confirmSale(saleId);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  dispatch: async (saleId: string, notes?: string) => {
    try {
      return await dispatchSale(saleId, notes);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  complete: async (saleId: string, notes?: string) => {
    try {
      return await completeSale(saleId, notes);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  returnBoxes: async (payload: ReturnBoxesRequest): Promise<Sale> => {
    try {
      return await returnBoxes(payload);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  addBoxesToSale: async (payload: AddBoxesToSaleRequest): Promise<Sale> => {
    try {
      return await addBoxesToSale(payload);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
