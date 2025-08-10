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
    // If wrapper, but body is another JSON string (lambda-proxy), parse inner
    const data = raw.data;
    if (data && typeof data === 'object' && typeof (data as any).body === 'string') {
      try {
        const inner = JSON.parse((data as any).body);
        if (isStandardWrapper(inner)) {
          if (inner.status && inner.status !== 'success') {
            throw new ApiError({ message: inner.message || 'Error de API', status: inner.status, meta: inner.meta });
          }
          return (inner.data ?? inner) as T;
        }
        return inner as T;
      } catch {
        // fall through and return data
      }
    }
    // If wrapper, prefer raw.data, otherwise return raw
    return (data ?? raw) as T;
  }

  return raw as T;
};
