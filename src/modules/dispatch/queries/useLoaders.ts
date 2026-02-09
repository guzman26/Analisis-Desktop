import { useCallback, useEffect, useState } from 'react';
import { getLoaders, createLoader } from '@/api/endpoints';
import type { Loader } from '@/types';

export const useLoaders = () => {
  const [loaders, setLoaders] = useState<Loader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoaders();
      setLoaders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cargadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const create = useCallback(
    async (nombre: string) => {
      const result = await createLoader({ nombre });
      await fetch();
      return result;
    },
    [fetch]
  );

  return { loaders, loading, error, refresh: fetch, create };
};
