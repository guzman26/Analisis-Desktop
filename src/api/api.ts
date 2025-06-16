// Simple API that connects to your backend lambda function
import { isValidPalletState, isValidLocation } from '../utils/validators';
import { Pallet, GetPalletsParams } from '@/types';
// Types matching your backend exactly

// Get API URL from environment
export const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL not found in environment variables');
}

// Simple HTTP client
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Simple validation
export const validateQuery = (params: GetPalletsParams) => {
  if (params.estado && !isValidPalletState(params.estado)) {
    throw new Error('Invalid state. Must be one of: open, closed');
  }
  if (params.ubicacion && !isValidLocation(params.ubicacion)) {
    throw new Error(
      'Invalid location. Must be one of: PACKING, TRANSITO, BODEGA, VENTA'
    );
  }
};

export const getOpenPallets = async (): Promise<Pallet[]> => {
  return await apiRequest('/pallets/open');
};

export const togglePalletStatus = async (codigo: string): Promise<Pallet> => {
  return await apiRequest(`/pallets/${codigo}/toggle`, {
    method: 'PUT',
  });
};

export const closePallet = async (codigo: string): Promise<Pallet> => {
  return await apiRequest(`/pallets/${codigo}/close`, {
    method: 'PUT',
  });
};

export const addBoxToPallet = async (
  palletId: string,
  boxCode: string
): Promise<Pallet> => {
  return await apiRequest(`/pallets/${palletId}/boxes`, {
    method: 'POST',
    body: JSON.stringify({ boxCode }),
  });
};

export const movePalletWithBoxes = async (
  codigoPallet: string,
  destino: 'TRANSITO' | 'BODEGA' | 'VENTA'
): Promise<{ boxesUpdated: number }> => {
  return await apiRequest(`/pallets/${codigoPallet}/move`, {
    method: 'PUT',
    body: JSON.stringify({ destino }),
  });
};

export const deletePalletCascade = async (
  codigo: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  return await apiRequest(`/pallets/${codigo}`, {
    method: 'DELETE',
  });
};

// Your original endpoint structure (if you still want it)
export const endpoints = {
  '/pallets/open': getOpenPallets,
  '/pallets/toggle': togglePalletStatus,
};
