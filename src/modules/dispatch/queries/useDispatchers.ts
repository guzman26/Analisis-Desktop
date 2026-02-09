import { useCallback, useEffect, useState } from 'react';
import { getDispatchers, createDispatcher } from '@/api/endpoints';
import type { Dispatcher } from '@/types';

export const useDispatchers = () => {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDispatchers();
      setDispatchers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar despachadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const create = useCallback(
    async (nombre: string) => {
      const result = await createDispatcher({ nombre });
      await fetch();
      return result;
    },
    [fetch]
  );

  return { dispatchers, loading, error, refresh: fetch, create };
};
