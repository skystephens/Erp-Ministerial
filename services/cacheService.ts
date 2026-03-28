/**
 * Cache service — persiste datos en localStorage con TTL.
 * Uso: setCache('key', data, 24) → guarda 24h
 *      getCache<T>('key')        → null si expirado o no existe
 */

interface CacheEntry<T> {
  data: T;
  fetchedAt: number; // Unix ms
  expires: number;   // Unix ms
}

const DEFAULT_TTL_H = 24;

export function setCache<T>(key: string, data: T, ttlHours = DEFAULT_TTL_H): void {
  const entry: CacheEntry<T> = {
    data,
    fetchedAt: Date.now(),
    expires: Date.now() + ttlHours * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    console.warn(`Cache: no se pudo guardar "${key}" (storage lleno?)`);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function clearCache(key: string): void {
  localStorage.removeItem(key);
}

/** Devuelve hace cuánto se guardó el cache en texto legible */
export function getCacheAge(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { fetchedAt }: CacheEntry<unknown> = JSON.parse(raw);
    const diffMs = Date.now() - fetchedAt;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    return `hace ${Math.floor(diffH / 24)} días`;
  } catch {
    return null;
  }
}

/** Cuánto espacio ocupa la entrada (KB) */
export function getCacheSize(key: string): number {
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  return Math.round(raw.length * 2 / 1024); // UTF-16 → bytes → KB
}
