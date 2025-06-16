import { apiRequest, validateQuery } from './api';
import { Pallet, GetPalletsParams } from '@/types';

export const getPalletByCode = async (
  codigo: string
): Promise<Pallet | null> => {
  return await apiRequest(`/pallets/${codigo}`);
};

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

export const getBoxByCode = async (codigo: string): Promise<any> => {
  const queryString = new URLSearchParams({ codigo }).toString();
  return await apiRequest(`/getEggsByCodigo?${queryString}`, {
    method: 'GET',
  });
};

export const getUnassignedBoxesByLocation = async (location: string): Promise<any> => {
  const queryString = new URLSearchParams({ ubicacion: location }).toString();
  return await apiRequest(`/getUnassignedBoxesByLocation?${queryString}`, {
    method: 'GET',
  });
};