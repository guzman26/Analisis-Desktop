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
