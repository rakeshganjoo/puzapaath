/**
 * src/services/GeocodingService.ts — Reverse/forward geocoding via Nominatim.
 *
 * Caches coordinates in memory so we never make duplicate API calls within a session.
 * Uses Nominatim (OpenStreetMap) — free, no API key required.
 *
 * Security: all inputs are URL-encoded before being sent. No user secrets transmitted.
 */

interface Coordinates {
  lat: number;
  lng: number;
  displayName: string;
}

// In-memory cache for the current session
const _cache = new Map<string, Coordinates | null>();

/**
 * Get coordinates for a city name.
 * Returns null if the geocoding call fails or finds no result.
 * Results are cached per session — safe to call on every render.
 */
export async function getCoordinates(cityName: string): Promise<Coordinates | null> {
  const key = cityName.trim().toLowerCase();
  if (_cache.has(key)) {
    return _cache.get(key) ?? null;
  }

  try {
    const encoded = encodeURIComponent(cityName.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Janthari-App/2.0 (https://janthari.com)' },
    });

    if (!res.ok) {
      _cache.set(key, null);
      return null;
    }

    const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data.length) {
      _cache.set(key, null);
      return null;
    }

    const result: Coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    _cache.set(key, result);
    return result;
  } catch {
    _cache.set(key, null);
    return null;
  }
}

/** Clear the geocoding cache (useful in tests). */
export function clearGeocodingCache() {
  _cache.clear();
}
