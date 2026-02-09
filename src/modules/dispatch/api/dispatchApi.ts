import {
  approveDispatch,
  cancelDispatch,
  createDispatch,
  getDispatchById,
  getDispatches,
  updateDispatch,
} from '@/api/endpoints';
import type {
  CreateDispatchRequest,
  Dispatch,
  PaginatedResponse,
  UpdateDispatchRequest,
} from '@/types';
import type { DispatchFilters } from '@/modules/dispatch/model/types';
import { toDomainErrorException } from '@/modules/core';
import {
  dispatchAdapter,
  mapDispatchList,
} from '@/modules/dispatch/mappers/dispatchMappers';

interface GetDispatchesInput extends DispatchFilters {
  limit?: number;
  lastKey?: string;
}

export const dispatchApi = {
  list: async (
    params: GetDispatchesInput = {}
  ): Promise<PaginatedResponse<Dispatch>> => {
    try {
      const response = await getDispatches(params);
      return {
        ...response,
        items: mapDispatchList(response.items as Dispatch[]),
      };
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getById: async (id: string): Promise<Dispatch> => {
    try {
      const response = await getDispatchById(id);
      return dispatchAdapter.fromDto(response);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  create: async (data: CreateDispatchRequest): Promise<Dispatch> => {
    try {
      const response = await createDispatch(data);
      return dispatchAdapter.fromDto(response);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  update: async (
    id: string,
    updates: UpdateDispatchRequest,
    userId: string
  ): Promise<Dispatch> => {
    try {
      const response = await updateDispatch(id, updates, userId);
      return dispatchAdapter.fromDto(response);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  approve: async (id: string, userId: string): Promise<Dispatch> => {
    try {
      const response = await approveDispatch(id, userId);
      return dispatchAdapter.fromDto(response);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  cancel: async (
    id: string,
    userId: string,
    reason?: string
  ): Promise<Dispatch> => {
    try {
      const response = await cancelDispatch(id, userId, reason);
      return dispatchAdapter.fromDto(response);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
