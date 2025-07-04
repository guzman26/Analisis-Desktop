import React, { ReactNode } from 'react';
import { Pallet } from '@/types';

// Define PalletFilter type since it's not in @/types
type PalletFilter = 'all' | 'active' | 'completed';

// Import actual API functions with correct names
import {
  getPallets,
  getPalletByCode,
  createPallet,
  updatePalletStatus,
  deletePallet,
} from '@/api/endpoints';
import {
  createContextFactory,
  BaseState,
  BaseAction,
} from './core/createContext';
import { ActionType, createActions } from './core/apiUtils';
import {
  useDataFetch,
  usePaginatedData,
  useDataMutation,
} from './core/dataHooks';

// Define filter constants for reuse
const FILTER_ALL = 'all';
const FILTER_ACTIVE = 'active';
const FILTER_COMPLETED = 'completed';

// Define the state shape
interface PalletState extends BaseState {
  pallets: Pallet[];
  filteredPallets: Pallet[];
  selectedPallet: Pallet | null;
  currentFilter: PalletFilter;
  lastUpdated: number | undefined;
  data: Pallet[]; // Required by DataState constraint
  page: number;
  pageSize: number;
  total: number;
}

// Define action types for this context
type PalletAction = BaseAction<ActionType | string>;

// Add custom action types specific to pallet context
enum PalletActionType {
  SELECT_PALLET = 'SELECT_PALLET',
  CLEAR_SELECTED_PALLET = 'CLEAR_SELECTED_PALLET',
  SET_FILTER = 'SET_FILTER',
  SET_PAGE = 'SET_PAGE',
}

// Add a type guard to check if an action is a pallet action
const isPalletAction = (action: any): action is PalletAction => {
  return (
    action.type === PalletActionType.SELECT_PALLET ||
    action.type === PalletActionType.CLEAR_SELECTED_PALLET ||
    action.type === PalletActionType.SET_FILTER ||
    action.type === PalletActionType.SET_PAGE
  );
};

// Create initial state
const initialState: PalletState = {
  pallets: [],
  filteredPallets: [],
  data: [], // Initialize the required data property
  selectedPallet: null,
  currentFilter: FILTER_ALL,
  status: 'idle',
  error: null,
  lastUpdated: undefined,
  page: 1,
  pageSize: 10,
  total: 0,
};

// Create action creators
const palletActions = {
  ...createActions<Pallet, string>(),
  selectPallet: (pallet: Pallet): PalletAction => ({
    type: PalletActionType.SELECT_PALLET,
    payload: pallet,
  }),
  clearSelectedPallet: (): PalletAction => ({
    type: PalletActionType.CLEAR_SELECTED_PALLET,
  }),
  setFilter: (filter: PalletFilter): PalletAction => ({
    type: PalletActionType.SET_FILTER,
    payload: filter,
  }),
  setPage: (page: number): PalletAction => ({
    type: PalletActionType.SET_PAGE,
    payload: page,
  }),
};

// Helper function for filtering pallets
const filterPallets = (pallets: Pallet[], filter: PalletFilter): Pallet[] => {
  if (filter === FILTER_ALL) {
    return pallets;
  }
  return pallets.filter((pallet) => {
    if (filter === FILTER_ACTIVE) {
      // Using estado property which exists on Pallet type
      return pallet.estado === 'open';
    } else if (filter === FILTER_COMPLETED) {
      return pallet.estado === 'closed';
    }
    return true;
  });
};

// Create a custom reducer
const palletReducer = (
  state: PalletState = initialState,
  action: PalletAction
): PalletState => {
  // Handle pallet-specific actions
  if (isPalletAction(action)) {
    switch (action.type) {
      case PalletActionType.SELECT_PALLET:
        return {
          ...state,
          selectedPallet: action.payload as Pallet,
        };
      case PalletActionType.CLEAR_SELECTED_PALLET:
        return {
          ...state,
          selectedPallet: null,
        };
      case PalletActionType.SET_FILTER:
        const newFilter = action.payload as PalletFilter;
        return {
          ...state,
          currentFilter: newFilter,
          filteredPallets: filterPallets(state.pallets, newFilter),
        };
      case PalletActionType.SET_PAGE:
        return {
          ...state,
          page: action.payload as number,
        };
    }
  }

  // Handle API actions
  switch (action.type) {
    case ActionType.FETCH_SUCCESS:
      const pallets = action.payload as Pallet[];
      return {
        ...state,
        status: 'success',
        pallets,
        filteredPallets: filterPallets(pallets, state.currentFilter),
        data: pallets, // Update the data property too
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
type PalletAPI = {
  fetchPallets: (page?: number, filter?: PalletFilter) => Promise<void>;
  getPalletById: (id: string) => Promise<Pallet | null>;
  createPallet: (data: Partial<Pallet>) => Promise<Pallet>;
  updatePallet: (id: string, data: Partial<Pallet>) => Promise<Pallet>;
  deletePallet: (id: string) => Promise<void>;
  selectPallet: (pallet: Pallet) => void;
  clearSelectedPallet: () => void;
  setFilter: (filter: PalletFilter) => void;
  setPage: (page: number) => void;
};

// Create the context using our factory
const { Provider, useContext } = createContextFactory<
  PalletState,
  PalletAction,
  PalletAPI
>({
  name: 'Pallet',
  initialState,
  reducer: palletReducer,
  createAPI: (dispatch) => ({
    // API implementation using hooks internally
    fetchPallets: async (page = 1, filter = FILTER_ALL) => {
      dispatch(palletActions.fetchStart());
      try {
        // Set the filter and page
        dispatch(palletActions.setFilter(filter));
        dispatch(palletActions.setPage(page));

        // Then fetch the pallets with the specified filter
        // Assuming getPallets now takes pagination params
        const response = await getPallets({ limit: 10 });
        const palletData = response.data || [];
        dispatch(palletActions.fetchSuccess(palletData as unknown as Pallet));
      } catch (error) {
        dispatch(palletActions.fetchError(error as Error));
        throw error;
      }
    },

    getPalletById: async (id: string) => {
      try {
        // Use getPalletByCode instead since that's what's available
        return await getPalletByCode(id);
      } catch (error) {
        console.error('Error fetching pallet by ID:', error);
        return null;
      }
    },

    createPallet: async (data: Partial<Pallet>) => {
      dispatch(palletActions.createStart());
      try {
        // createPallet expects (baseCode: string, ubicacion: string)
        const newPallet = await createPallet(
          data.baseCode || '',
          data.ubicacion || ''
        );
        dispatch(palletActions.createSuccess(newPallet));
        return newPallet;
      } catch (error) {
        dispatch(palletActions.createError(error as Error));
        throw error;
      }
    },

    updatePallet: async (id: string, data: Partial<Pallet>) => {
      dispatch(palletActions.updateStart(id));
      try {
        // Use updatePalletStatus instead since that's what's available
        // This is just a placeholder - adjust based on your actual API
        const updatedPallet = await updatePalletStatus(
          id,
          data.estado || 'open'
        );
        dispatch(palletActions.updateSuccess(id, updatedPallet));
        return updatedPallet;
      } catch (error) {
        dispatch(palletActions.updateError(id, error as Error));
        throw error;
      }
    },

    deletePallet: async (id: string) => {
      dispatch(palletActions.deleteStart(id));
      try {
        await deletePallet(id);
        dispatch(palletActions.deleteSuccess(id));
      } catch (error) {
        dispatch(palletActions.deleteError(id, error as Error));
        throw error;
      }
    },

    selectPallet: (pallet: Pallet) => {
      dispatch(palletActions.selectPallet(pallet));
    },

    clearSelectedPallet: () => {
      dispatch(palletActions.clearSelectedPallet());
    },

    setFilter: (filter: PalletFilter) => {
      dispatch(palletActions.setFilter(filter));
      // Reload pallets with new filter
      getPallets({ limit: 10 })
        .then((response) => {
          const palletData = response.data || [];
          dispatch(
            palletActions.fetchSuccess(palletData as unknown as Pallet)
          );
        })
        .catch((error) => {
          dispatch(palletActions.fetchError(error as Error));
        });
    },

    setPage: (page: number) => {
      dispatch(palletActions.setPage(page));
      // Reload pallets with new page
      getPallets({ limit: 10 })
        .then((response) => {
          const palletData = response.data || [];
          dispatch(
            palletActions.fetchSuccess(palletData as unknown as Pallet)
          );
        })
        .catch((error) => {
          dispatch(palletActions.fetchError(error as Error));
        });
    },
  }),
});

// Create custom hooks for consumer components
export const usePalletContext = () => useContext();

export const usePallet = (id: string) => {
  const [, api] = usePalletContext();
  return useDataFetch(() => api.getPalletById(id), { immediate: true });
};

export const usePaginatedPallets = (filter: PalletFilter = FILTER_ALL) => {
  const [state, api] = usePalletContext();
  return usePaginatedData(
    async (page: number) => {
      await api.fetchPallets(page, filter);
      return {
        data: state.filteredPallets,
        totalCount: state.total,
        hasMore: state.filteredPallets.length < state.total,
      };
    },
    {
      initialPage: state.page,
      pageSize: state.pageSize,
      immediate: true,
    }
  );
};

export const useCreatePallet = () => {
  const [, api] = usePalletContext();
  return useDataMutation(api.createPallet);
};

export const useUpdatePallet = (id: string) => {
  const [, api] = usePalletContext();
  return useDataMutation((data: Partial<Pallet>) => api.updatePallet(id, data));
};

export const useDeletePallet = () => {
  const [, api] = usePalletContext();
  return useDataMutation(api.deletePallet);
};

export const useFilteredPallets = () => {
  const [state, api] = usePalletContext();

  return {
    pallets: state.filteredPallets,
    filter: state.currentFilter,
    setFilter: api.setFilter,
    loading: state.status === 'loading',
    error: state.error,
  };
};

// Export the renamed provider component for clarity
export const PalletProvider: React.FC<{ children: ReactNode }> = Provider;

// For backward compatibility during migration
export const PalletContext = {
  Provider: PalletProvider,
  Consumer: React.createContext<any>(null).Consumer,
};
