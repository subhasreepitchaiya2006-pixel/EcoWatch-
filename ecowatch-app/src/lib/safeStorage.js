/**
 * Safe LocalStorage wrapper
 * Prevents white screen crashes in environments where localStorage is restricted,
 * unavailable, throws SecurityError (Incognito/private mode), or in SSR/testing.
 */
const inMemoryFallback = new Map();

export const safeStorage = {
  getItem: (key, fallback = null) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : fallback;
      }
    } catch {
      // LocalStorage access restricted
    }
    return inMemoryFallback.has(key) ? inMemoryFallback.get(key) : fallback;
  },

  setItem: (key, value) => {
    const stringVal = String(value);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, stringVal);
        return;
      }
    } catch {
      // LocalStorage restricted or quota exceeded
    }
    inMemoryFallback.set(key, stringVal);
  },

  removeItem: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // LocalStorage restricted
    }
    inMemoryFallback.delete(key);
  },
};

export default safeStorage;
