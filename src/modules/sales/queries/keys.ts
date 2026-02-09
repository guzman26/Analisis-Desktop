import { createModuleQueryKeyFactory } from '@/modules/core';

const base = createModuleQueryKeyFactory('sales');

export const salesKeys = {
  ...base,
  orders: (state: 'DRAFT' | 'CONFIRMED', filters?: Record<string, unknown>) =>
    [...base.lists(), 'orders', state, filters ?? {}] as const,
  orderDetail: (saleId: string) => [...base.details(), saleId] as const,
};
