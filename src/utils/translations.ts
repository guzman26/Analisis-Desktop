import { PalletState } from '@/types';

// Función para traducir estados de pallets al español
export const translateStatus = (status: PalletState): string => {
  const translations: Record<PalletState, string> = {
    open: 'Abierto',
    closed: 'Cerrado',
  };

  return translations[status] || status;
};

// Función para traducir ubicaciones al español
export const translateLocation = (location: string): string => {
  const locationTranslations: Record<string, string> = {
    PACKING: 'Empaque',
    TRANSITO: 'Tránsito',
    BODEGA: 'Bodega',
    VENTA: 'Venta',
  };

  return locationTranslations[location] || location;
};

// Función para traducir tipos de venta al español
export const translateSaleType = (type: string): string => {
  const saleTypeTranslations: Record<string, string> = {
    Venta: 'Venta',
    Reposición: 'Reposición',
    Donación: 'Donación',
    Inutilizado: 'Inutilizado',
    Ración: 'Ración',
  };

  return saleTypeTranslations[type] || type;
};

// Función para traducir estados de venta al español
export const translateSaleState = (state: string): string => {
  const saleStateTranslations: Record<string, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
  };

  return saleStateTranslations[state] || state;
};
