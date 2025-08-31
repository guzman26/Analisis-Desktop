export type ApiStatus = 'success' | 'fail' | 'error';

export class ApiError extends Error {
  public readonly httpStatus?: number;
  public readonly status: ApiStatus;
  public readonly code?: string | number;
  public readonly meta?: Record<string, any>;

  constructor(options: {
    message: string;
    httpStatus?: number;
    status?: ApiStatus;
    code?: string | number;
    meta?: Record<string, any>;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.httpStatus = options.httpStatus;
    this.status = options.status ?? 'error';
    this.code = options.code;
    this.meta = options.meta;
  }
}

export const normalizeApiError = (
  err: unknown,
  fallbackMessage = 'Error de API'
) => {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    const anyErr = err as any;
    return new ApiError({
      message: anyErr.message || fallbackMessage,
      httpStatus: anyErr.httpStatus,
      status: anyErr.status || 'error',
      code: anyErr.code,
      meta: anyErr.meta,
    });
  }
  return new ApiError({ message: fallbackMessage, status: 'error' });
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export const toResult = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: normalizeApiError(e) };
  }
};



