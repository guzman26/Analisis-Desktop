import { createContext, useState, useCallback, ReactNode } from 'react';
import { Customer, CustomerFormData } from '@/types';
import { extractDataFromResponse } from '@/utils/extractDataFromResponse';
import { getCustomers, getCustomerById, getCustomerByEmail } from '@/api/get';
import { createCustomer, updateCustomer, deleteCustomer } from '@/api/post';

interface CustomerContextType {
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
  createCustomerFunction: (customerData: CustomerFormData) => Promise<Customer>;
  updateCustomerFunction: (
    customerId: string,
    customerData: Partial<CustomerFormData>
  ) => Promise<Customer>;
  deleteCustomerFunction: (customerId: string) => Promise<void>;
  getCustomerByIdFunction: (customerId: string) => Promise<Customer | null>;
  getCustomerByEmailFunction: (email: string) => Promise<Customer | null>;
  loading: boolean;
  error: string | null;
}

export const CustomerContext = createContext<CustomerContextType>(
  {} as CustomerContextType
);

interface Props {
  children: ReactNode;
}

export const CustomerProvider = ({ children }: Props) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomers();
      const customersData = extractDataFromResponse(response);
      setCustomers(customersData[0].customers);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      setError('Error al cargar los clientes');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomerFunction = useCallback(
    async (customerData: CustomerFormData): Promise<Customer> => {
      setLoading(true);
      setError(null);
      try {
        const newCustomer = await createCustomer(customerData);
        // Actualizar la lista de clientes después de crear uno nuevo
        await fetchCustomers();
        return newCustomer;
      } catch (error) {
        console.error('Error creando cliente:', error);
        setError('Error al crear el cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCustomers]
  );

  const updateCustomerFunction = useCallback(
    async (
      customerId: string,
      customerData: Partial<CustomerFormData>
    ): Promise<Customer> => {
      setLoading(true);
      setError(null);
      try {
        const updatedCustomer = await updateCustomer(customerId, customerData);
        // Actualizar la lista de clientes después de actualizar
        await fetchCustomers();
        return updatedCustomer;
      } catch (error) {
        console.error('Error actualizando cliente:', error);
        setError('Error al actualizar el cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCustomers]
  );

  const deleteCustomerFunction = useCallback(
    async (customerId: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await deleteCustomer(customerId);
        // Actualizar la lista de clientes después de eliminar
        await fetchCustomers();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        setError('Error al eliminar el cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCustomers]
  );

  const getCustomerByIdFunction = useCallback(
    async (customerId: string): Promise<Customer | null> => {
      try {
        return await getCustomerById(customerId);
      } catch (error) {
        console.error('Error obteniendo cliente por ID:', error);
        return null;
      }
    },
    []
  );

  const getCustomerByEmailFunction = useCallback(
    async (email: string): Promise<Customer | null> => {
      try {
        return await getCustomerByEmail(email);
      } catch (error) {
        console.error('Error obteniendo cliente por email:', error);
        return null;
      }
    },
    []
  );

  const value: CustomerContextType = {
    customers,
    fetchCustomers,
    createCustomerFunction,
    updateCustomerFunction,
    deleteCustomerFunction,
    getCustomerByIdFunction,
    getCustomerByEmailFunction,
    loading,
    error,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
