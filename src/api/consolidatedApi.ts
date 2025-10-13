import { post } from './client';

interface ConsolidatedResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Consolidated Inventory API (/inventory endpoint)
 * Handles all box and pallet operations
 */
export const inventory = async <T = any>(
  action: string,
  resource: 'box' | 'pallet',
  params: Record<string, any>
): Promise<T> => {
  const response = await post<ConsolidatedResponse<T>>('/inventory', {
    resource,
    action,
    params,
  });

  if (!response.success) {
    throw new Error(response.error?.message || 'API Error');
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

  if (!response.success) {
    throw new Error(response.error?.message || 'API Error');
  }

  return response.data;
};

/**
 * Consolidated Admin API (/admin endpoint)
 * Handles all administrative operations (issues, audits, reports, config)
 */
export const admin = async <T = any>(
  action: string,
  resource: 'issue' | 'audit' | 'report' | 'config',
  params: Record<string, any>
): Promise<T> => {
  const response = await post<ConsolidatedResponse<T>>('/admin', {
    resource,
    action,
    params,
  });

  if (!response.success) {
    throw new Error(response.error?.message || 'API Error');
  }

  return response.data;
};
