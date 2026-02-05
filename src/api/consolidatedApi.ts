import { post } from './client';

interface ConsolidatedResponse<T = any> {
  success?: boolean;
  status?: string;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Consolidated Inventory API (/inventory endpoint)
 * Handles all box, pallet, cart, cartFormat, and dispatch operations
 */
export const inventory = async <T = any>(
  action: string,
  resource: 'box' | 'pallet' | 'cart' | 'cartFormat' | 'dispatch',
  params: Record<string, any>
): Promise<T> => {
  const response = await post<ConsolidatedResponse<T>>('/inventory', {
    resource,
    action,
    params,
  });

  // Manejar formato nuevo: { status, message, data }
  if (response.status !== undefined) {
    if (response.status === 'success' || response.status === '') {
      // Siempre devolver data si está presente (incluso si es null)
      // El backend siempre devuelve data en el formato nuevo
      if ('data' in response) {
        return response.data;
      }
      // Fallback: si por alguna razón no hay data, devolver el objeto completo
      return response as T;
    } else {
      // Error en formato nuevo
      const error = new Error(response.message || 'API Error');
      (error as any).error = { message: response.message };
      throw error;
    }
  }

  // Manejar formato antiguo: { success, data, error? }
  if (response.success === false || !response.success) {
    // Lanzar el error completo con toda la estructura para mejor manejo
    const error = new Error(response.error?.message || 'API Error');
    (error as any).error = response.error; // Preservar estructura completa del error
    (error as any).code = response.error?.code;
    throw error;
  }

  return response.data;
};

/**
 * Consolidated Sales API (/sales endpoint)
 * Handles all customer and sales order operations
 */
export const sales = async <T = any>(
  action: string,
  resource: 'order' | 'customer',
  params: Record<string, any>
): Promise<T> => {
  const response = await post<ConsolidatedResponse<T>>('/sales', {
    resource,
    action,
    params,
  });

  // Manejar formato nuevo: { status, message, data }
  if (response.status !== undefined) {
    if (response.status === 'success' || response.status === '') {
      // Siempre devolver data si está presente (incluso si es null)
      // El backend siempre devuelve data en el formato nuevo
      if ('data' in response) {
        return response.data;
      }
      // Fallback: si por alguna razón no hay data, devolver el objeto completo
      return response as T;
    } else {
      // Error en formato nuevo
      const error = new Error(response.message || 'API Error');
      (error as any).error = { message: response.message };
      throw error;
    }
  }

  // Manejar formato antiguo: { success, data, error? }
  if (response.success === false || !response.success) {
    // Lanzar el error completo con toda la estructura para mejor manejo
    const error = new Error(response.error?.message || 'API Error');
    (error as any).error = response.error; // Preservar estructura completa del error
    (error as any).code = response.error?.code;
    throw error;
  }

  return response.data;
};

/**
 * Consolidated Admin API (/admin endpoint)
 * Handles all administrative operations (issues, audits, reports, config, bulk)
 */
export const admin = async <T = any>(
  action: string,
  resource: 'issue' | 'audit' | 'report' | 'config' | 'bulk',
  params: Record<string, any>
): Promise<T> => {
  const response = await post<ConsolidatedResponse<T>>('/admin', {
    resource,
    action,
    params,
  });

  // Manejar formato nuevo: { status, message, data }
  if (response.status !== undefined) {
    if (response.status === 'success' || response.status === '') {
      // Siempre devolver data si está presente (incluso si es null)
      // El backend siempre devuelve data en el formato nuevo
      if ('data' in response) {
        return response.data;
      }
      // Fallback: si por alguna razón no hay data, devolver el objeto completo
      return response as T;
    } else {
      // Error en formato nuevo
      const error = new Error(response.message || 'API Error');
      (error as any).error = { message: response.message };
      throw error;
    }
  }

  // Manejar formato antiguo: { success, data, error? }
  if (response.success === false || !response.success) {
    // Lanzar el error completo con toda la estructura para mejor manejo
    const error = new Error(response.error?.message || 'API Error');
    (error as any).error = response.error; // Preservar estructura completa del error
    (error as any).code = response.error?.code;
    throw error;
  }

  return response.data;
};
