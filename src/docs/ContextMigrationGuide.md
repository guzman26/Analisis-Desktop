# Context Migration Guide

## Overview

This document provides guidance for migrating the existing React context providers to our new advanced reducer-based architecture. The new pattern offers improved type safety, standardized state management, better error handling, and reusable hooks for common operations.

## New Context Architecture

Our new context architecture uses a factory pattern with the following features:

1. **Typed State**: Each context has a well-defined state interface that extends `BaseState`
2. **Typed Actions**: Actions are typed using discriminated unions
3. **Reducer Pattern**: State changes flow through a reducer with predictable updates
4. **API Layer**: Each context provides an API interface for interacting with the context
5. **Custom Hooks**: Reusable hooks for common operations (fetch, mutations, pagination)
6. **Error Handling**: Standardized error handling with Error Boundaries
7. **Suspense Support**: Built-in support for React Suspense

## Migration Steps

### Step 1: Create the New Context File

Create a new file for your context (e.g., `YourContext.new.tsx`) following this template:

```typescript
import React, { ReactNode } from 'react';
import { YourDataType } from '@/types';
import { yourApiFunction } from '@/api/endpoints';
import {
  createContextFactory,
  BaseState,
  BaseAction,
} from './core/createContext';
import { ActionType } from './core/apiUtils';

// Define the state shape
interface YourContextState extends BaseState {
  // Add your specific state properties here
  yourData: YourDataType[];
  // data property is required by BaseState and should contain your main data
  data: YourDataType[];
}

// Define custom action types specific to this context
enum YourContextActionType {
  CUSTOM_ACTION = 'CUSTOM_ACTION',
}

// Define your action types
type YourContextAction =
  | BaseAction // Generic actions like FETCH_START, FETCH_SUCCESS, etc.
  | { type: YourContextActionType.CUSTOM_ACTION; payload: any };

// Initial state
const initialState: YourContextState = {
  status: 'idle',
  data: [],
  yourData: [],
  error: null,
  lastUpdated: undefined,
};

// Create action creators
const yourContextActions = {
  // Generic actions
  fetchStart: () => ({ type: ActionType.FETCH_START }),
  fetchSuccess: (data: YourDataType[]) => ({
    type: ActionType.FETCH_SUCCESS,
    payload: data,
  }),
  fetchError: (error: Error) => ({
    type: ActionType.FETCH_ERROR,
    payload: error,
  }),
  // Custom actions
  customAction: (data: any) => ({
    type: YourContextActionType.CUSTOM_ACTION,
    payload: data,
  }),
};

// Define the reducer
const yourContextReducer = (
  state: YourContextState,
  action: YourContextAction
): YourContextState => {
  // Handle API actions
  switch (action.type) {
    case ActionType.FETCH_START:
      return {
        ...state,
        status: 'loading',
        error: null,
      };
    case ActionType.FETCH_SUCCESS:
      const data = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        status: 'success',
        yourData: data,
        data: data,
        error: null,
        lastUpdated: Date.now(),
      };
    case ActionType.FETCH_ERROR:
      return {
        ...state,
        status: 'error',
        error: action.payload as Error,
        lastUpdated: Date.now(),
      };

    // Handle custom actions
    case YourContextActionType.CUSTOM_ACTION:
      return {
        ...state,
        // Handle your custom action logic here
      };
    default:
      return state;
  }
};

// Define your API interface
interface YourContextAPI {
  fetchData: () => Promise<void>;
  // Add your other API methods here
}

// Create the context
const [useYourContext, YourContextProvider, YourContext] = createContextFactory<
  YourContextState,
  YourContextAction,
  YourContextAPI
>({
  name: 'YourContext',
  initialState,
  reducer: yourContextReducer,
  createAPI: (dispatch, getState) => ({
    fetchData: async () => {
      dispatch(yourContextActions.fetchStart());
      try {
        const data = await yourApiFunction();
        const typedData = Array.isArray(data) ? data : [];
        dispatch(yourContextActions.fetchSuccess(typedData));
      } catch (error) {
        dispatch(yourContextActions.fetchError(error as Error));
        throw error;
      }
    },
    // Implement your other API methods here
  }),
});

// Create custom hooks for common operations
export const useYourData = () => {
  const [state, api] = useYourContext();

  // Fetch data when the hook is first used
  React.useEffect(() => {
    if (state.status === 'idle') {
      api.fetchData();
    }
  }, [state.status, api]);

  return {
    data: state.yourData,
    loading: state.status === 'loading',
    error: state.error,
    refetch: api.fetchData,
  };
};

// Backward compatibility
const LegacyContext = React.createContext<any>(null);

// Export everything
export {
  useYourContext,
  YourContextProvider,
  YourContext as YourContextClass, // For compatibility with legacy code
  LegacyContext as YourContext, // For backward compatibility
};
```

### Step 2: Update the AppProviders.tsx File

Update the AppProviders component to use your new context provider:

```typescript
import { YourContextProvider } from './YourContext.new';

// Add your provider to the providers array
const providers: ProviderConfig[] = [
  // ...
  { Provider: YourContextProvider, withErrorBoundary: true },
  // ...
];
```

### Step 3: Update Components

Update your components to use the new context hooks:

```typescript
// Before
import { YourContext } from '../contexts/YourContext';

function YourComponent() {
  const context = useContext(YourContext);

  return (
    // ...
  );
}

// After
import { useYourContext, useYourData } from '../contexts/YourContext.new';

function YourComponent() {
  // Option 1: Use the custom hook (recommended)
  const { data, loading, error, refetch } = useYourData();

  // Option 2: Use the raw context
  const [state, api] = useYourContext();

  return (
    // ...
  );
}
```

## Tips for a Smooth Migration

1. **One Context at a Time**: Migrate one context at a time to minimize disruption
2. **Test Thoroughly**: Test each migration thoroughly before moving to the next
3. **Backward Compatibility**: Use the backward compatibility exports during the transition period
4. **Type Safety**: Ensure all your types are correctly defined and consistent
5. **Documentation**: Document each context's API and custom hooks for team reference

## Common Issues and Solutions

### Type Errors

- **API Response Mismatches**: Ensure your API functions return the expected data types
- **Action Payload Types**: Use proper typing for action payloads
- **Array vs Single Item**: Handle both array and single item responses appropriately

### Performance Considerations

- Use proper dependency arrays in useEffect hooks
- Implement memoization for expensive computations
- Consider using React.memo for components that re-render frequently

## Example Migration

See the `src/examples/BoxesExampleComponent.tsx` file for a practical example of using the new BoxesContext pattern.
