// Barrel export for utilities
export * from './extractDataFromResponse';
export * from './formatDate';
export * from './getParamsFromCodigo';
export * from './validators';
export * from './company';
export * from './boxCodeParser';
export * from './boxCodeFormatters';
import { EggInfo } from '@/types';

/**
 * Procesa la información personalizada de una caja desde el formato de la API
 * al formato más limpio para usar en la aplicación
 */
export const processBoxCustomInfo = (rawCustomInfo: any[]): EggInfo[] => {
  if (!Array.isArray(rawCustomInfo)) {
    return [];
  }

  const parseEntry = (item: any): EggInfo | null => {
    // Caso 1: Formato DynamoDB: { L: [ { S: code }, { N: quantity } ] }
    if (item && Array.isArray(item.L) && item.L.length >= 2) {
      const codeItem = item.L[0];
      const quantityItem = item.L[1];
      const code =
        (codeItem && (codeItem.S || codeItem.s)) ||
        (typeof codeItem === 'string' ? codeItem : '');
      const quantityRaw = quantityItem && (quantityItem.N || quantityItem.n);
      const quantity = parseInt(String(quantityRaw ?? '0'), 10);
      return code && quantity > 0 ? { code, quantity } : null;
    }

    // Caso 2: Objeto ya normalizado { code, quantity }
    if (
      item &&
      typeof item === 'object' &&
      ('code' in item || 'quantity' in item)
    ) {
      const code = String((item as any).code ?? '');
      const quantity = Number((item as any).quantity ?? 0);
      return code && quantity > 0 ? { code, quantity } : null;
    }

    // Caso 3: Par en arreglo [code, quantity]
    if (Array.isArray(item) && item.length >= 2) {
      const code = String(item[0] ?? '');
      const quantity = Number(item[1] ?? 0);
      return code && quantity > 0 ? { code, quantity } : null;
    }

    // Caso 4: Objeto simple { S: code, N: quantity }
    if (item && typeof item === 'object' && 'S' in item && 'N' in item) {
      const code = String((item as any).S ?? '');
      const quantity = parseInt(String((item as any).N ?? '0'), 10);
      return code && quantity > 0 ? { code, quantity } : null;
    }

    return null;
  };

  return rawCustomInfo.map(parseEntry).filter((e): e is EggInfo => Boolean(e));
};

/**
 * Calcula el total de huevos en una caja basado en customInfo
 */
export const calculateTotalEggs = (customInfo: EggInfo[]): number => {
  return customInfo.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Obtiene el código más frecuente en una caja
 */
export const getMostFrequentCode = (customInfo: EggInfo[]): string => {
  if (!customInfo.length) return '';

  const codeCounts = customInfo.reduce(
    (acc, item) => {
      acc[item.code] = (acc[item.code] || 0) + item.quantity;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(codeCounts).sort(([, a], [, b]) => b - a)[0][0];
};
