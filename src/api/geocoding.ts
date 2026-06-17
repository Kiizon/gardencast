import type { Location } from '../types';

const BASE = 'https://geocoding-api.open-meteo.com/v1';

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    `${BASE}/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    country: r.country as string,
    admin1: r.admin1 as string | undefined,
  }));
}
