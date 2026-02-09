import { createModuleQueryKeyFactory } from '@/modules/core';

const base = createModuleQueryKeyFactory('inventory-pallets');

export const inventoryPalletKeys = {
  ...base,
  list: (params: { ubicacion?: string; estado?: string; filters?: object }) =>
    [
      ...base.lists(),
      params.ubicacion ?? 'all',
      params.estado ?? 'all',
      params.filters ?? {},
    ] as const,
  open: () => [...base.lists(), 'open', 'PACKING'] as const,
  closed: (ubicacion: string, filters?: object) =>
    [...base.lists(), 'closed', ubicacion, filters ?? {}] as const,
};
