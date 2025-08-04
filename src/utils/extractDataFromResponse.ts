// Simplified response data extractor
export const extractDataFromResponse = async (
  response: any
): Promise<any[]> => {
  if (!response) return [];

  // Handle string body (parse JSON)
  if (typeof response === 'string') {
    try {
      return extractDataFromResponse(JSON.parse(response));
    } catch {
      return [];
    }
  }

  // Direct array
  if (Array.isArray(response)) return response;

  // Handle nested structures
  if (typeof response === 'object') {
    // Handle error responses first
    if (response.statusCode >= 400) {
      throw new Error(
        `Error ${response.statusCode}: ${response.message || 'Unknown error'}`
      );
    }

    // Check common data paths
    const paths = [
      response.data?.items,
      response.data,
      response.pallets,
      response.body,
      response.items,
      response.customers,
    ];

    for (const data of paths) {
      if (data) {
        if (typeof data === 'string') {
          return extractDataFromResponse(data);
        }
        if (Array.isArray(data)) {
          return data;
        }
        if (typeof data === 'object') {
          return [data];
        }
      }
    }

    // If no nested paths match, but we have a valid object with expected properties
    // (like a Box object with codigo, calibre, etc.), treat it as a single item
    if (response.codigo || response.id || response.palletId) {
      // Si es un objeto Box con customInfo, procesarlo
      if (response.customInfo && Array.isArray(response.customInfo)) {
        const { processBoxCustomInfo } = await import('./index');
        response.customInfo = processBoxCustomInfo(response.customInfo);
      }
      return [response];
    }
  }

  return [];
};
