import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CustomerFormData, GetCustomersParams } from '@/types';
import { customersApi } from '@/modules/customers/api/customersApi';
import { customerKeys } from './keys';

export const useCustomersQuery = (params?: GetCustomersParams) =>
  useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.list(params),
  });

export const useCustomerByIdQuery = (customerId?: string | null) =>
  useQuery({
    queryKey: customerKeys.detail(customerId ?? ''),
    queryFn: () => (customerId ? customersApi.getById(customerId) : null),
    enabled: Boolean(customerId),
  });

export const useCustomerPreferencesQuery = (customerId?: string | null) =>
  useQuery({
    queryKey: customerKeys.preferences(customerId ?? ''),
    queryFn: () =>
      customerId
        ? customersApi.getPreferences(customerId)
        : Promise.resolve(undefined),
    enabled: Boolean(customerId),
  });

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerFormData) => customersApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};
