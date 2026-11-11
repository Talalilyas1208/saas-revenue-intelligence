/**
 * High-speed In-Memory TTL Cache with Prefix Invalidation
 * Serves repeated reads in <0.2ms while invalidating instantaneously on writes.
 */
export class MetricsCache {
  static #store = new Map();
  static #defaultTTL = 15000; // 15s TTL (invalidated immediately on mutations)

  static get(key) {
    const entry = this.#store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.#store.delete(key);
      return null;
    }
    return entry.value;
  }

  static has(key) {
    return this.get(key) !== null;
  }

  static set(key, value, ttlMs = this.#defaultTTL) {
    this.#store.set(key, {
      value,
      expiry: Date.now() + ttlMs,
      cachedAt: Date.now()
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
