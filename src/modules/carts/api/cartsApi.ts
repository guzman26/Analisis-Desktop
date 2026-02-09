import {
  deleteCart,
  getCartByCode,
  getCarts,
  moveCart,
} from '@/api/endpoints';
import type { Cart, GetCartsParams, Location, PaginatedResponse } from '@/types';
import { toDomainErrorException } from '@/modules/core';

export const cartsApi = {
  list: async (params?: GetCartsParams): Promise<PaginatedResponse<Cart>> => {
    try {
      return await getCarts(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getByCode: async (codigo: string): Promise<Cart> => {
    try {
      return (await getCartByCode(codigo)) as Cart;
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  move: async (codigo: string, ubicacion: Location): Promise<Cart> => {
    try {
      return await moveCart(codigo, ubicacion);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  remove: async (codigo: string): Promise<unknown> => {
    try {
      return await deleteCart(codigo);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
