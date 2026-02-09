import { ApiError } from '@/utils/apiErrors';

export type DomainErrorCode =
  | 'NETWORK'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface DomainError {
  code: DomainErrorCode;
  message: string;
  httpStatus?: number;
  requestId?: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export class DomainErrorException extends Error implements DomainError {
  code: DomainErrorCode;
  httpStatus?: number;
  requestId?: string;
  details?: Record<string, unknown>;
  retryable: boolean;

  constructor(error: DomainError) {
    super(error.message);
    this.name = 'DomainErrorException';
    this.code = error.code;
    this.httpStatus = error.httpStatus;
    this.requestId = error.requestId;
    this.details = error.details;
    this.retryable = error.retryable;
  }
}

const getCodeByHttpStatus = (httpStatus?: number): DomainErrorCode => {
  if (!httpStatus) return 'UNKNOWN';
  if (httpStatus === 401) return 'UNAUTHORIZED';
  if (httpStatus === 403) return 'FORBIDDEN';
  if (httpStatus === 404) return 'NOT_FOUND';
  if (httpStatus === 409) return 'CONFLICT';
  if (httpStatus === 408) return 'TIMEOUT';
  if (httpStatus >= 400 && httpStatus < 500) return 'VALIDATION';
  if (httpStatus >= 500) return 'SERVER';
  return 'UNKNOWN';
};

export const normalizeDomainError = (error: unknown): DomainError => {
  if (error instanceof DomainErrorException) {
    return {
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      requestId: error.requestId,
      details: error.details,
      retryable: error.retryable,
    };
  }

  if (error instanceof ApiError) {
    const details =
      error.meta && typeof error.meta === 'object'
        ? (error.meta as Record<string, unknown>)
        : undefined;
    return {
      code: getCodeByHttpStatus(error.httpStatus),
      message: error.message || 'Error de API',
      httpStatus: error.httpStatus,
      requestId:
        typeof details?.requestId === 'string'
          ? details.requestId
          : typeof details?.requestID === 'string'
            ? details.requestID
            : undefined,
      details,
      retryable: !error.httpStatus || error.httpStatus >= 500,
    };
  }

  if (error instanceof Error) {
    const message = error.message || 'Error inesperado';
    const lower = message.toLowerCase();
    if (lower.includes('network') || lower.includes('fetch')) {
      return {
        code: 'NETWORK',
        message,
        retryable: true,
      };
    }
    if (lower.includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message,
        retryable: true,
      };
    }
    return {
      code: 'UNKNOWN',
      message,
      retryable: false,
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'Error inesperado',
    retryable: false,
  };
};

export const toDomainErrorException = (error: unknown): DomainErrorException =>
  new DomainErrorException(normalizeDomainError(error));

export const toUserMessage = (error: unknown, fallback: string): string =>
  normalizeDomainError(error).message || fallback;

export const isRetryableDomainError = (error: unknown): boolean =>
  normalizeDomainError(error).retryable;

export type ModuleErrorCode = DomainErrorCode;
export type ModuleError = DomainError;
export const normalizeModuleError = normalizeDomainError;
