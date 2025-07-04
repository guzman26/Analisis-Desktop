// Consolidated API endpoints
import { get, post, put, del } from './client';
import {
  Pallet,
  Box,
  Customer,
  CustomerFormData,
  Sale,
  SaleRequest,
  Issue,
  GetPalletsParamsPaginated,
  GetCustomersParams,
  GetSalesOrdersParamsPaginated,
  GetIssuesParamsPaginated,
  PaginatedResponse,
} from '@/types';

// Pallet operations
export const getPallets = (params?: GetPalletsParamsPaginated) => 
  get<PaginatedResponse<Pallet>>('/getPallets', params);

export const getOpenPallets = () => get<Pallet[]>('/pallets/open');

export const createPallet = (baseCode: string, ubicacion: string) =>
  post<Pallet>('/pallets', { baseCode, ubicacion });

export const togglePalletStatus = (codigo: string) =>
  put<Pallet>(`/pallets/${codigo}/toggle`);

export const closePallet = (codigo: string) =>
  post<Pallet>('/closePallet', { codigo });

export const movePallet = (codigo: string, ubicacion: string) =>
  post<any>('/movePallet', { codigo, ubicacion });

export const movePalletWithBoxes = (codigo: string, destino: string) =>
  put<{ boxesUpdated: number }>(`/pallets/${codigo}/move`, { destino });

export const deletePallet = (codigo: string) => del(`/pallets/${codigo}`);

// Box operations
export const getBoxByCode = (codigo: string) =>
  get<Box>('/getEggsByCodigo', { codigo });

export const getUnassignedBoxesByLocation = (ubicacion: string) =>
  get<Box[]>('/getUnassignedBoxesByLocation', { ubicacion });

export const addBoxToPallet = (palletId: string, boxCode: string) =>
  post<Pallet>(`/pallets/${palletId}/boxes`, { boxCode });

export const unassignBox = (codigo: string) =>
  post<any>('/unassignBox', { codigo });

export const assignBox = (boxCode: string, palletCode: string) =>
  post<any>('/reassignBoxToPallet', { boxCode, palletCode });

export const createSingleBoxPallet = (boxCode: string, ubicacion: string) =>
  post<any>('/createSingleBoxPallet', { boxCode, ubicacion });

export const assignBoxToCompatiblePallet = (codigo: string) =>
  post<any>('/assignBoxToCompatiblePallet', { codigo });

// Customer operations
export const getCustomers = (params?: GetCustomersParams) =>
  get<Customer[]>('/customers', params);

export const getCustomerById = (id: string) =>
  get<Customer>(`/customers/${id}`);

export const getCustomerByEmail = (email: string) =>
  get<Customer>('/customers/email', { email });

export const createCustomer = (data: CustomerFormData) =>
  post<Customer>('/customers', data);

export const updateCustomer = (id: string, data: Partial<CustomerFormData>) =>
  put<Customer>(`/customers/${id}`, data);

export const deleteCustomer = (id: string) => del(`/customers/${id}`);

// Sales operations
export const getSalesOrders = (params?: GetSalesOrdersParamsPaginated) =>
  get<PaginatedResponse<Sale>>('/sales/orders', params);

export const getSaleById = (id: string) =>
  get<Sale>(`/sales/orders/${id}`);

export const createSale = (data: SaleRequest) =>
  post<Sale>('/sales/orders', data);

export const confirmSale = (id: string) =>
  post<any>(`/sales/orders/${id}/confirm`);

export const generateSaleReport = (id: string) =>
  post<any>(`/reports/sales/${id}`);

// Admin operations
export const getIssues = (params?: GetIssuesParamsPaginated) =>
  get<PaginatedResponse<Issue>>('/admin/issues', params);

// Analytics operations
export const exportPowerBIData = (dataType: string) =>
  get(`/powerbi/export/${dataType}`);

export const getAnalyticsData = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => get('/analytics', params);