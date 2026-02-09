import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateLooseEggPalletRequest, Location, Pallet } from '@/types';
import { palletsApi } from '../api/palletsApi';
import { inventoryPalletKeys } from '../keys';
import { inventoryBoxKeys } from '@/modules/inventory/boxes/keys';

const invalidatePalletLists = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: inventoryPalletKeys.all });
};

export const useCreatePalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { baseCode: string; maxBoxes: number }) =>
      palletsApi.create(payload.baseCode, payload.maxBoxes),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
    },
  });
};

export const useCreateLooseEggPalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLooseEggPalletRequest) =>
      palletsApi.createLooseEgg(payload),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
    },
  });
};

export const useClosePalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codigo: string) => palletsApi.close(codigo),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
    },
  });
};

export const useCloseAllOpenPalletsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ubicacion: string | string[] = 'PACKING') =>
      palletsApi.closeAllOpen(ubicacion),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
    },
  });
};

export const useMovePalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { codigo: string; ubicacion: Location }) =>
      palletsApi.move(payload.codigo, payload.ubicacion),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
    },
  });
};

export const useMoveAllTransitToBodegaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: palletsApi.moveAllTransitToBodega,
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
    },
  });
};

export const useDeletePalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codigo: string) => palletsApi.remove(codigo),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: inventoryBoxKeys.all });
    },
  });
};

export const useUpdatePalletMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { codigo: string; status: string }) =>
      palletsApi.updateStatus(payload.codigo, payload.status),
    onSuccess: async () => {
      await invalidatePalletLists(queryClient);
    },
  });
};

export const usePalletSelectionState = () => {
  const setSelected = (pallet: Pallet | null) => pallet;
  return {
    setSelected,
  };
};
