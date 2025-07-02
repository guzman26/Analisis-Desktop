import { apiRequest, validateQuery } from './api';
import {
  Pallet,
  GetPalletsParams,
  GetPalletsParamsPaginated,
  PaginatedResponse,
  Customer,
  GetCustomersParams,
  Sale,
  GetSalesOrdersParamsPaginated,
} from '@/types';

export const getPallets = async (
  params: GetPalletsParams = {}
): Promise<Pallet[]> => {
  validateQuery(params);

  // Build query string
  const queryParams = new URLSearchParams();
  if (params.estado) queryParams.append('estado', params.estado);
  if (params.ubicacion) queryParams.append('ubicacion', params.ubicacion);
  if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
  if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

  const queryString = queryParams.toString();
  const endpoint = `/getPallets${queryString ? `?${queryString}` : ''}`;

  return await apiRequest(endpoint);
};

// Versión paginada para activePallets
export const getPalletsPaginated = async (
  params: GetPalletsParamsPaginated = {}
): Promise<PaginatedResponse<Pallet>> => {
  validateQuery(params);

  // Build query string
  const queryParams = new URLSearchParams();
  if (params.estado) queryParams.append('estado', params.estado);
  if (params.ubicacion) queryParams.append('ubicacion', params.ubicacion);
  if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
  if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.lastEvaluatedKey)
    queryParams.append('lastEvaluatedKey', params.lastEvaluatedKey);

  const queryString = queryParams.toString();
  const endpoint = `/getPallets${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest(endpoint);
  return response;
};

export const getBoxByCode = async (codigo: string): Promise<any> => {
  const queryString = new URLSearchParams({ codigo }).toString();
  return await apiRequest(`/getEggsByCodigo?${queryString}`, {
    method: 'GET',
  });
};

export const getUnassignedBoxesByLocation = async (
  location: string
): Promise<any> => {
  const queryString = new URLSearchParams({ ubicacion: location }).toString();
  return await apiRequest(`/getUnassignedBoxesByLocation?${queryString}`, {
    method: 'GET',
  });
};

export const getCustomers = async (
  params: GetCustomersParams = {}
): Promise<Customer[]> => {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

  const queryString = queryParams.toString();
  const endpoint = `/customers${queryString ? `?${queryString}` : ''}`;

  return await apiRequest(endpoint);
};

export const getCustomerById = async (
  customerId: string
): Promise<Customer | null> => {
  return await apiRequest(`/customers/${customerId}`);
};

export const getCustomerByEmail = async (
  email: string
): Promise<Customer | null> => {
  const queryString = new URLSearchParams({ email }).toString();
  return await apiRequest(`/customers/email?${queryString}`);
};

export const getSaleById = async (saleId: string): Promise<Sale | null> => {
  return await apiRequest(`/sales/orders/${saleId}`);
};

export const getSalesOrdersPaginated = async (
  params: GetSalesOrdersParamsPaginated = {}
): Promise<PaginatedResponse<Sale>> => {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.state) queryParams.append('state', params.state);
  if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
  if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.lastEvaluatedKey)
    queryParams.append('lastEvaluatedKey', params.lastEvaluatedKey);

  const queryString = queryParams.toString();
  const endpoint = `/sales/orders${queryString ? `?${queryString}` : ''}`;
  const response = await apiRequest(endpoint);
  return response.data;
};
