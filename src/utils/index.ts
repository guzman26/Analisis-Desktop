// Barrel export for utilities
export * from './extractDataFromResponse';
export * from './formatDate';
export * from './getParamsFromCodigo';
export * from './validators';
import { EggInfo } from '@/types';

/**
 * Procesa la información personalizada de una caja desde el formato de la API
 * al formato más limpio para usar en la aplicación
 */
export const processBoxCustomInfo = (rawCustomInfo: any[]): EggInfo[] => {
  if (!Array.isArray(rawCustomInfo)) {
    return [];
  }

  return rawCustomInfo
    .map((item) => {
      // El formato de la API es: [ { "L" : [ { "S" : "code" }, { "N" : "quantity" } ] } ]
      if (item.L && Array.isArray(item.L) && item.L.length >= 2) {
        const codeItem = item.L[0];
        const quantityItem = item.L[1];

        const code = codeItem.S || '';
        const quantity = parseInt(quantityItem.N || '0', 10);

        return { code, quantity };
      }

      return { code: '', quantity: 0 };
    })
    .filter((item) => item.code && item.quantity > 0);
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
