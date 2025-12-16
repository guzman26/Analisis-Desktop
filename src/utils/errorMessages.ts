import { ApiError } from './apiErrors';

/**
 * Mapeo de códigos de error del backend a mensajes user-friendly en español
 * Nota: Las sugerencias del backend tienen prioridad sobre estas
 */
const ERROR_CODE_MESSAGES: Record<string, { title: string; message: string; suggestion?: string }> = {
  // Errores de validación
  VALIDATION_ERROR: {
    title: 'Error de Validación',
    message: 'Los datos proporcionados no son válidos',
    suggestion: 'Por favor, revisa los campos marcados y corrige los errores',
  },
  INVALID_BOX_CODE: {
    title: 'Código de Caja Inválido',
    message: 'El código de caja debe tener exactamente 16 dígitos',
    suggestion: 'Verifica que hayas escaneado el código completo',
  },
  INVALID_PALLET_CODE: {
    title: 'Código de Tarja Inválido',
    message: 'El código de tarja debe tener exactamente 14 dígitos',
    suggestion: 'Verifica que hayas escaneado el código completo',
  },
  INVALID_LOCATION: {
    title: 'Ubicación Inválida',
    message: 'La ubicación proporcionada no es válida',
    suggestion: 'Verifica que la ubicación sea correcta',
  },
  INVALID_CALIBRE: {
    title: 'Calibre Inválido',
    message: 'El calibre no coincide con lo solicitado',
    suggestion: 'El calibre de la caja/pallet no está en los calibres solicitados para esta venta',
  },
  BOX_COUNT_EXCEEDED: {
    title: 'Cantidad Excedida',
    message: 'Excede la cantidad de cajas solicitadas',
    suggestion: 'Has escaneado más cajas de las solicitadas para este calibre. Remueve algunas cajas',
  },
  EGGS_EXCEEDED: {
    title: 'Cantidad de Huevos Excedida',
    message: 'Excede la cantidad de huevos permitida',
    suggestion: 'La cantidad de huevos excede el límite permitido',
  },
  EGGS_INCOMPLETE: {
    title: 'Venta Incompleta',
    message: 'Faltan cajas para completar la venta',
    suggestion: 'Aún faltan cajas por escanear. Continúa escaneando hasta completar todas las cajas solicitadas',
  },
  NO_REQUESTED_CALIBRES: {
    title: 'Sin Calibres Solicitados',
    message: 'Esta venta no tiene calibres solicitados',
    suggestion: 'Esta venta no se puede despachar porque no tiene calibres definidos',
  },
  SALE_NOT_DRAFT: {
    title: 'Venta No Modificable',
    message: 'La venta no se puede modificar',
    suggestion: 'Solo se pueden modificar ventas en borrador (DRAFT). Esta venta ya fue confirmada',
  },
  
  // Errores de no encontrado
  NOT_FOUND: {
    title: 'No Encontrado',
    message: 'El recurso solicitado no existe',
    suggestion: 'Verifica que el identificador sea correcto o que el recurso no haya sido eliminado',
  },
  BOX_NOT_FOUND: {
    title: 'Caja No Encontrada',
    message: 'La caja no fue encontrada en el sistema',
    suggestion: 'El código de caja no existe en el sistema. Verifica que hayas escaneado correctamente',
  },
  PALLET_NOT_FOUND: {
    title: 'Tarja No Encontrada',
    message: 'La tarja no fue encontrada en el sistema',
    suggestion: 'El código de tarja no existe en el sistema. Verifica que hayas escaneado correctamente',
  },
  CUSTOMER_NOT_FOUND: {
    title: 'Cliente No Encontrado',
    message: 'El cliente no fue encontrado',
    suggestion: 'El cliente con el ID proporcionado no existe en el sistema',
  },
  SALE_NOT_FOUND: {
    title: 'Venta No Encontrada',
    message: 'La venta no fue encontrada',
    suggestion: 'La venta con el ID proporcionado no existe en el sistema',
  },
  BOX_NOT_IN_SALE: {
    title: 'Caja No Está en la Venta',
    message: 'La caja no está en esta venta',
    suggestion: 'Esta caja no está en la venta actual. Verifica el código',
  },
  PALLET_NOT_IN_SALE: {
    title: 'Pallet No Está en la Venta',
    message: 'El pallet no está en esta venta',
    suggestion: 'Este pallet no está en la venta actual. Verifica el código',
  },
  
  // Errores de conflicto
  CONFLICT: {
    title: 'Conflicto',
    message: 'Ya existe un recurso con estos datos',
    suggestion: 'Verifica que no estés intentando crear un duplicado',
  },
  BOX_ALREADY_EXISTS: {
    title: 'Caja Ya Existe',
    message: 'La caja ya existe en el sistema',
    suggestion: 'Esta caja ya fue registrada anteriormente',
  },
  BOX_ALREADY_IN_SALE: {
    title: 'Caja Ya Agregada',
    message: 'La caja ya está en esta venta',
    suggestion: 'Esta caja ya fue agregada. Verifica que no hayas escaneado el mismo código dos veces',
  },
  PALLET_ALREADY_IN_SALE: {
    title: 'Pallet Ya Agregado',
    message: 'El pallet ya está en esta venta',
    suggestion: 'Este pallet ya fue agregado. Verifica que no hayas escaneado el mismo código dos veces',
  },
  CUSTOMER_ALREADY_EXISTS: {
    title: 'Cliente Ya Existe',
    message: 'El cliente ya existe en el sistema',
    suggestion: 'Ya existe un cliente con el email proporcionado',
  },
  BOX_NOT_IN_BODEGA: {
    title: 'Caja No Está en BODEGA',
    message: 'La caja no está en BODEGA',
    suggestion: 'Solo se pueden agregar cajas que estén en BODEGA. Verifica la ubicación de la caja',
  },
  PALLET_NOT_IN_BODEGA: {
    title: 'Pallet No Está en BODEGA',
    message: 'El pallet no está en BODEGA',
    suggestion: 'Solo se pueden agregar pallets que estén en BODEGA. Verifica la ubicación del pallet',
  },
  PALLET_NO_BOXES_IN_BODEGA: {
    title: 'Pallet Sin Cajas en BODEGA',
    message: 'El pallet no tiene cajas en BODEGA',
    suggestion: 'El pallet no tiene cajas disponibles en BODEGA para agregar a la venta',
  },
  
  // Errores de dominio
  DOMAIN_ERROR: {
    title: 'Error de Negocio',
    message: 'No se puede realizar esta operación',
    suggestion: 'Revisa las reglas de negocio y vuelve a intentar',
  },
  
  // Errores internos
  INTERNAL_ERROR: {
    title: 'Error del Servidor',
    message: 'Ocurrió un error inesperado en el servidor',
    suggestion: 'Por favor, intenta nuevamente en unos momentos. Si el problema persiste, contacta al soporte',
  },
  DATABASE_ERROR: {
    title: 'Error de Base de Datos',
    message: 'Error de base de datos',
    suggestion: 'Error al acceder a la base de datos. Intenta nuevamente en unos momentos',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Servicio No Disponible',
    message: 'Servicio no disponible',
    suggestion: 'El servicio está temporalmente no disponible. Intenta nuevamente más tarde',
  },
  
  // Errores de rate limit
  RATE_LIMIT_EXCEEDED: {
    title: 'Demasiadas Solicitudes',
    message: 'Demasiadas solicitudes',
    suggestion: 'Has excedido el límite de solicitudes. Por favor, espera unos momentos e intenta nuevamente',
  },
  THROTTLING_ERROR: {
    title: 'Servicio SobreCargado',
    message: 'Servicio temporalmente sobrecargado',
    suggestion: 'El servicio está temporalmente sobrecargado. Por favor, intente nuevamente',
  },
  
  // Errores de red
  NETWORK_ERROR: {
    title: 'Error de Conexión',
    message: 'No se pudo conectar con el servidor',
    suggestion: 'Verifica tu conexión a internet e intenta nuevamente',
  },
  
  // Errores de timeout
  TIMEOUT: {
    title: 'Tiempo de Espera Agotado',
    message: 'La solicitud tardó demasiado tiempo',
    suggestion: 'Intenta nuevamente. Si el problema persiste, puede haber un problema con el servidor',
  },
  
  // Errores de permisos
  UNAUTHORIZED: {
    title: 'No Autorizado',
    message: 'No tienes permisos para realizar esta acción',
    suggestion: 'Verifica tus credenciales o contacta al administrador',
  },
  
  FORBIDDEN: {
    title: 'Acceso Denegado',
    message: 'No tienes permisos para acceder a este recurso',
    suggestion: 'Contacta al administrador si necesitas acceso',
  },
};

/**
 * Mensajes por código HTTP
 */
const HTTP_STATUS_MESSAGES: Record<number, { title: string; message: string; suggestion?: string }> = {
  400: {
    title: 'Solicitud Incorrecta',
    message: 'La solicitud enviada no es válida',
    suggestion: 'Revisa los datos enviados y vuelve a intentar',
  },
  401: {
    title: 'No Autorizado',
    message: 'Debes iniciar sesión para continuar',
    suggestion: 'Inicia sesión e intenta nuevamente',
  },
  403: {
    title: 'Acceso Denegado',
    message: 'No tienes permisos para realizar esta acción',
    suggestion: 'Contacta al administrador si necesitas acceso',
  },
  404: {
    title: 'No Encontrado',
    message: 'El recurso solicitado no existe',
    suggestion: 'Verifica la URL o el identificador del recurso',
  },
  409: {
    title: 'Conflicto',
    message: 'Ya existe un recurso con estos datos',
    suggestion: 'Verifica que no estés creando un duplicado',
  },
  422: {
    title: 'Error de Validación',
    message: 'Los datos proporcionados no son válidos',
    suggestion: 'Revisa los campos y corrige los errores',
  },
  429: {
    title: 'Demasiadas Solicitudes',
    message: 'Has realizado demasiadas solicitudes',
    suggestion: 'Espera unos momentos antes de intentar nuevamente',
  },
  500: {
    title: 'Error del Servidor',
    message: 'Ocurrió un error inesperado en el servidor',
    suggestion: 'Intenta nuevamente en unos momentos. Si el problema persiste, contacta al soporte',
  },
  502: {
    title: 'Error de Gateway',
    message: 'El servidor no pudo procesar tu solicitud',
    suggestion: 'Intenta nuevamente en unos momentos',
  },
  503: {
    title: 'Servicio No Disponible',
    message: 'El servicio está temporalmente no disponible',
    suggestion: 'Intenta nuevamente en unos momentos',
  },
  504: {
    title: 'Tiempo de Espera Agotado',
    message: 'El servidor tardó demasiado en responder',
    suggestion: 'Intenta nuevamente. Si el problema persiste, puede haber un problema con el servidor',
  },
};

/**
 * Obtiene un mensaje user-friendly para un error de API
 */
export function getErrorMessage(error: ApiError | Error | unknown): {
  title: string;
  message: string;
  suggestion?: string;
  details?: any;
  requestId?: string;
  field?: string;
} {
  // Normalizar el error
  let apiError: ApiError;
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError({
      message: error.message,
      httpStatus: (error as any).httpStatus,
      code: (error as any).code,
      meta: (error as any).meta,
    });
  } else {
    apiError = new ApiError({
      message: 'Error desconocido',
      status: 'error',
    });
  }

  // Prioridad 1: Usar sugerencia del backend si está disponible
  const backendSuggestion = apiError.meta?.errorSuggestion;

  // Intentar obtener mensaje por código de error
  if (apiError.code && typeof apiError.code === 'string') {
    const codeMessage = ERROR_CODE_MESSAGES[apiError.code];
    if (codeMessage) {
      return {
        title: codeMessage.title,
        message: apiError.message || codeMessage.message,
        // Priorizar sugerencia del backend sobre la local
        suggestion: backendSuggestion || codeMessage.suggestion,
        details: apiError.meta?.errorDetails,
        requestId: apiError.meta?.requestId,
        field: apiError.meta?.errorField,
      };
    }
  }

  // Intentar obtener mensaje por código HTTP
  if (apiError.httpStatus) {
    const httpMessage = HTTP_STATUS_MESSAGES[apiError.httpStatus];
    if (httpMessage) {
      return {
        title: httpMessage.title,
        message: apiError.message || httpMessage.message,
        // Priorizar sugerencia del backend sobre la local
        suggestion: backendSuggestion || httpMessage.suggestion,
        details: apiError.meta?.errorDetails,
        requestId: apiError.meta?.requestId,
        field: apiError.meta?.errorField,
      };
    }
  }

  // Mensaje genérico
  return {
    title: 'Error',
    message: apiError.message || 'Ocurrió un error inesperado',
    // Priorizar sugerencia del backend
    suggestion: backendSuggestion || 'Por favor, intenta nuevamente. Si el problema persiste, contacta al soporte',
    details: apiError.meta?.errorDetails,
    requestId: apiError.meta?.requestId,
    field: apiError.meta?.errorField,
  };
}

/**
 * Formatea un mensaje de error completo para mostrar al usuario
 */
export function formatErrorMessage(error: ApiError | Error | unknown): string {
  const errorInfo = getErrorMessage(error);
  
  let message = errorInfo.message;
  
  // Agregar sugerencia si existe
  if (errorInfo.suggestion) {
    message += `\n\n${errorInfo.suggestion}`;
  }
  
  // Agregar requestId si existe (útil para soporte)
  if (errorInfo.requestId) {
    message += `\n\nID de solicitud: ${errorInfo.requestId}`;
  }
  
  return message;
}

/**
 * Obtiene un mensaje corto para notificaciones
 */
export function getShortErrorMessage(error: ApiError | Error | unknown): string {
  const errorInfo = getErrorMessage(error);
  return errorInfo.message;
}


