import React, { ReactNode } from 'react';
import { Customer, CustomerFormData } from '@/types';
import {
  getCustomers,
  getCustomerById,
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/api/endpoints';
import { extractDataFromResponse } from '@/utils';
import {
  createContextFactory,
  BaseState,
  BaseAction,
} from './core/createContext';
import { ActionType } from './core/apiUtils';
import { useDataFetch, useDataMutation } from './core';
// Removing unused import
// import { useDataFetch, useDataMutation } from './core/dataHooks';

// Define the state shape
interface CustomerState extends BaseState {
  data: Customer[]; // Required by DataState constraint
  customers: Customer[];
  selectedCustomer: Customer | null;
  lastUpdated: number | undefined;
}

// Define action types for this context
type CustomerAction = BaseAction<ActionType | CustomerActionType>;

// Add custom action types specific to customer context
enum CustomerActionType {
  SELECT_CUSTOMER = 'SELECT_CUSTOMER',
  CLEAR_SELECTED_CUSTOMER = 'CLEAR_SELECTED_CUSTOMER',
}

// Create initial state
const initialState: CustomerState = {
  data: [], // Required by DataState constraint
  customers: [],
  selectedCustomer: null,
  status: 'idle',
  error: null,
  lastUpdated: undefined,
};

// Create action creators
const customerActions = {
  fetchStart: (): CustomerAction => ({
    type: ActionType.FETCH_START,
  }),
  fetchSuccess: (data: Customer[]): CustomerAction => ({
    type: ActionType.FETCH_SUCCESS,
    payload: data,
  }),
  fetchError: (error: Error): CustomerAction => ({
    type: ActionType.FETCH_ERROR,
    payload: error,
  }),
  createStart: (): CustomerAction => ({
    type: ActionType.CREATE_START,
  }),
  createSuccess: (data: Customer): CustomerAction => ({
    type: ActionType.CREATE_SUCCESS,
    payload: data,
  }),
  createError: (error: Error): CustomerAction => ({
    type: ActionType.CREATE_ERROR,
    payload: error,
  }),
  updateStart: (id: string): CustomerAction => ({
    type: ActionType.UPDATE_START,
    payload: id,
  }),
  updateSuccess: (_id: string, data: Customer): CustomerAction => ({
    type: ActionType.UPDATE_SUCCESS,
    payload: data,
  }),
  updateError: (_id: string, error: Error): CustomerAction => ({
    type: ActionType.UPDATE_ERROR,
    payload: error,
  }),
  deleteStart: (id: string): CustomerAction => ({
    type: ActionType.DELETE_START,
    payload: id,
  }),
  deleteSuccess: (id: string): CustomerAction => ({
    type: ActionType.DELETE_SUCCESS,
    payload: id,
  }),
  deleteError: (_id: string, error: Error): CustomerAction => ({
    type: ActionType.DELETE_ERROR,
    payload: error,
  }),
  selectCustomer: (customer: Customer): CustomerAction => ({
    type: CustomerActionType.SELECT_CUSTOMER,
    payload: customer,
  }),
  clearSelectedCustomer: (): CustomerAction => ({
    type: CustomerActionType.CLEAR_SELECTED_CUSTOMER,
  }),
};

// Create a custom reducer
const customerReducer = (
  state: CustomerState = initialState,
  action: CustomerAction
): CustomerState => {
  // Handle customer-specific actions
  switch (action.type) {
    case CustomerActionType.SELECT_CUSTOMER:
      return {
        ...state,
        selectedCustomer: action.payload as Customer,
      };
    case CustomerActionType.CLEAR_SELECTED_CUSTOMER:
      return {
        ...state,
        selectedCustomer: null,
      };
    case ActionType.FETCH_SUCCESS:
      return {
        ...state,
        status: 'success',
        data: action.payload as Customer[], // Update data property
        customers: action.payload as Customer[],
        error: null,
        lastUpdated: Date.now(),
      };
    case ActionType.FETCH_START:
      return { ...state, status: 'loading', error: null };
    case ActionType.FETCH_ERROR:
      return { ...state, status: 'error', error: action.payload as Error };
    default:
      return state;
  }
};

// Define the API interface
type CustomerAPI = {
  fetchCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerByEmail: (email: string) => Promise<Customer | null>;
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (
    id: string,
    data: Partial<CustomerFormData>
  ) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  selectCustomer: (customer: Customer) => void;
  clearSelectedCustomer: () => void;
};

// Create the context using our factory
const { Provider, useContext } = createContextFactory<
  CustomerState,
  CustomerAction,
  CustomerAPI
>({
  name: 'Customer',
  initialState,
  reducer: customerReducer,
  createAPI: (dispatch) => ({
    // API implementation using hooks internally
    fetchCustomers: async () => {
      dispatch(customerActions.fetchStart());
      try {
        const response = await getCustomers();
        // Ensure we always pass an array of customers, regardless of response shape
        const responseData = Array.isArray(response)
          ? response
          : await extractDataFromResponse(response);

        dispatch(customerActions.fetchSuccess(responseData as Customer[]));
      } catch (error) {
        dispatch(customerActions.fetchError(error as Error));
        throw error;
      }
    },

    getCustomerById: async (id: string) => {
      try {
        return await getCustomerById(id);
      } catch (error) {
        console.error('Error fetching customer by ID:', error);
        return null;
      }
    },

    getCustomerByEmail: async (email: string) => {
      try {
        return await getCustomerByEmail(email);
      } catch (error) {
        console.error('Error fetching customer by email:', error);
        return null;
      }
    },

    createCustomer: async (data: CustomerFormData) => {
      dispatch(customerActions.createStart());
      try {
        const newCustomer = await createCustomer(data);
        dispatch(customerActions.createSuccess(newCustomer));
        return newCustomer;
      } catch (error) {
        dispatch(customerActions.createError(error as Error));
        throw error;
      }
    },

    updateCustomer: async (id: string, data: Partial<CustomerFormData>) => {
      dispatch(customerActions.updateStart(id));
      try {
        const updatedCustomer = await updateCustomer(id, data);
        dispatch(customerActions.updateSuccess(id, updatedCustomer));
        return updatedCustomer;
      } catch (error) {
        dispatch(customerActions.updateError(id, error as Error));
        throw error;
      }
    },

    deleteCustomer: async (id: string) => {
      dispatch(customerActions.deleteStart(id));
      try {
        await deleteCustomer(id);
        dispatch(customerActions.deleteSuccess(id));
      } catch (error) {
        dispatch(customerActions.deleteError(id, error as Error));
        throw error;
      }
    },

    selectCustomer: (customer: Customer) => {
      dispatch(customerActions.selectCustomer(customer));
    },

    clearSelectedCustomer: () => {
      dispatch(customerActions.clearSelectedCustomer());
    },
  }),
});

// Create custom hooks for consumer components
export const useCustomerContext = () => useContext();

export const useCustomer = (id: string) => {
  const [, api] = useCustomerContext();
  return useDataFetch(() => api.getCustomerById(id), { immediate: true });
};

export const useCreateCustomer = () => {
  const [, api] = useCustomerContext();
  return useDataMutation(api.createCustomer);
};

export const useUpdateCustomer = (id: string) => {
  const [, api] = useCustomerContext();
  return useDataMutation((data: Partial<CustomerFormData>) =>
    api.updateCustomer(id, data)
  );
};

export const useDeleteCustomer = () => {
  const [, api] = useCustomerContext();
  return useDataMutation(api.deleteCustomer);
};

// Export the renamed provider component for clarity
export const CustomerProvider: React.FC<{ children: ReactNode }> = Provider;
