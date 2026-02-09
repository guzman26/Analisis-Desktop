import { useCallback, useEffect, useState } from 'react';
import { getDrivers, createDriver } from '@/api/endpoints';
import type { Driver } from '@/types';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar choferes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const create = useCallback(
    async (nombre: string) => {
      const result = await createDriver({ nombre });
      await fetch();
      return result;
    },
    [fetch]
  );

  return { drivers, loading, error, refresh: fetch, create };
};
