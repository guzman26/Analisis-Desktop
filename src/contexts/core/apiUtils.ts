import { BaseAction, BaseState } from './createContext';

// Common action types for data fetching
export enum ActionType {
  FETCH_START = 'FETCH_START',
  FETCH_SUCCESS = 'FETCH_SUCCESS',
  FETCH_ERROR = 'FETCH_ERROR',
  CREATE_START = 'CREATE_START',
  CREATE_SUCCESS = 'CREATE_SUCCESS',
  CREATE_ERROR = 'CREATE_ERROR',
  UPDATE_START = 'UPDATE_START',
  UPDATE_SUCCESS = 'UPDATE_SUCCESS',
  UPDATE_ERROR = 'UPDATE_ERROR',
  DELETE_START = 'DELETE_START',
  DELETE_SUCCESS = 'DELETE_SUCCESS',
  DELETE_ERROR = 'DELETE_ERROR',
  RESET = 'RESET',
}

// Generic API action types
export interface ApiAction<T = any> extends BaseAction {
  type: ActionType;
  payload?: T;
  meta?: {
    entityId?: string | number;
    error?: Error;
  };
}

// Base state with data
export interface DataState<T = any> extends BaseState {
  data: T | null;
  entities?: Record<string | number, any>;
  lastUpdated?: number;
}

// Standard action creators for CRUD operations
export const createActions = <T, ID extends string | number = string>() => ({
  // Fetch actions
  fetchStart: (): ApiAction => ({
    type: ActionType.FETCH_START,
  }),
  fetchSuccess: (data: T): ApiAction<T> => ({
    type: ActionType.FETCH_SUCCESS,
    payload: data,
  }),
  fetchError: (error: Error): ApiAction => ({
    type: ActionType.FETCH_ERROR,
    meta: { error },
  }),

  // Create actions
  createStart: (): ApiAction => ({
    type: ActionType.CREATE_START,
  }),
  createSuccess: (data: T): ApiAction<T> => ({
    type: ActionType.CREATE_SUCCESS,
    payload: data,
  }),
  createError: (error: Error): ApiAction => ({
    type: ActionType.CREATE_ERROR,
    meta: { error },
  }),

  // Update actions
  updateStart: (id: ID): ApiAction => ({
    type: ActionType.UPDATE_START,
    meta: { entityId: id },
  }),
  updateSuccess: (id: ID, data: Partial<T>): ApiAction<Partial<T>> => ({
    type: ActionType.UPDATE_SUCCESS,
    payload: data,
    meta: { entityId: id },
  }),
  updateError: (id: ID, error: Error): ApiAction => ({
    type: ActionType.UPDATE_ERROR,
    meta: { entityId: id, error },
  }),

  // Delete actions
  deleteStart: (id: ID): ApiAction => ({
    type: ActionType.DELETE_START,
    meta: { entityId: id },
  }),
  deleteSuccess: (id: ID): ApiAction => ({
    type: ActionType.DELETE_SUCCESS,
    meta: { entityId: id },
  }),
  deleteError: (id: ID, error: Error): ApiAction => ({
    type: ActionType.DELETE_ERROR,
    meta: { entityId: id, error },
  }),

  // Reset state
  reset: (): ApiAction => ({
    type: ActionType.RESET,
  }),
});

// Standard reducer for common CRUD operations
export const createReducer = <T, S extends DataState<T> = DataState<T>>(
  initialState: S,
  customReducers?: (state: S, action: ApiAction) => S
) => {
  return (state: S = initialState, action: ApiAction): S => {
    switch (action.type) {
      case ActionType.FETCH_START:
      case ActionType.CREATE_START:
      case ActionType.UPDATE_START:
      case ActionType.DELETE_START:
        return {
          ...state,
          status: 'loading',
          error: null,
        } as S;

      case ActionType.FETCH_SUCCESS:
        return {
          ...state,
          status: 'success',
          data: action.payload as T,
          error: null,
          lastUpdated: Date.now(),
        } as S;

      case ActionType.CREATE_SUCCESS:
        return {
          ...state,
          status: 'success',
          // Assuming data is an array for collections
          data: Array.isArray(state.data)
            ? [...(state.data || []), action.payload]
            : action.payload,
          error: null,
          lastUpdated: Date.now(),
        } as S;

      case ActionType.UPDATE_SUCCESS:
        if (!action.meta?.entityId) return state;

        // Handle array data
        if (Array.isArray(state.data)) {
          return {
            ...state,
            status: 'success',
            data: state.data.map((item) =>
              (item as any).id === action.meta?.entityId
                ? { ...item, ...action.payload }
                : item
            ),
            error: null,
            lastUpdated: Date.now(),
          } as S;
        }

        // Handle single entity data
        return {
          ...state,
          status: 'success',
          data: {
            ...(state.data as object),
            ...(action.payload as object),
          } as T,
          error: null,
          lastUpdated: Date.now(),
        } as S;

      case ActionType.DELETE_SUCCESS:
        if (!action.meta?.entityId || !Array.isArray(state.data)) return state;

        return {
          ...state,
          status: 'success',
          data: state.data.filter(
            (item) => (item as any).id !== action.meta?.entityId
          ),
          error: null,
          lastUpdated: Date.now(),
        } as S;

      case ActionType.FETCH_ERROR:
      case ActionType.CREATE_ERROR:
      case ActionType.UPDATE_ERROR:
      case ActionType.DELETE_ERROR:
        return {
          ...state,
          status: 'error',
          error: action.meta?.error || new Error('Unknown error'),
        } as S;

      case ActionType.RESET:
        return initialState;

      default:
        // Allow for custom reducers
        return customReducers ? customReducers(state, action) : state;
    }
  };
};

// Helper to create an entity map from an array
export function normalizeEntities<T extends { id: string | number }>(
  entities: T[]
): Record<string | number, T> {
  return entities.reduce(
    (acc, entity) => {
      acc[entity.id] = entity;
      return acc;
    },
    {} as Record<string | number, T>
  );
}

// Helper for generic API error handling
export const handleApiError = (error: any): Error => {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && error.message) {
    return new Error(error.message);
  }

  return new Error('An unknown error occurred');
};
