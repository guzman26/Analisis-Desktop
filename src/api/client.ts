// Unified API client with simplified logic
import { ApiError } from '@/utils/apiErrors';
const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  console.error('VITE_API_URL not found in environment variables');
}

// Generic query builder
export const buildQuery = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  return query.toString();
};

// Unified HTTP client
export const api = async <T = any>(
  endpoint: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    let rawData: any = null;
    try {
      if (contentType.includes('application/json')) {
        rawData = await response.json();
      } else {
        const text = await response.text();
        try {
          rawData = JSON.parse(text);
        } catch {
          rawData = text;
        }
      }
    } catch {
      rawData = null;
    }

    if (!response.ok) {
      const message =
        (rawData &&
          typeof rawData === 'object' &&
          (rawData.message || rawData.error)) ||
        `HTTP ${response.status}`;
      throw new ApiError({
        message,
        httpStatus: response.status,
        status: (rawData && (rawData.status as any)) || 'error',
        meta: (rawData && (rawData.meta as any)) || undefined,
      });
    }

    // Always return standardized wrapper when present
    if (rawData && typeof rawData === 'object' && 'status' in rawData) {
      const status = (rawData as any).status;
      if (status && status !== 'success') {
        throw new ApiError({
          message: (rawData as any).message || 'Error de API',
          status,
          meta: (rawData as any).meta,
        });
      }
      return rawData as T;
    }

    return rawData as T;
  } catch (error) {
    const normalized =
      error instanceof ApiError
        ? error
        : new ApiError({ message: (error as any)?.message || 'Error de API' });
    console.error('API request failed:', normalized);
    throw normalized;
  }
};

// Convenience methods
export const get = <T = any>(
  endpoint: string,
  params?: Record<string, any>
) => {
  const query = params ? `?${buildQuery(params)}` : '';
  return api<T>(`${endpoint}${query}`);
};

export const post = <T = any>(endpoint: string, body?: any) =>
  api<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });

export const put = <T = any>(endpoint: string, body?: any) =>
  api<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });

export const del = <T = any>(endpoint: string) =>
  api<T>(endpoint, { method: 'DELETE' });
