import React, { ReactNode } from 'react';
import { Box, Location, PaginatedResponse, BoxFilterParams } from '@/types';
import { getUnassignedBoxesByLocation } from '@/api/endpoints';
import {
  createContextFactory,
  BaseState,
  BaseAction,
} from './core/createContext';
import { ActionType } from './core/apiUtils';
// import { extractDataFromResponse } from '@/utils';
// Removing unused import
// import { useDataFetch, useDataMutation } from './core/dataHooks';

// Define the state shape
interface BoxesState extends BaseState {
  unassignedBoxes: Box[];
  currentLocation: Location | null;
  lastUpdated: number | undefined;
  data: Box[]; // Required by DataState constraint
  nextKey: string | null;
  limit: number;
  filterParams: BoxFilterParams;
}

// Define action types for this context
type BoxesAction = BaseAction<ActionType | string>;

// Add custom action types specific to boxes context
enum BoxesActionType {
  SET_LOCATION = 'SET_LOCATION',
  SET_NEXT_KEY = 'SET_NEXT_KEY',
  APPEND_BOXES = 'APPEND_BOXES',
  RESET_BOXES = 'RESET_BOXES',
  SET_FILTERS = 'SET_FILTERS',
}

// Add a type guard to check if an action is a boxes action
const isBoxesAction = (action: any): action is BoxesAction => {
  return (
    action.type === BoxesActionType.SET_LOCATION ||
    action.type === BoxesActionType.SET_NEXT_KEY ||
    action.type === BoxesActionType.APPEND_BOXES ||
    action.type === BoxesActionType.RESET_BOXES ||
    action.type === BoxesActionType.SET_FILTERS
  );
};

// Create initial state
const initialState: BoxesState = {
  unassignedBoxes: [],
  currentLocation: null,
  data: [], // Initialize the required data property
  status: 'idle',
  error: null,
  lastUpdated: undefined,
  nextKey: null,
  limit: 50,
  filterParams: {},
};

// Create action creators with array type for boxes data
const boxesActions = {
  // Generic type is Box[] (array) not Box
  fetchStart: (): BoxesAction => ({
    type: ActionType.FETCH_START,
  }),
  fetchSuccess: (data: Box[]): BoxesAction => ({
    type: ActionType.FETCH_SUCCESS,
    payload: data,
  }),
  fetchError: (error: Error): BoxesAction => ({
    type: ActionType.FETCH_ERROR,
    payload: error,
  }),
  setLocation: (location: Location): BoxesAction => ({
    type: BoxesActionType.SET_LOCATION,
    payload: location,
  }),
  setNextKey: (nextKey: string | null): BoxesAction => ({
    type: BoxesActionType.SET_NEXT_KEY,
    payload: nextKey,
  }),
  appendBoxes: (boxes: Box[]): BoxesAction => ({
    type: BoxesActionType.APPEND_BOXES,
    payload: boxes,
  }),
  resetBoxes: (): BoxesAction => ({
    type: BoxesActionType.RESET_BOXES,
  }),
  setFilters: (filters: BoxFilterParams): BoxesAction => ({
    type: BoxesActionType.SET_FILTERS,
    payload: filters,
  }),
};

// Create a custom reducer
const boxesReducer = (
  state: BoxesState = initialState,
  action: BoxesAction
): BoxesState => {
  // Handle boxes-specific actions
  if (isBoxesAction(action)) {
    switch (action.type) {
      case BoxesActionType.SET_LOCATION:
        return {
          ...state,
          currentLocation: action.payload as Location,
        };
      case BoxesActionType.SET_NEXT_KEY:
        return { ...state, nextKey: (action.payload as string | null) ?? null };
      case BoxesActionType.SET_FILTERS:
        return {
          ...state,
          filterParams: (action.payload as BoxFilterParams) || {},
        };
      case BoxesActionType.APPEND_BOXES: {
        const boxes = Array.isArray(action.payload)
          ? (action.payload as Box[])
          : [];
        // Merge by codigo to avoid duplicates when paginating
        const map = new Map<string, Box>();
        for (const b of state.unassignedBoxes) map.set(b.codigo, b);
        for (const b of boxes) map.set(b.codigo, b);
        const merged = Array.from(map.values());
        return {
          ...state,
          status: 'success',
          unassignedBoxes: merged,
          data: merged,
          error: null,
          lastUpdated: Date.now(),
        };
      }
      case BoxesActionType.RESET_BOXES:
        return { ...state, unassignedBoxes: [], data: [], nextKey: null };
    }
  }

  // Handle API actions
  switch (action.type) {
    case ActionType.FETCH_SUCCESS: {
      // Ensure we're handling the payload correctly as an array
      const boxes = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        status: 'success',
        unassignedBoxes: boxes,
        data: boxes, // Update the data property too
        error: null,
        lastUpdated: Date.now(),
      };
    }
    case ActionType.FETCH_START:
      return { ...state, status: 'loading', error: null };
    case ActionType.FETCH_ERROR:
      return { ...state, status: 'error', error: action.payload as Error };
    default:
      return state;
  }
};

// Define the API interface
type BoxesAPI = {
  fetchUnassignedBoxes: (
    location: Location,
    opts?: {
      limit?: number;
      lastKey?: string;
      reset?: boolean;
    } & BoxFilterParams
  ) => Promise<void>;
  setLocation: (location: Location) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setServerFilters: (filters: BoxFilterParams) => Promise<void>;
};

// Create the context using our factory
const { Provider, useContext } = createContextFactory<
  BoxesState,
  BoxesAction,
  BoxesAPI
>({
  name: 'Boxes',
  initialState,
  reducer: boxesReducer,
  createAPI: (dispatch) => ({
    // API implementation using hooks internally
    fetchUnassignedBoxes: async (
      location: Location,
      opts?: {
        limit?: number;
        lastKey?: string;
        reset?: boolean;
      } & BoxFilterParams
    ) => {
      dispatch(boxesActions.fetchStart());
      try {
        // Set the current location
        dispatch(boxesActions.setLocation(location));

        const { limit = 50, lastKey, reset = false, ...filters } = opts || {};
        // Persist filters in state so loadMore/refresh reuse them
        dispatch(boxesActions.setFilters(filters));
        const response: PaginatedResponse<Box> =
          await getUnassignedBoxesByLocation({
            ubicacion: location,
            limit,
            lastKey,
            ...filters,
          });

        const items: Box[] = Array.isArray(response?.items)
          ? response.items
          : [];
        const nextKey = response?.nextKey ?? null;

        if (reset) {
          dispatch(boxesActions.fetchSuccess(items));
        } else if (lastKey) {
          dispatch(boxesActions.appendBoxes(items));
        } else {
          dispatch(boxesActions.fetchSuccess(items));
        }
        dispatch(boxesActions.setNextKey(nextKey));
      } catch (error) {
        dispatch(boxesActions.fetchError(error as Error));
        throw error;
      }
    },

    setLocation: (location: Location) => {
      dispatch(boxesActions.setLocation(location));
    },

    loadMore: async () => {
      const state = (Provider as any).StateContext
        ?._currentValue?.[0] as BoxesState;
      const apiSelf = (Provider as any).StateContext
        ?._currentValue?.[1] as BoxesAPI;
      if (state?.nextKey && apiSelf) {
        await apiSelf.fetchUnassignedBoxes(state.currentLocation as Location, {
          limit: state.limit,
          lastKey: state.nextKey,
          ...state.filterParams,
        });
      }
    },
    refresh: async () => {
      const state = (Provider as any).StateContext
        ?._currentValue?.[0] as BoxesState;
      const apiSelf = (Provider as any).StateContext
        ?._currentValue?.[1] as BoxesAPI;
      if (apiSelf && state?.currentLocation) {
        await apiSelf.fetchUnassignedBoxes(state.currentLocation, {
          limit: state.limit,
          reset: true,
          ...state.filterParams,
        });
      }
    },
    setServerFilters: async (_filters: BoxFilterParams) => {
      // Esta función es remplazada por el hook; mantenemos compatibilidad
      return Promise.resolve();
    },
  }),
});

// Create custom hooks for consumer components
export const useBoxesContext = () => useContext();

export const useUnassignedBoxes = (location: Location) => {
  const [state, api] = useBoxesContext();

  // Fetch unassigned boxes when location changes
  React.useEffect(() => {
    if (location) {
      api.fetchUnassignedBoxes(location, { limit: state.limit, reset: true });
    }
  }, [location]);

  const loadMore = React.useCallback(async () => {
    if (state.nextKey) {
      await api.fetchUnassignedBoxes(location, {
        limit: state.limit,
        lastKey: state.nextKey,
        ...state.filterParams,
      });
    }
  }, [api, location, state.nextKey, state.limit]);

  const refresh = React.useCallback(async () => {
    await api.fetchUnassignedBoxes(location, {
      limit: state.limit,
      reset: true,
      ...state.filterParams,
    });
  }, [api, location, state.limit]);

  const setServerFilters = React.useCallback(
    async (filters: BoxFilterParams) => {
      await api.fetchUnassignedBoxes(location, {
        limit: state.limit,
        reset: true,
        ...filters,
      });
    },
    [api, location, state.limit]
  );

  return {
    unassignedBoxes: state.unassignedBoxes,
    loading: state.status === 'loading',
    error: state.error,
    hasMore: Boolean(state.nextKey),
    loadMore,
    refresh,
    setServerFilters,
  };
};

// Export the renamed provider component for clarity
export const BoxesProvider: React.FC<{ children: ReactNode }> = Provider;

// For backward compatibility during migration
export const BoxesContext = {
  Provider: BoxesProvider,
  Consumer: React.createContext<any>(null).Consumer,
};
