import { LRUCache } from 'lru-cache';

let cache = null;

export async function initializeCache() {
  cache = new LRUCache({
    max: 500, // Maximum number of items
    ttl: 1000 * 60 * 60, // 1 hour TTL
    updateAgeOnGet: true,
    allowStale: true
  });
  
  return cache;
}

export async function clearCache() {
  if (cache) {
    cache.clear();
  }
}

// Functions used by MLService
export async function getCache(key) {
  if (!cache) return null;
  return cache.get(key);
}

export async function setCache(key, value, ttl = 3600) {
  if (!cache) return;
  cache.set(key, value, { ttl: ttl * 1000 });
} 