import { useState, useEffect, useRef, useCallback } from 'react';

export type UpdateState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseDebouncedUpdateOptions<T> {
  delay?: number;
  onUpdate: (value: T) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  enableOptimisticUpdate?: boolean;
}

export interface UseDebouncedUpdateReturn<T> {
  value: T;
  setValue: (newValue: T) => void;
  state: UpdateState;
  error: Error | null;
  retry: () => void;
  reset: () => void;
}

/**
 * Hook para actualización con debounce y optimistic updates
 * @param initialValue Valor inicial
 * @param options Opciones de configuración
 */
export function useDebouncedUpdate<T>(
  initialValue: T,
  options: UseDebouncedUpdateOptions<T>
): UseDebouncedUpdateReturn<T> {
  const {
    delay = 500,
    onUpdate,
    onError,
    onSuccess,
    enableOptimisticUpdate = true,
  } = options;

  const [value, setValueState] = useState<T>(initialValue);
  const [state, setState] = useState<UpdateState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [originalValue, setOriginalValue] = useState<T>(initialValue);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUpdatingRef = useRef(false);
  const pendingValueRef = useRef<T | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Función para realizar la actualización
  const performUpdate = useCallback(
    async (valueToUpdate: T) => {
      if (isUpdatingRef.current) {
        // Si ya hay una actualización en curso, guardar el valor pendiente
        pendingValueRef.current = valueToUpdate;
        return;
      }

      isUpdatingRef.current = true;
      setState('saving');
      setError(null);

      try {
        await onUpdate(valueToUpdate);
        setState('saved');
        setOriginalValue(valueToUpdate);
        onSuccess?.();

        // Resetear a idle después de 2 segundos
        setTimeout(() => {
          setState('idle');
        }, 2000);

        // Si hay un valor pendiente, procesarlo
        if (pendingValueRef.current !== null) {
          const nextValue = pendingValueRef.current;
          pendingValueRef.current = null;
          performUpdate(nextValue);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        setState('error');

        // Rollback si está habilitado el optimistic update
        if (enableOptimisticUpdate) {
          setValueState(originalValue);
        }

        onError?.(error);

        // Si hay un valor pendiente, limpiarlo
        pendingValueRef.current = null;
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [onUpdate, onError, onSuccess, enableOptimisticUpdate, originalValue]
  );

  // Función para establecer el valor (con debounce)
  const setValue = useCallback(
    (newValue: T) => {
      setValueState(newValue);

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si el estado es 'error', cambiar a 'pending' inmediatamente
      if (state === 'error') {
        setState('pending');
      } else if (state === 'idle' || state === 'saved') {
        setState('pending');
      }

      // Crear nuevo timeout
      timeoutRef.current = setTimeout(() => {
        performUpdate(newValue);
      }, delay);
    },
    [delay, performUpdate, state]
  );

  // Función para reintentar
  const retry = useCallback(() => {
    if (state === 'error') {
      performUpdate(value);
    }
  }, [state, value, performUpdate]);

  // Función para resetear
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setValueState(originalValue);
    setState('idle');
    setError(null);
    pendingValueRef.current = null;
    isUpdatingRef.current = false;
  }, [originalValue]);

  // Sincronizar valor inicial si cambia externamente
  useEffect(() => {
    if (state === 'idle' && value !== initialValue) {
      setValueState(initialValue);
      setOriginalValue(initialValue);
    }
  }, [initialValue, state]);

  return {
    value,
    setValue,
    state,
    error,
    retry,
    reset,
  };
}

