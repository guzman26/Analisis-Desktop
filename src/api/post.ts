import { apiRequest } from './api';
import { Customer, CustomerFormData, Sale, SaleRequest } from '@/types';

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

export const closePallet = async (codigo: string): Promise<any> => {
  return await apiRequest('/closePallet', {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  });
};

export const unassignBox = async (codigo: string): Promise<any> => {
  return await apiRequest('/unassignBox', {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  });
};

export const assignBox = async (
  codigo: string,
  pallet: string
): Promise<any> => {
  return await apiRequest('/reassignBoxToPallet', {
    method: 'POST',
    body: JSON.stringify({ boxCode: codigo, palletCode: pallet }),
  });
};

export const createCustomer = async (
  customerData: CustomerFormData
): Promise<Customer> => {
  return await apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};

export const updateCustomer = async (
  customerId: string,
  customerData: Partial<CustomerFormData>
): Promise<Customer> => {
  return await apiRequest(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
};

export const deleteCustomer = async (customerId: string): Promise<any> => {
  return await apiRequest(`/customers/${customerId}`, {
    method: 'DELETE',
  });
};

export const createSale = async (payload: SaleRequest): Promise<Sale> => {
  return await apiRequest('/sales/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const confirmSale = async (saleId: string): Promise<any> => {
  return await apiRequest(`/sales/orders/${saleId}/confirm`, {
    method: 'POST',
  });
};

export const createPallet = async (
  baseCode: string,
  ubicacion: string
): Promise<any> => {
  return await apiRequest('/pallets', {
    method: 'POST',
    body: JSON.stringify({ baseCode, ubicacion }),
  });
};

export const generateSaleReport = async (saleId: string): Promise<any> => {
  return await apiRequest(`/reports/sales/${saleId}`, {
    method: 'POST',
  });
};

export const createSingleBoxPallet = async (
  boxCode: string,
  ubicacion: string
): Promise<any> => {
  return await apiRequest('/createSingleBoxPallet', {
    method: 'POST',
    body: JSON.stringify({ boxCode, ubicacion }),
  });
};

// Endpoint para Power BI - exportar datos agregados
export const exportPowerBIData = async (
  dataType: 'pallets' | 'sales' | 'customers' | 'all'
) => {
  return await apiRequest(`/powerbi/export/${dataType}`, {
    method: 'GET',
  });
};

// Endpoint para obtener datos analíticos agregados
export const getAnalyticsData = async (
  startDate?: string,
  endDate?: string,
  groupBy?: 'day' | 'week' | 'month'
) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (groupBy) queryParams.append('groupBy', groupBy);

  const queryString = queryParams.toString();
  return await apiRequest(`/analytics${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};
