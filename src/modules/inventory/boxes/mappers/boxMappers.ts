import type { Box } from '@/types';

export const mapBoxList = (items: Box[] = []): Box[] => {
  return [...items].sort((a, b) => {
    const dateA = (a as any).fecha_registro || (a as any).fechaCreacion || '';
    const dateB = (b as any).fecha_registro || (b as any).fechaCreacion || '';
    return String(dateB).localeCompare(String(dateA));
  });
};
