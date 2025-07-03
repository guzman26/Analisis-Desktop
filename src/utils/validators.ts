// Simple validators matching your backend logic

/**
 * VALIDADORES PARA CÓDIGOS
 */

export const isValidPalletCode = (code: string): boolean => {
  return /^\d{12}$/.test(code);
};

export const isValidBoxCode = (code: string): boolean => {
  return /^\d{17}$/.test(code);
};

export const isValidCode = (code: string): 'pallet' | 'box' | 'invalid' => {
  if (isValidPalletCode(code)) return 'pallet';
  if (isValidBoxCode(code)) return 'box';
  return 'invalid';
};

/**
 * VALIDADORES EXISTENTES
 */

export const isValidBaseCode = (baseCode: string): boolean => {
  return /^\d{9}$/.test(baseCode);
};

export const isValidPalletState = (state: string): boolean => {
  return ['open', 'closed'].includes(state);
};

export const isValidLocation = (location: string): boolean => {
  return ['PACKING', 'TRANSITO', 'BODEGA', 'VENTA'].includes(location);
};

export const isValidRUT = (rut: string): boolean => {
  return /^\d{7,8}-[\dkK]$/.test(rut);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s\-\(\)]{8,15}$/.test(phone);
};

export const isValidBoxArray = (boxes: string[]): boolean => {
  return (
    Array.isArray(boxes) &&
    boxes.length > 0 &&
    boxes.every((box) => typeof box === 'string' && box.trim().length > 0)
  );
};

/**
 * NUEVOS VALIDADORES PARA CÓDIGOS DE CAJAS
 */

export const isValidBoxCodeArray = (boxes: string[]): boolean => {
  return (
    Array.isArray(boxes) &&
    boxes.length > 0 &&
    boxes.every((box) => isValidBoxCode(box))
  );
};
