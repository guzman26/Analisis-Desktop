import { createModuleQueryKeyFactory } from '@/modules/core';

const base = createModuleQueryKeyFactory('carts');

export const cartKeys = {
  ...base,
  byLocation: (ubicacion: string) => [...base.lists(), ubicacion] as const,
};
