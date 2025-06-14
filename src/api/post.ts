import { apiRequest } from './api';
import { Pallet } from '@/types';

export const createPallet = async (
  baseCode: string,
  ubicacion: 'PACKING' | 'TRANSITO' | 'BODEGA' | 'VENTA' = 'PACKING'
): Promise<Pallet> => {
  return await apiRequest('/pallets', {
    method: 'POST',
    body: JSON.stringify({ baseCode, ubicacion }),
  });
};

export const movePallet = async (
  codigo: string,
  ubicacion: 'TRANSITO' | 'BODEGA' | 'VENTA'
): Promise<any> => {
  if (!/^\d{12}$/.test(codigo)) {
    throw new Error('Pallet code must be 12 digits');
  }

  if (!['TRANSITO', 'BODEGA', 'VENTA', 'PACKING'].includes(ubicacion)) {
    throw new Error('Location must be one of: TRANSITO, BODEGA, VENTA');
  }

  return await apiRequest('/movePallet', {
    method: 'POST',
    body: JSON.stringify({ codigo, ubicacion }),
  });
};