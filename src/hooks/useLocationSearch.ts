import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../api/geocoding';
import type { Location } from '../types';

interface UseLocationSearchResult {
  results: Location[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
}

export function useLocationSearch(): UseLocationSearchResult {
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const locs = await searchLocations(query);
        setResults(locs);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return { results, loading, error, search };
}
