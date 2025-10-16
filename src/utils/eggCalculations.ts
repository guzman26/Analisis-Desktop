/**
 * Egg Calculation Utilities
 * Maps box formats to egg counts and provides calculation helpers
 */

import { Box } from '@/types';

// Egg counts per box format based on FIELD_VALUES_REFERENCE.md
export const EGG_COUNT_BY_FORMAT: Record<string, number> = {
  '1': 180, // Formato 1 - 180 unidades
  '2': 100, // Formato 2 - 100 JUMBO
  '3': 12,  // Formato 3 - Docena (12 unidades)
};

/**
 * Get the number of eggs in a box based on its format
 */
export function getEggCountForBox(format: string | number): number {
  const formatStr = String(format);
  return EGG_COUNT_BY_FORMAT[formatStr] || 0;
}

/**
 * Calculate total eggs for a list of boxes
 */
export function calculateTotalEggs(boxes: Array<{ formato_caja?: string; format?: string }>): number {
  return boxes.reduce((total, box) => {
    const format = box.formato_caja || box.format || '1';
    return total + getEggCountForBox(format);
  }, 0);
}

/**
 * Calculate eggs for a specific number of boxes of a given format
 */
export function calculateEggsForBoxCount(boxCount: number, format: string | number): number {
  return boxCount * getEggCountForBox(format);
}

/**
 * Get egg breakdown by format
 */
export interface EggBreakdown {
  format: string;
  boxCount: number;
  eggCount: number;
  eggsPerBox: number;
}

export function getEggBreakdownByFormat(
  boxes: Array<{ formato_caja?: string; format?: string }>
): EggBreakdown[] {
  const formatCounts = new Map<string, number>();

  // Count boxes by format
  boxes.forEach((box) => {
    const format = box.formato_caja || box.format || '1';
    formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
  });

  // Convert to breakdown array
  return Array.from(formatCounts.entries()).map(([format, boxCount]) => ({
    format,
    boxCount,
    eggsPerBox: getEggCountForBox(format),
    eggCount: boxCount * getEggCountForBox(format),
  }));
}

/**
 * Format egg count for display
 */
export function formatEggCount(count: number): string {
  return count.toLocaleString('es-CL');
}

/**
 * Get format label for display
 */
export function getFormatLabel(format: string | number): string {
  const formatStr = String(format);
  const labels: Record<string, string> = {
    '1': 'Formato 1 (180 huevos)',
    '2': 'Formato 2 (100 JUMBO)',
    '3': 'Formato 3 (Docena)',
  };
  return labels[formatStr] || `Formato ${formatStr}`;
}

/**
 * Calculate eggs from box codes by looking up their formats
 * This is useful when you only have box codes and need to fetch their data
 */
export interface BoxEggData {
  boxId: string;
  format: string;
  eggCount: number;
}

export function calculateEggsFromBoxData(boxes: Box[]): {
  totalEggs: number;
  breakdown: EggBreakdown[];
  boxDetails: BoxEggData[];
} {
  const boxDetails: BoxEggData[] = boxes.map((box) => ({
    boxId: box.codigo,
    format: box.formato_caja || '1',
    eggCount: getEggCountForBox(box.formato_caja || '1'),
  }));

  const breakdown = getEggBreakdownByFormat(boxes);
  const totalEggs = boxDetails.reduce((sum, box) => sum + box.eggCount, 0);

  return {
    totalEggs,
    breakdown,
    boxDetails,
  };
}

