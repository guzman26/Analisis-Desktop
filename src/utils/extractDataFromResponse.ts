export const extractDataFromResponse = (response: any) => {
  // Si la respuesta es null o undefined, retornar array vacío
  if (!response) {
    console.warn('Response is null or undefined');
    return [];
  }

  // Si la respuesta es un array (por ejemplo, un array con objetos que contienen "body" como string)
  if (Array.isArray(response)) {
    // Intentar procesar cada elemento del array y combinar los resultados extraídos
    const combinedResults: any[] = [];

    response.forEach((item) => {
      // Caso común: los objetos envueltos por API Gateway traen un campo body como string
      if (item?.body && typeof item.body === 'string') {
        try {
          const parsedItem = JSON.parse(item.body);
          // Reutilizar la misma función para extraer datos del objeto ya parseado
          const extracted = extractDataFromResponse(parsedItem);
          combinedResults.push(...extracted);
        } catch (error) {
          console.error('❌ Error parsing item body:', error);
        }
      } else if (Array.isArray(item)) {
        // Si el elemento ya es un array, agregarlo directamente
        combinedResults.push(...item);
      }
    });

    // Si encontramos resultados, retornarlos; de lo contrario, devolver la respuesta original
    if (combinedResults.length > 0) {
      return combinedResults;
    }

    return response as any[];
  }

  // Si tiene una propiedad 'data'
  if (response?.data) {
    // Nuevo formato: data.items (estructura paginada)
    if (response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    }

    // Si es un array, retornarlo directamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Si es un objeto, retornarlo como array de un elemento
    if (typeof response.data === 'object' && response.data !== null) {
      return [response.data];
    }
  }

  // Si tiene una propiedad 'pallets'
  if (response?.pallets) {
    // Si es un array, retornarlo directamente
    if (Array.isArray(response.pallets)) {
      return response.pallets;
    }
    // Si es un objeto, retornarlo como array de un elemento
    if (typeof response.pallets === 'object' && response.pallets !== null) {
      return [response.pallets];
    }
  }

  // Si tiene una propiedad 'body' que contiene JSON string
  if (response?.body && typeof response.body === 'string') {
    try {
      const parsedBody = JSON.parse(response.body);

      if (Array.isArray(parsedBody)) {
        return parsedBody;
      }

      // Si tiene una propiedad 'data'
      if (parsedBody?.data) {
        // Si es un array, retornarlo directamente
        if (Array.isArray(parsedBody.data)) {
          return parsedBody.data;
        }
        // Si es un objeto, retornarlo como array de un elemento
        if (typeof parsedBody.data === 'object' && parsedBody.data !== null) {
          return [parsedBody.data];
        }
      }

      // Si tiene una propiedad 'pallets'
      if (parsedBody?.pallets) {
        // Si es un array, retornarlo directamente
        if (Array.isArray(parsedBody.pallets)) {
          return parsedBody.pallets;
        }
        // Si es un objeto, retornarlo como array de un elemento
        if (
          typeof parsedBody.pallets === 'object' &&
          parsedBody.pallets !== null
        ) {
          return [parsedBody.pallets];
        }
      }
    } catch (error) {
      console.error('❌ Error parsing response body:', error);
    }
  }

  // Si la respuesta tiene un mensaje de error, manejarlo
  if (response?.message && typeof response.message === 'string') {
    // Si el mensaje indica un error de parámetros
    if (
      response.message.includes('parámetro') ||
      response.message.includes('requerido') ||
      response.message.includes('required')
    ) {
      console.error(
        'API Error - Missing required parameter:',
        response.message
      );
      throw new Error(`Error de API: ${response.message}`);
    }

    // Si es un mensaje de éxito pero no hay datos
    if (
      response.message.includes('successfully') ||
      response.message.includes('exitosamente') ||
      response.message.includes('fetched')
    ) {
      console.info('Operation successful:', response.message);
      // Si hay datos en la respuesta, intentar extraerlos
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      return [];
    }
  }

  // Si tiene statusCode y es un error
  if (response?.statusCode && response.statusCode >= 400) {
    const errorMessage = response.message || 'Error desconocido en la API';
    console.error('API Error:', errorMessage);
    throw new Error(`Error ${response.statusCode}: ${errorMessage}`);
  }

  // Log detallado para debugging
  console.warn('Unexpected response format:', {
    type: typeof response,
    keys: Object.keys(response || {}),
    response: response,
  });

  // Fallback: intentar extraer cualquier array que encuentre
  if (typeof response === 'object') {
    const values = Object.values(response);
    const arrayValue = values.find((value) => Array.isArray(value));
    if (arrayValue) {
      console.info('Found array in response values, using it');
      return arrayValue as any[];
    }
  }

  return []; // Fallback final a array vacío
};
