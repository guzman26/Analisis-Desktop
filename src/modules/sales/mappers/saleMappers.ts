import type { Sale } from '@/types';

export const mapSalesList = (items: Sale[] = []): Sale[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
};
