// Simplified response data extractor
import { unwrapApiResponse } from './apiResponse';

export const extractDataFromResponse = async (
  response: any
): Promise<any[]> => {
  if (!response) return [];

  // Parse string JSON if needed
  if (typeof response === 'string') {
    try {
      return extractDataFromResponse(JSON.parse(response));
    } catch {
      return [];
    }
  }

  // If already an array, return it
  if (Array.isArray(response)) return response;

  // Try to unwrap standardized wrapper
  const unwrapped = unwrapApiResponse<any>(response);

  if (Array.isArray(unwrapped)) return unwrapped;

  // Common containers
  const candidates = [
    unwrapped?.items,
    unwrapped?.boxes,
    unwrapped?.pallets,
    unwrapped?.customers,
    unwrapped?.orders,
    unwrapped,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) return candidate;
    if (typeof candidate === 'object') return [candidate];
    if (typeof candidate === 'string')
      return extractDataFromResponse(candidate);
  }

  return [];
};
