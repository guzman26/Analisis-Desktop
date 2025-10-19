// Simple validators matching your backend logic

/**
 * VALIDADORES PARA CÓDIGOS
 */

export const isValidPalletCode = (code: string): boolean =>
  /^\d{12}$/.test(code);
// NOTA: Esta función ha sido reemplazada por la versión en boxCodeParser.ts
// que valida correctamente 16 dígitos. Se mantiene aquí por compatibilidad legacy.
// Se recomienda usar isValidBoxCode de boxCodeParser.ts
export const isValidBoxCode = (code: string): boolean => /^\d{16}$/.test(code);
export const isValidBaseCode = (baseCode: string): boolean =>
  /^\d{9}$/.test(baseCode);

export const isValidCode = (code: string): 'pallet' | 'box' | 'invalid' => {
  if (isValidPalletCode(code)) return 'pallet';
  if (isValidBoxCode(code)) return 'box';
  return 'invalid';
};

/**
 * VALIDADORES EXISTENTES
 */

export const isValidPalletState = (state: string): boolean =>
  ['open', 'closed'].includes(state);

export const isValidLocation = (location: string): boolean =>
  ['PACKING', 'TRANSITO', 'BODEGA', 'VENTA'].includes(location);

export const isValidRUT = (rut: string): boolean =>
  /^\d{7,8}-[\dkK]$/.test(rut);
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone: string): boolean =>
  /^\+?[\d\s\-()]{8,15}$/.test(phone);

export const isValidStringArray = (arr: any): arr is string[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  arr.every((item) => typeof item === 'string' && item.trim().length > 0);

/**
 * NUEVOS VALIDADORES PARA CÓDIGOS DE CAJAS
 */

export const isValidBoxCodeArray = (boxes: any): boxes is string[] =>
  Array.isArray(boxes) && boxes.length > 0 && boxes.every(isValidBoxCode);
