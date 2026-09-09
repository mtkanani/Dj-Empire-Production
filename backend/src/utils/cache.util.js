/**
 * High-performance, zero-dependency in-memory TTL cache
 * Supports key-value storage with automatic expiration and prefix invalidation.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Retrieve cached value if not expired
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store value in cache with expiration
   * @param {string} key
   * @param {any} value
   * @param {number} ttlMs - Time to live in milliseconds (default 5 minutes)
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete specific cache key
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a given prefix
   * Useful for invalidating e.g. "events:" or "tax_settings:"
   * @param {string} prefix
   */
  delPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();
