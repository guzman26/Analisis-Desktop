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
    // Standardized wrapper handling
    if (typeof response.status === 'string') {
      const status = response.status;
      if (status !== 'success') {
        throw new Error(response.message || 'Error de API');
      }
      // Success case: prefer data.items if available
      if (response.data?.items !== undefined) {
        return Array.isArray(response.data.items)
          ? response.data.items
          : [response.data.items].filter(Boolean);
      }
      if (Array.isArray(response.data)) return response.data;
      if (typeof response.data === 'object') {
        // Try common arrays under data
        const nestedArrays = [
          response.data.items,
          response.data.customers,
          response.data.pallets,
          response.data.boxes,
          response.data.history,
          response.data.movements,
          response.data.orders,
        ];
        for (const arr of nestedArrays) {
          if (Array.isArray(arr)) return arr;
        }
        // Single object
        return [response.data];
      }
    }

    // Legacy style: Handle error responses with statusCode
    if (typeof response.statusCode === 'number' && response.statusCode >= 400) {
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
