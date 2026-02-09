import {
  createSingleBoxPallet,
  deleteBox,
  getBoxByCode,
  getCompatiblePalletsForAllUnassignedBoxes,
  getCompatiblePalletsForSingleBox,
  getUnassignedBoxesByLocation,
} from '@/api/endpoints';
import type { Box, BoxFilterParams, Location, PaginatedResponse } from '@/types';
import { toDomainErrorException } from '@/modules/core';

export interface GetUnassignedBoxesInput {
  ubicacion: Location;
  limit?: number;
  lastKey?: string;
  filters?: BoxFilterParams;
}

export const boxesApi = {
  getByCode: async (codigo: string): Promise<Box> => {
    try {
      return await getBoxByCode(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getUnassigned: async (
    input: GetUnassignedBoxesInput
  ): Promise<PaginatedResponse<Box>> => {
    try {
      return await getUnassignedBoxesByLocation({
        ubicacion: input.ubicacion,
        limit: input.limit ?? 50,
        lastKey: input.lastKey,
        ...(input.filters ?? {}),
      });
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  createSingleBoxPallet: async (boxCode: string, ubicacion: Location) => {
    try {
      return await createSingleBoxPallet(boxCode, ubicacion);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  searchCompatibleForSingle: async (
    boxCode: string,
    ubicacion: Location,
    autoAssign = true
  ) => {
    try {
      return await getCompatiblePalletsForSingleBox(boxCode, ubicacion, autoAssign);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  searchCompatibleForAll: async (ubicacion: Location, filters?: BoxFilterParams) => {
    try {
      return await getCompatiblePalletsForAllUnassignedBoxes({ ubicacion, filters });
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  remove: async (codigo: string) => {
    try {
      return await deleteBox(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
