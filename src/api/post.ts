import { apiRequest } from './api';
import {
  Customer,
  CustomerFormData,
  Sale,
  SaleRequest,
} from '@/types';

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
  return await apiRequest('/sales/orders/from-pallets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


