import { createModuleQueryKeyFactory } from '@/modules/core';

const base = createModuleQueryKeyFactory('customers');

export const customerKeys = {
  ...base,
  all: base.all,
  lists: base.lists,
  list: base.list,
  details: base.details,
  detail: base.detail,
  preferences: (customerId: string) =>
    [...base.details(), 'preferences', customerId] as const,
};
