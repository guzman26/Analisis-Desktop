// Simplified response data extractor
export const extractDataFromResponse = (response: any): any[] => {
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

    // Handle error responses
    if (response.statusCode >= 400) {
      throw new Error(
        `Error ${response.statusCode}: ${response.message || 'Unknown error'}`
      );
    }
  }

  return [];
};
