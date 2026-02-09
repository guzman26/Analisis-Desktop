import type {
  CreateDispatchRequest,
  Dispatch,
  DispatchDestination,
  DispatchState,
} from '@/types';

export type DispatchRecord = Dispatch;
export type DispatchStatus = DispatchState;
export type DispatchTarget = DispatchDestination;

export interface DispatchFilters {
  estado?: DispatchState;
  destino?: DispatchDestination;
  startDate?: string;
  endDate?: string;
}

export interface DispatchMutationResult {
  success: boolean;
  data?: DispatchRecord;
  message?: string;
}

export type DispatchDraftInput = CreateDispatchRequest;
