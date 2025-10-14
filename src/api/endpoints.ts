// Consolidated API endpoints
import { get, post } from './client';
import { inventory, sales, admin } from './consolidatedApi';
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

// Pallet operations - now using consolidated /inventory endpoint
export const getPallets = (params?: GetPalletsParamsPaginated) =>
  inventory<PaginatedResponse<Pallet>>('get', 'pallet', {
    pagination: { limit: params?.limit, lastKey: params?.lastKey },
  });

export const getOpenPallets = () =>
  inventory<PaginatedResponse<Pallet>>('get', 'pallet', {
    estado: 'open',
  }).then((res) => res.items || []);

// New endpoints for closed and active pallets
export const getClosedPallets = (params: {
  ubicacion: Location;
  limit?: number;
  lastKey?: string;
}) =>
  inventory<PaginatedResponse<Pallet>>('get', 'pallet', {
    estado: 'closed',
    ubicacion: params.ubicacion,
    pagination: { limit: params.limit, lastKey: params.lastKey },
  });

export const getActivePallets = (params: {
  ubicacion: Location;
  limit?: number;
  lastKey?: string;
}) =>
  inventory<PaginatedResponse<Pallet>>('get', 'pallet', {
    estado: 'open',
    ubicacion: params.ubicacion,
    pagination: { limit: params.limit, lastKey: params.lastKey },
  });

export const createPallet = (codigo: string, maxBoxes: number) =>
  inventory<Pallet>('create', 'pallet', { codigo, maxBoxes });

// Loose-egg pallets - keep old endpoint for now (not yet migrated in backend)
// TODO: Migrate to consolidated endpoint when backend supports loose egg pallets
// For now, keeping legacy endpoint
export const createLooseEggPallet = (data: CreateLooseEggPalletRequest) =>
  post<Pallet>('/createLooseEggPallet', data);

// Toggle pallet status - can be replaced with updatePalletStatus
export const togglePalletStatus = (codigo: string) =>
  inventory<Pallet>('update', 'pallet', { codigo, toggle: true });

export const closePallet = (codigo: string) =>
  inventory<Pallet>('close', 'pallet', { codigo });

export const movePallet = (codigo: string, ubicacion: string) =>
  inventory<any>('move', 'pallet', { codigo, ubicacion });

export const auditPallet = (palletCode: string, scannedBoxes: string[] = []) =>
  admin<PalletAuditResult>('create', 'audit', { palletCode, scannedBoxes });

export const movePalletWithBoxes = (codigo: string, destino: string) =>
  inventory<{ boxesUpdated: number }>('move', 'pallet', {
    codigo,
    ubicacion: destino,
  });

export const deletePallet = (codigo: string) =>
  inventory<any>('delete', 'pallet', { codigo });

// Get single pallet by code - use GET with codigo param
export const getPalletByCode = (codigo: string) =>
  inventory<PaginatedResponse<Pallet>>('get', 'pallet', { codigo }).then(
    (res) => res.items?.[0]
  );

// Update pallet status - use specialized actions (close, move, etc.)
export const updatePalletStatus = (codigo: string, status: string) =>
  inventory<Pallet>('update', 'pallet', { codigo, estado: status });

// Box operations - now using consolidated /inventory endpoint
// Get single box by code - use GET with codigo param
export const getBoxByCode = (codigo: string) =>
  inventory<PaginatedResponse<Box>>('get', 'box', { codigo }).then(
    (res) => res.items?.[0]
  );

// Unassigned boxes (supports pagination per new API)
export const getUnassignedBoxesByLocation = (
  params: (PaginationParams & { ubicacion?: string }) & BoxFilterParams = {}
) =>
  inventory<PaginatedResponse<Box>>('get', 'box', {
    ubicacion: params.ubicacion,
    filters: {
      calibre: params.calibre,
      formato: params.formato,
      empresa: params.empresa,
    },
    pagination: { limit: params.limit, lastKey: params.lastKey },
  });

// Assign box to pallet - use consolidated assign action
export const addBoxToPallet = (palletCode: string, boxCode: string) =>
  inventory<any>('assign', 'box', { boxCode, palletCode });

export const unassignBox = (codigo: string) =>
  inventory<any>('unassign', 'box', { codigo });

export const assignBox = (boxCode: string, palletCode: string) =>
  inventory<any>('assign', 'box', { boxCode, palletCode });

export const moveBoxBetweenPallets = (
  boxCode: string,
  destinationPalletCode: string
) =>
  inventory<any>('assign', 'box', {
    boxCode,
    palletCode: destinationPalletCode,
  });

// Admin – delete a box by codigo (16 dígitos). Requiere permisos de admin.
export const deleteBox = (codigo: string) =>
  inventory<any>('delete', 'box', { codigo });

export const createSingleBoxPallet = (boxCode: string, ubicacion: string) =>
  inventory<any>('create', 'pallet', { boxCode, ubicacion, maxBoxes: 1 });

export const assignBoxToCompatiblePallet = (codigo: string) =>
  inventory<any>('assign', 'box', { boxCode: codigo });

// Customer operations - now using consolidated /sales endpoint
export const getCustomers = (params?: GetCustomersParams) =>
  sales<{ items: Customer[] }>('get', 'customer', {
    filters: params,
    pagination: { limit: 100 },
  }).then((res) => res.items || []);

export const getCustomerById = (id: string) =>
  sales<Customer>('get', 'customer', { id });

// Get customer by email - use GET with email filter
export const getCustomerByEmail = (email: string) =>
  sales<{ items: Customer[] }>('get', 'customer', {
    filters: { email },
    pagination: { limit: 1 },
  }).then((res) => res.items?.[0]);

export const createCustomer = (data: CustomerFormData) =>
  sales<Customer>('create', 'customer', data);

export const updateCustomer = (id: string, data: Partial<CustomerFormData>) =>
  sales<Customer>('update', 'customer', { id, data });

export const deleteCustomer = (id: string) =>
  sales<any>('delete', 'customer', { id });

// Sales operations - now using consolidated /sales endpoint
export const getSalesOrders = (params?: GetSalesOrdersParamsPaginated) =>
  sales<PaginatedResponse<Sale>>('get', 'order', {
    filters: params?.filters,
    pagination: { limit: params?.limit, lastKey: params?.lastKey },
  });

export const getSaleById = (id: string) => sales<Sale>('get', 'order', { id });

export const createSale = (data: SaleRequest) =>
  sales<Sale>('create', 'order', data);

export const confirmSale = (id: string) =>
  sales<any>('confirm', 'order', { id });

// TODO: Migrate to /admin endpoint when backend supports reports
// admin<Report>('generate', 'report', { type: 'sale', id })
export const generateSaleReport = (id: string) =>
  post<any>(`/reports/sales/${id}`);

// Admin operations - now using consolidated /admin endpoint
export const getIssues = (params?: GetIssuesParamsPaginated) =>
  admin<PaginatedResponse<Issue>>('get', 'issue', {
    filters: params?.filters,
    pagination: { limit: params?.limit, lastKey: params?.lastKey },
  });

export const updateIssueStatus = (id: string, resolution: string) =>
  admin<any>('update', 'issue', { issueId: id, resolution });

// Danger Zone operations - Using consolidated /admin endpoint with 'bulk' resource
export const deleteAllBoxes = () =>
  admin<any>('delete-boxes', 'bulk', { scope: 'all' });

export const deletePackingBoxesAsync = () =>
  admin<any>('delete-boxes', 'bulk', { scope: 'packing', ubicacion: 'PACKING' });

export const deleteAllBoxesAsync = () =>
  admin<any>('delete-boxes', 'bulk', { scope: 'all' });

export const deletePackingPalletsAsync = () =>
  admin<any>('delete-pallets', 'bulk', { ubicacion: 'PACKING' });

export const deletePalletsAndAssignedBoxesAsync = () =>
  admin<any>('delete-pallets-and-boxes', 'bulk', {});

export const deleteUnassignedBoxesAsync = () =>
  admin<any>('delete-boxes', 'bulk', { scope: 'unassigned', palletId: 'UNASSIGNED' });

// Analytics operations
export const exportPowerBIData = (dataType: string) =>
  get(`/powerbi/export/${dataType}`);

export const getAnalyticsData = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => get('/analytics', params);
