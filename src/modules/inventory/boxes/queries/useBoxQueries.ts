import { useInfiniteQuery } from '@tanstack/react-query';
import type { BoxFilterParams, Location } from '@/types';
import { boxesApi } from '../api/boxesApi';
import { inventoryBoxKeys } from '../keys';
import { mapBoxList } from '../mappers/boxMappers';

interface UseUnassignedBoxesInfiniteParams {
  ubicacion: Location;
  filters?: BoxFilterParams;
  limit?: number;
  enabled?: boolean;
}

export const useUnassignedBoxesInfiniteQuery = (
  params: UseUnassignedBoxesInfiniteParams
) => {
  return useInfiniteQuery({
    queryKey: inventoryBoxKeys.unassigned({
      ubicacion: params.ubicacion,
      filters: params.filters,
    }),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await boxesApi.getUnassigned({
        ubicacion: params.ubicacion,
        filters: params.filters,
        limit: params.limit,
        lastKey: pageParam ?? undefined,
      });

      return {
        items: mapBoxList(response.items ?? []),
        nextKey: response.nextKey ?? null,
        count: response.count ?? 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextKey ?? undefined,
    enabled: params.enabled ?? true,
  });
};
