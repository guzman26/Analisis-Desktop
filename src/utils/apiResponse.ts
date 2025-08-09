import { ApiError } from './apiErrors';

type StandardWrapper = {
  status?: 'success' | 'fail' | 'error';
  message?: string;
  data?: any;
  meta?: Record<string, any>;
};

export const isStandardWrapper = (v: unknown): v is StandardWrapper => {
  return !!v && typeof v === 'object' && 'status' in (v as any);
};

export const unwrapApiResponse = <T = any>(raw: any): T => {
  if (raw == null) return raw as T;

  if (isStandardWrapper(raw)) {
    if (raw.status && raw.status !== 'success') {
      throw new ApiError({
        message: raw.message || 'Error de API',
        status: raw.status,
        meta: raw.meta,
      });
    }
    // If wrapper, prefer raw.data, otherwise return raw
    return (raw.data ?? raw) as T;
  }

  return raw as T;
};
