import {
  createCustomer,
  deleteCustomer,
  getCustomerByEmail,
  getCustomerById,
  getCustomerPreferences,
  getCustomers,
  updateCustomer,
} from '@/api/endpoints';
import type {
  Customer,
  CustomerFormData,
  CustomerPreferences,
  GetCustomersParams,
} from '@/types';
import { toDomainErrorException } from '@/modules/core';

export const customersApi = {
  list: async (params?: GetCustomersParams): Promise<Customer[]> => {
    try {
      return await getCustomers(params);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getById: async (id: string): Promise<Customer | null> => {
    try {
      return await getCustomerById(id);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getByEmail: async (email: string): Promise<Customer | null> => {
    try {
      return await getCustomerByEmail(email);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    try {
      return await createCustomer(data);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  update: async (
    id: string,
    data: Partial<CustomerFormData>
  ): Promise<Customer> => {
    try {
      return await updateCustomer(id, data);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },

  getPreferences: async (customerId: string): Promise<CustomerPreferences> => {
    try {
      return await getCustomerPreferences(customerId);
    } catch (error) {
      throw toDomainErrorException(error);
    }
  },
};
