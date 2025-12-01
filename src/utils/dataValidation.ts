/**
 * Utilidades para validación de datos y robustez
 */
import { Sale, Customer } from '@/types';

/**
 * Valida que un valor sea un array
 */
export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  // Si es un objeto iterable, convertirlo a array
  if (value && typeof value === 'object' && Symbol.iterator in value) {
    try {
      return Array.from(value as Iterable<T>);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Valida que una fecha sea válida
 */
export function isValidDate(date: unknown): date is Date {
  if (!(date instanceof Date)) {
    return false;
  }
  return !isNaN(date.getTime());
}

/**
 * Crea una fecha de forma segura
 */
export function safeDate(dateValue: string | Date | number | null | undefined): Date | null {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return isValidDate(dateValue) ? dateValue : null;
  }
  
  try {
    const date = new Date(dateValue);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Valida que un objeto tenga una estructura mínima esperada
 */
export function hasRequiredFields<T extends Record<string, any>>(
  obj: unknown,
  requiredFields: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return requiredFields.every((field) => {
    const value = (obj as any)[field];
    return value !== null && value !== undefined;
  });
}

/**
 * Valida que un valor sea un número válido
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Obtiene un número de forma segura
 */
export function safeGetNumber(value: unknown, fallback: number = 0): number {
  if (isValidNumber(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isValidNumber(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Valida que un string no esté vacío
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Obtiene un string de forma segura
 */
export function safeGetString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
}

/**
 * Valida estructura de respuesta de API paginada
 */
export function isValidPaginatedResponse<T>(response: unknown): response is {
  items: T[];
  lastKey?: string;
  count?: number;
} {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const resp = response as any;
  return Array.isArray(resp.items);
}

/**
 * Valida estructura de Sale
 */
export function isValidSale(sale: unknown): sale is Sale {
  if (!sale || typeof sale !== 'object') {
    return false;
  }
  
  const s = sale as any;
  return (
    typeof s.saleId === 'string' &&
    typeof s.customerId === 'string' &&
    typeof s.type === 'string' &&
    (typeof s.createdAt === 'string' || s.createdAt instanceof Date)
  );
}

/**
 * Valida estructura de Customer
 */
export function isValidCustomer(customer: unknown): customer is Customer {
  if (!customer || typeof customer !== 'object') {
    return false;
  }
  
  const c = customer as any;
  return (
    typeof c.customerId === 'string' &&
    typeof c.name === 'string'
  );
}

/**
 * Filtra y valida un array de objetos
 */
export function filterValid<T>(
  items: unknown[],
  validator: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  
  return items.filter(validator);
}

/**
 * Protege contra división por cero
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (!isValidNumber(numerator) || !isValidNumber(denominator)) {
    return fallback;
  }
  if (denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
}

/**
 * Valida rango de fechas
 */
export function isValidDateRange(start: Date, end: Date): boolean {
  if (!isValidDate(start) || !isValidDate(end)) {
    return false;
  }
  return start <= end;
}

