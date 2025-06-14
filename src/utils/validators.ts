// Simple validators matching your backend logic
export const isValidPalletCode = (code: string): boolean => {
  return /^\d{12}$/.test(code);
};

export const isValidBaseCode = (baseCode: string): boolean => {
  return /^\d{9}$/.test(baseCode);
};

export const isValidPalletState = (state: string): boolean => {
  return ['open', 'closed'].includes(state);
};

export const isValidLocation = (location: string): boolean => {
  return ['PACKING', 'TRANSITO', 'BODEGA', 'VENTA'].includes(location);
};
