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
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle paginated responses
    if (data?.data?.items !== undefined) {
      return data as T;
    }

    // Handle wrapped responses
    if (data?.data !== undefined) {
      return data.data as T;
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
