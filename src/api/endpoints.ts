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
  Location,
  GetPalletsParamsPaginated,
  GetCustomersParams,
  GetSalesOrdersParamsPaginated,
  GetIssuesParamsPaginated,
  PaginatedResponse,
  PalletAuditResult,
  BoxFilterParams,
  PaginationParams,
  CreateLooseEggPalletRequest,
} from '@/types';

// Pallet operations
export const getPallets = (params?: GetPalletsParamsPaginated) =>
  get<PaginatedResponse<Pallet>>('/getPallets', params);

export const getOpenPallets = () => get<Pallet[]>('/pallets/open');

// New endpoints for closed and active pallets
export const getClosedPallets = (params: {
  ubicacion: Location;
  limit?: number;
  lastKey?: string;
}) => get<PaginatedResponse<Pallet>>('/getClosedPallets', params);

export const getActivePallets = (params: {
  ubicacion: Location;
  limit?: number;
  lastKey?: string;
}) => get<PaginatedResponse<Pallet>>('/getActivePallets', params);

export const createPallet = (baseCode: string, ubicacion: string) =>
  post<Pallet>('/pallets', { baseCode, ubicacion });

// Loose-egg pallets
export const createLooseEggPallet = (data: CreateLooseEggPalletRequest) =>
  post<Pallet>('/createLooseEggPallet', data);

export const togglePalletStatus = (codigo: string) =>
  put<Pallet>(`/pallets/${codigo}/toggle`);

export const closePallet = (codigo: string) =>
  post<Pallet>('/closePallet', { codigo });

export const movePallet = (codigo: string, ubicacion: string) =>
  post<any>('/movePallet', { codigo, ubicacion });

export const auditPallet = (palletCode: string) =>
  get<PalletAuditResult>('/auditPallet', { palletCode });

export const movePalletWithBoxes = (codigo: string, destino: string) =>
  put<{ boxesUpdated: number }>(`/pallets/${codigo}/move`, { destino });

export const deletePallet = (codigo: string) => del(`/pallets/${codigo}`);

export const getPalletByCode = (codigo: string) =>
  get<Pallet>(`/pallets/${codigo}`);

export const updatePalletStatus = (codigo: string, status: string) =>
  put<Pallet>(`/pallets/${codigo}/status`, { status });

// Box operations
export const getBoxByCode = (codigo: string) =>
  get<Box>('/getEggsByCodigo', { codigo });

// Unassigned boxes (supports pagination per new API)
export const getUnassignedBoxesByLocation = (
  params: (PaginationParams & { ubicacion?: string }) & BoxFilterParams = {}
) => get<PaginatedResponse<Box>>('/getUnassignedBoxesByLocation', params);

export const addBoxToPallet = (palletId: string, boxCode: string) =>
  post<Pallet>(`/pallets/${palletId}/boxes`, { boxCode });

export const unassignBox = (codigo: string) =>
  post<any>('/unassignBox', { codigo });

export const assignBox = (boxCode: string, palletId: string) =>
  post<any>('/reassignBoxToPallet', { boxCode, palletId });

// Admin – delete a box by codigo (16 dígitos). Requiere permisos de admin.
export const deleteBox = (codigo: string) =>
  post<any>('/admin/deleteBox', { codigo });

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

export const getSaleById = (id: string) => get<Sale>(`/sales/orders/${id}`);

export const createSale = (data: SaleRequest) =>
  post<Sale>('/sales/orders', data);

export const confirmSale = (id: string) =>
  post<any>(`/sales/orders/${id}/confirm`);

export const generateSaleReport = (id: string) =>
  post<any>(`/reports/sales/${id}`);

// Admin operations
export const getIssues = (params?: GetIssuesParamsPaginated) =>
  get<PaginatedResponse<Issue>>('/admin/issues', params);

export const updateIssueStatus = (id: string, status: string) =>
  put<any>(`/admin/issues/${id}/status`, { status });

// Danger Zone operations
export const deleteAllBoxes = () => post<any>('/admin/deleteAllBoxes');
export const deletePackingBoxesAsync = () =>
  post<any>('/admin/deletePackingBoxesAsync');

// Analytics operations
export const exportPowerBIData = (dataType: string) =>
  get(`/powerbi/export/${dataType}`);

export const getAnalyticsData = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => get('/analytics', params);
