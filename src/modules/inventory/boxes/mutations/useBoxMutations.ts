import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BoxFilterParams, Location } from '@/types';
import { boxesApi } from '../api/boxesApi';
import { inventoryBoxKeys } from '../keys';
import { inventoryPalletKeys } from '@/modules/inventory/pallets/keys';

const invalidateBoxes = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
};

export const useCreateSingleBoxPalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { boxCode: string; ubicacion: Location }) =>
      boxesApi.createSingleBoxPallet(payload.boxCode, payload.ubicacion),
    onSuccess: async () => {
      await invalidateBoxes(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryPalletKeys.all });
    },
  });
};

export const useSearchCompatibleForSingleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      boxCode: string;
      ubicacion: Location;
      autoAssign?: boolean;
    }) => boxesApi.searchCompatibleForSingle(
      payload.boxCode,
      payload.ubicacion,
      payload.autoAssign ?? true
    ),
    onSuccess: async () => {
      await invalidateBoxes(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryPalletKeys.all });
    },
  });
};

export const useSearchCompatibleForAllMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      ubicacion: Location;
      filters?: BoxFilterParams;
    }) => boxesApi.searchCompatibleForAll(payload.ubicacion, payload.filters),
    onSuccess: async () => {
      await invalidateBoxes(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryPalletKeys.all });
    },
  });
};

export const useDeleteBoxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codigo: string) => boxesApi.remove(codigo),
    onSuccess: async () => {
      await invalidateBoxes(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryPalletKeys.all });
    },
  });
};
