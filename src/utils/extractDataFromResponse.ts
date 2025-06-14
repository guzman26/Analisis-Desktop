export const extractDataFromResponse = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (response?.pallets && Array.isArray(response.pallets)) {
    return response.pallets; // Response with pallets property
  }
  console.warn('Unexpected response format:', response);
  return []; // Fallback to empty array
};
