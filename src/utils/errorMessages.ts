import { ApiError } from './apiErrors';

/**
 * Mapeo de códigos de error del backend a mensajes user-friendly en español
 */
const ERROR_CODE_MESSAGES: Record<string, { title: string; message: string; suggestion?: string }> = {
  // Errores de validación
  VALIDATION_ERROR: {
    title: 'Error de Validación',
    message: 'Los datos proporcionados no son válidos',
    suggestion: 'Por favor, revisa los campos marcados y corrige los errores',
  },
  
  // Errores de no encontrado
  NOT_FOUND: {
    title: 'No Encontrado',
    message: 'El recurso solicitado no existe',
    suggestion: 'Verifica que el identificador sea correcto o que el recurso no haya sido eliminado',
  },
  
  // Errores de conflicto
  CONFLICT: {
    title: 'Conflicto',
    message: 'Ya existe un recurso con estos datos',
    suggestion: 'Verifica que no estés intentando crear un duplicado',
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

  // Intentar obtener mensaje por código de error
  if (apiError.code && typeof apiError.code === 'string') {
    const codeMessage = ERROR_CODE_MESSAGES[apiError.code];
    if (codeMessage) {
      return {
        title: codeMessage.title,
        message: apiError.message || codeMessage.message,
        suggestion: codeMessage.suggestion,
        details: apiError.meta?.errorDetails,
        requestId: apiError.meta?.requestId,
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
        suggestion: httpMessage.suggestion,
        details: apiError.meta?.errorDetails,
        requestId: apiError.meta?.requestId,
      };
    }
  }

  // Mensaje genérico
  return {
    title: 'Error',
    message: apiError.message || 'Ocurrió un error inesperado',
    suggestion: 'Por favor, intenta nuevamente. Si el problema persiste, contacta al soporte',
    details: apiError.meta?.errorDetails,
    requestId: apiError.meta?.requestId,
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


