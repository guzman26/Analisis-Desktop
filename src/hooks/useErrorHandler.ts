import { useCallback } from 'react';
import { useNotifications } from '@/components/Notification/Notification';
import { ApiError, normalizeApiError } from '@/utils/apiErrors';
import { getErrorMessage, formatErrorMessage, getShortErrorMessage } from '@/utils/errorMessages';

/**
 * Hook para manejar errores de API de forma consistente
 * Proporciona funciones para mostrar errores con contexto y sugerencias
 */
export function useErrorHandler() {
  const { showError, showWarning } = useNotifications();

  /**
   * Maneja un error y muestra notificación al usuario
   */
  const handleError = useCallback(
    (
      error: ApiError | Error | unknown,
      options?: {
        title?: string;
        showNotification?: boolean;
        logDetails?: boolean;
        duration?: number;
      }
    ) => {
      const apiError = normalizeApiError(error);
      const errorInfo = getErrorMessage(apiError);

      // Log detallado para debugging
      if (options?.logDetails !== false) {
        console.error('Error handled:', {
          error: apiError,
          code: apiError.code,
          httpStatus: apiError.httpStatus,
          details: apiError.meta?.errorDetails,
          field: errorInfo.field,
          suggestion: errorInfo.suggestion,
          requestId: apiError.meta?.requestId,
        });
      }

      // Mostrar notificación si está habilitado
      if (options?.showNotification !== false) {
        const title = options?.title || errorInfo.title;
        let message = `${title}: ${errorInfo.message}`;
        
        // Agregar información del campo si está disponible (errores de validación)
        if (errorInfo.field) {
          message += `\n\nCampo: ${errorInfo.field}`;
        }
        
        // Agregar sugerencia del backend si está disponible
        if (errorInfo.suggestion) {
          message += `\n\n💡 ${errorInfo.suggestion}`;
        }
        
        showError(message, options?.duration || 6000);
      }

      return {
        error: apiError,
        errorInfo,
        formattedMessage: formatErrorMessage(apiError),
        shortMessage: getShortErrorMessage(apiError),
      };
    },
    [showError]
  );

  /**
   * Maneja un error y retorna solo el mensaje formateado
   */
  const getError = useCallback((error: ApiError | Error | unknown) => {
    const apiError = normalizeApiError(error);
    return {
      error: apiError,
      errorInfo: getErrorMessage(apiError),
      formattedMessage: formatErrorMessage(apiError),
      shortMessage: getShortErrorMessage(apiError),
    };
  }, []);

  /**
   * Muestra un warning con contexto
   */
  const handleWarning = useCallback(
    (
      message: string,
      suggestion?: string,
      duration?: number
    ) => {
      const fullMessage = suggestion ? `${message}\n\n💡 ${suggestion}` : message;
      showWarning(fullMessage, duration);
    },
    [showWarning]
  );

  return {
    handleError,
    getError,
    handleWarning,
  };
}


