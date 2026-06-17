import { useState, useEffect } from 'react';
import { fetchWeather } from '../api/weather';
import type { WeatherData, Location } from '../types';

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(location: Location | null): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeather(location.latitude, location.longitude)
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [location]);

  return { data, loading, error };
}
