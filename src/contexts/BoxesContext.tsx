import React, { ReactNode } from 'react';
import { Box, Location } from '@/types';
import { getUnassignedBoxesByLocation } from '@/api/endpoints';
import {
  createContextFactory,
  BaseState,
  BaseAction,
} from './core/createContext';
import { ActionType } from './core/apiUtils';
import { extractDataFromResponse } from '@/utils';
// Removing unused import
// import { useDataFetch, useDataMutation } from './core/dataHooks';

// Define the state shape
interface BoxesState extends BaseState {
  unassignedBoxes: Box[];
  currentLocation: Location | null;
  lastUpdated: number | undefined;
  data: Box[]; // Required by DataState constraint
}

// Define action types for this context
type BoxesAction = BaseAction<ActionType | string>;

// Add custom action types specific to boxes context
enum BoxesActionType {
  SET_LOCATION = 'SET_LOCATION',
}

// Add a type guard to check if an action is a boxes action
const isBoxesAction = (action: any): action is BoxesAction => {
  return action.type === BoxesActionType.SET_LOCATION;
};

// Create initial state
const initialState: BoxesState = {
  unassignedBoxes: [],
  currentLocation: null,
  data: [], // Initialize the required data property
  status: 'idle',
  error: null,
  lastUpdated: undefined,
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
    }
  }

  // Handle API actions
  switch (action.type) {
    case ActionType.FETCH_SUCCESS:
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
  fetchUnassignedBoxes: (location: Location) => Promise<void>;
  setLocation: (location: Location) => void;
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
    fetchUnassignedBoxes: async (location: Location) => {
      dispatch(boxesActions.fetchStart());
      try {
        // Set the current location
        dispatch(boxesActions.setLocation(location));

        // Then fetch the unassigned boxes for that location
        // Get the boxes and ensure proper typing
        const boxes = await getUnassignedBoxesByLocation(location);
        // Make sure we're passing an array to fetchSuccess
        const parsedBoxes = extractDataFromResponse(boxes);
        const boxesArray = Array.isArray(parsedBoxes)
          ? parsedBoxes
          : [parsedBoxes].filter(Boolean);
        dispatch(boxesActions.fetchSuccess(boxesArray));
      } catch (error) {
        dispatch(boxesActions.fetchError(error as Error));
        throw error;
      }
    },

    setLocation: (location: Location) => {
      dispatch(boxesActions.setLocation(location));
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
      api.fetchUnassignedBoxes(location);
    }
  }, [location, api]);

  return {
    unassignedBoxes: state.unassignedBoxes,
    loading: state.status === 'loading',
    error: state.error,
  };
};

// Export the renamed provider component for clarity
export const BoxesProvider: React.FC<{ children: ReactNode }> = Provider;

// For backward compatibility during migration
export const BoxesContext = {
  Provider: BoxesProvider,
  Consumer: React.createContext<any>(null).Consumer,
};
