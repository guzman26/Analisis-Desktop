import { useCallback, useEffect, useState } from 'react';
import { getTrucks, createTruck } from '@/api/endpoints';
import type { Truck } from '@/types';

export const useTrucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrucks();
      setTrucks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar camiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const create = useCallback(
    async (patente: string) => {
      const result = await createTruck({ patente });
      await fetch();
      return result;
    },
    [fetch]
  );

  return { trucks, loading, error, refresh: fetch, create };
};
