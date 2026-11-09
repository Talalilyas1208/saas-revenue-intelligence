/**
 * In-memory TTL Cache with tag-based invalidation
 * Dramatically accelerates API responses & eliminates redundant database queries
 */
export class MetricsCache {
  static #store = new Map();
  static #defaultTTL = 5000; // 5 seconds default TTL

  static get(key) {
    const entry = this.#store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.#store.delete(key);
      return null;
    }
    return entry.value;
  }

  static set(key, value, ttlMs = this.#defaultTTL) {
    this.#store.set(key, {
      value,
      expiry: Date.now() + ttlMs,
      cachedAt: new Date().toISOString()
    });
  }

  static invalidate(prefix = '') {
    if (!prefix) {
      this.#store.clear();
      return;
    }
    for (const key of this.#store.keys()) {
      if (key.startsWith(prefix)) {
        this.#store.delete(key);
      }
    }
  }

  static size() {
    return this.#store.size;
  }
}
