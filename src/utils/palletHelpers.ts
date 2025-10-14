import { Pallet } from '@/types';

/**
 * Get boxes array from pallet, handling both 'cajas' and 'boxes' field names
 * Returns empty array if neither exists
 */
export function getPalletBoxes(pallet: Pallet): string[] {
  return pallet.boxes ?? pallet.cajas ?? [];
}

/**
 * Get box count from pallet, using cantidadCajas or falling back to array length
 */
export function getPalletBoxCount(pallet: Pallet): number {
  if (pallet.cantidadCajas !== undefined) {
    return pallet.cantidadCajas;
  }
  return getPalletBoxes(pallet).length;
}
