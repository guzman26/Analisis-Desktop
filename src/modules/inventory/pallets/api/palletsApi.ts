import {
  auditPallet,
  closeAllOpenPallets,
  closePallet,
  createLooseEggPallet,
  createPallet,
  deletePallet,
  getActivePallets,
  getClosedPallets,
  getPalletByCode,
  getPallets,
  moveBoxBetweenPallets,
  moveMultipleBoxesBetweenPallets,
  moveAllPalletsFromTransitToBodega,
  movePallet,
  updatePalletStatus,
} from '@/api/endpoints';
import type {
  CreateLooseEggPalletRequest,
  Location,
  PaginatedResponse,
  Pallet,
} from '@/types';
import { toDomainErrorException } from '@/modules/core';

export interface ClosedPalletFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  calibre?: string;
  empresa?: string;
  turno?: string;
  searchTerm?: string;
  limit?: number;
  lastKey?: string;
}

export const palletsApi = {
  getOpenPacking: async (): Promise<Pallet[]> => {
    try {
      const response = await getActivePallets({
        ubicacion: 'PACKING',
        limit: 300,
      });
      return response.items ?? [];
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getClosedByLocation: async (
    ubicacion: Location,
    filters: ClosedPalletFilters = {}
  ): Promise<PaginatedResponse<Pallet>> => {
    try {
      return await getClosedPallets({
        ubicacion,
        limit: filters.limit ?? 200,
        lastKey: filters.lastKey,
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
        calibre: filters.calibre,
        empresa: filters.empresa,
        turno: filters.turno,
        searchTerm: filters.searchTerm,
      });
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getPallets: async (): Promise<PaginatedResponse<Pallet>> => {
    try {
      return await getPallets();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getByCode: async (codigo: string): Promise<Pallet | null> => {
    try {
      return await getPalletByCode(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  create: async (baseCode: string, maxBoxes: number): Promise<Pallet> => {
    try {
      return await createPallet(baseCode, maxBoxes);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  createLooseEgg: async (payload: CreateLooseEggPalletRequest): Promise<Pallet> => {
    try {
      return await createLooseEggPallet(payload);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  close: async (codigo: string): Promise<unknown> => {
    try {
      return await closePallet(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  closeAllOpen: async (ubicacion: string | string[] = 'PACKING') => {
    try {
      return await closeAllOpenPallets(ubicacion);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  move: async (codigo: string, ubicacion: Location): Promise<Pallet> => {
    try {
      return await movePallet(codigo, ubicacion);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveAllTransitToBodega: async () => {
    try {
      return await moveAllPalletsFromTransitToBodega();
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  remove: async (codigo: string): Promise<unknown> => {
    try {
      return await deletePallet(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  updateStatus: async (codigo: string, status: string): Promise<Pallet> => {
    try {
      return await updatePalletStatus(codigo, status);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  audit: async (codigo: string, scannedBoxes: string[] = []) => {
    try {
      return await auditPallet(codigo, scannedBoxes);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveBoxBetweenPallets: async (boxCode: string, palletCode: string) => {
    try {
      return await moveBoxBetweenPallets(boxCode, palletCode);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  moveMultipleBoxesBetweenPallets: async (
    boxCodes: string[],
    palletCode: string
  ) => {
    try {
      return await moveMultipleBoxesBetweenPallets(boxCodes, palletCode);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
