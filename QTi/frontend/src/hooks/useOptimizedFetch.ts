import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../services/cache';

interface UseOptimizedFetchOptions<T> {
  key: string;
  storeName: 'marketData' | 'botStats' | 'configs';
  fetchFn: () => Promise<T>;
  expiryMinutes?: number;
  debounceMs?: number;
  dependencies?: any[];
  enabled?: boolean;
}

export function useOptimizedFetch<T>({
  key,
  storeName,
  fetchFn,
  expiryMinutes = 5,
  debounceMs = 300,
  dependencies = [],
  enabled = true,
}: UseOptimizedFetchOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      if (!force) {
        const cachedData = await cacheService.get<T>(storeName, key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Update cache
      await cacheService.set(storeName, key, freshData, expiryMinutes);
      
      setData(freshData);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [key, storeName, fetchFn, expiryMinutes, enabled]);

  // Initial fetch
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchData();
      }, debounceMs);
    };

    debouncedFetch();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchData, debounceMs, ...dependencies]);

  // Function to force refresh
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  };
} 