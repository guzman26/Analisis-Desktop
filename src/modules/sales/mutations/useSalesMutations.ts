import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SaleRequest } from '@/types';
import { salesApi } from '../api/salesApi';
import { salesKeys } from '../queries/keys';

const invalidateSalesLists = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
};

export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaleRequest) => salesApi.create(payload),
    onSuccess: async () => {
      await invalidateSalesLists(queryClient);
      await queryClient.invalidateQueries({ queryKey: salesKeys.orders('DRAFT') });
    },
  });
};

export const useConfirmSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => salesApi.confirm(saleId),
    onSuccess: async (_result, saleId) => {
      await queryClient.invalidateQueries({ queryKey: salesKeys.orders('DRAFT') });
      await queryClient.invalidateQueries({ queryKey: salesKeys.orders('CONFIRMED') });
      await queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(saleId) });
    },
  });
};

export const useDispatchSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saleId: string; notes?: string }) =>
      salesApi.dispatch(payload.saleId, payload.notes),
    onSuccess: async (_result, payload) => {
      await queryClient.invalidateQueries({ queryKey: salesKeys.orders('CONFIRMED') });
      await queryClient.invalidateQueries({
        queryKey: salesKeys.orderDetail(payload.saleId),
      });
    },
  });
};

export const useCompleteSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saleId: string; notes?: string }) =>
      salesApi.complete(payload.saleId, payload.notes),
    onSuccess: async (_result, payload) => {
      await queryClient.invalidateQueries({ queryKey: salesKeys.orders('CONFIRMED') });
      await queryClient.invalidateQueries({
        queryKey: salesKeys.orderDetail(payload.saleId),
      });
    },
  });
};
