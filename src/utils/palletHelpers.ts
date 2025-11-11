import { Pallet } from '@/types';

/**
 * Get boxes array from pallet, handling both 'cajas' and 'boxes' field names
 * Returns empty array if neither exists
 */
export function getPalletBoxes(pallet: Pallet): string[] {
  return pallet.boxes ?? pallet.cajas ?? [];
}

/**
 * Get box count from pallet
 * Prioriza el array real de cajas (fuente de verdad) sobre cantidadCajas
 * que podría estar desactualizado
 */
export function getPalletBoxCount(pallet: Pallet): number {
  const boxes = getPalletBoxes(pallet);
  // Si hay array de cajas, usar su longitud (fuente de verdad)
  if (boxes.length > 0) {
    return boxes.length;
  }
  // Si no hay array pero existe cantidadCajas, usar ese valor
  if (pallet.cantidadCajas !== undefined) {
    return pallet.cantidadCajas;
  }
  // Si no hay ninguno, retornar 0
  return 0;
}
