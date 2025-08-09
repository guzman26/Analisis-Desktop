// Unified API client with simplified logic
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

    // Attempt to parse body (even for non-2xx) to extract standardized error info
    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } catch {
      // ignore body parse errors
    }

    // Handle non-OK with standardized shape
    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        `HTTP ${response.status}`;
      const error: any = new Error(message);
      if (data && typeof data === 'object') {
        error.status = data.status || 'error';
        error.meta = data.meta;
      }
      error.httpStatus = response.status;
      throw error;
    }

    // Standardized wrapper { status, message, data, meta }
    if (data && typeof data === 'object') {
      // If backend used wrapper with non-success status even with 2xx, treat as error
      if (data.status && data.status !== 'success') {
        const error: any = new Error(data.message || 'Error de API');
        error.status = data.status;
        error.meta = data.meta;
        throw error;
      }

      // If the response follows the standardized wrapper, always return the wrapper as-is
      if (data.status && data.data !== undefined) {
        return data as T;
      }
    }

    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
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
