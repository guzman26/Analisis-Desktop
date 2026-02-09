import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { palletsApi, type ClosedPalletFilters } from '../api/palletsApi';
import { inventoryPalletKeys } from '../keys';
import { mapPalletList } from '../mappers/palletMappers';
import type { Location } from '@/types';

export const useOpenPalletsQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: inventoryPalletKeys.open(),
    queryFn: palletsApi.getOpenPacking,
    select: mapPalletList,
    enabled: options?.enabled ?? true,
  });
};

export const useClosedPalletsQuery = (
  ubicacion: Location,
  filters: ClosedPalletFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: inventoryPalletKeys.closed(ubicacion, filters),
    queryFn: async () => {
      const response = await palletsApi.getClosedByLocation(ubicacion, filters);
      return {
        items: mapPalletList(response.items ?? []),
        nextKey: response.nextKey ?? null,
        count: response.count ?? 0,
      };
    },
    enabled: options?.enabled ?? true,
  });
};

export const useClosedPalletsInfiniteQuery = (
  ubicacion: Location,
  filters: ClosedPalletFilters,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: inventoryPalletKeys.closed(ubicacion, filters),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await palletsApi.getClosedByLocation(ubicacion, {
        ...filters,
        lastKey: pageParam ?? undefined,
      });
      return {
        items: mapPalletList(response.items ?? []),
        nextKey: response.nextKey ?? null,
        count: response.count ?? 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextKey ?? undefined,
    enabled: options?.enabled ?? true,
  });
};
