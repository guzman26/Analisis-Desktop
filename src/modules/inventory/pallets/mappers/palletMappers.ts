import type { Pallet } from '@/types';

export const mapPalletList = (items: Pallet[] = []): Pallet[] => {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.fechaCreacion || 0).getTime();
    const bDate = new Date(b.fechaCreacion || 0).getTime();
    return bDate - aDate;
  });
};
