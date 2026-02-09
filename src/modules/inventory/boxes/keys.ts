import { createModuleQueryKeyFactory } from '@/modules/core';

const base = createModuleQueryKeyFactory('inventory-boxes');

export const inventoryBoxKeys = {
  ...base,
  unassigned: (params: { ubicacion: string; filters?: object }) =>
    [
      ...base.lists(),
      'unassigned',
      params.ubicacion,
      params.filters ?? {},
    ] as const,
};
