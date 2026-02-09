import {
  backfillMetrics,
  calculateMetricsForDate,
  deleteAllBoxes,
  deleteAllBoxesAsync,
  deleteBoxesByLocationAsync,
  deletePackingBoxesAsync,
  deletePackingPalletsAsync,
  deletePalletsAndAssignedBoxesAsync,
  deleteUnassignedBoxesAsync,
  moveAllPalletsFromBodegaToVenta,
  moveAllPalletsFromTransitToBodega,
  moveAllPalletsFromTransitToVenta,
} from '@/api/endpoints';
import { toDomainErrorException } from '@/modules/core';
import type { Location } from '@/types';

export const adminOpsApi = {
  deleteAllBoxes: async () => {
    try {
      return await deleteAllBoxes();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deletePackingBoxes: async () => {
    try {
      return await deletePackingBoxesAsync();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deleteAllBoxesAsync: async () => {
    try {
      return await deleteAllBoxesAsync();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deletePackingPallets: async () => {
    try {
      return await deletePackingPalletsAsync();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deletePalletsAndAssignedBoxes: async (ubicacion?: Location | 'ALL') => {
    try {
      return await deletePalletsAndAssignedBoxesAsync(
        ubicacion === 'ALL' ? undefined : ubicacion
      );
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deleteUnassignedBoxes: async () => {
    try {
      return await deleteUnassignedBoxesAsync();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  deleteBoxesByLocation: async (ubicacion?: Location | 'ALL') => {
    try {
      return await deleteBoxesByLocationAsync(
        ubicacion === 'ALL' ? undefined : ubicacion
      );
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveAllPalletsFromBodegaToVenta: async () => {
    try {
      return await moveAllPalletsFromBodegaToVenta();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveAllPalletsFromTransitToVenta: async () => {
    try {
      return await moveAllPalletsFromTransitToVenta();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveAllPalletsFromTransitToBodega: async () => {
    try {
      return await moveAllPalletsFromTransitToBodega();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  backfillMetrics: async (params?: {
    startDate?: string;
    endDate?: string;
    metricTypes?: string[];
    forceRecalculate?: boolean;
    markAsFinal?: boolean;
  }) => {
    try {
      return await backfillMetrics(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  calculateMetricsForDate: async (params: {
    date?: string;
    startDate?: string;
    endDate?: string;
    markAsFinal?: boolean;
  }) => {
    try {
      return await calculateMetricsForDate(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
