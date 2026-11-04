import { isWeb } from '../utils/platform';

const SESSION_STORAGE_KEY = 'hbplus_auth_session';

/**
 * Cross-platform session persistence.
 * Safe fallback for web LocalStorage and in-memory native runtime.
 */
class SessionStorage {
  private memoryCache: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryCache.get(key) || null;
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory cache
      }
    }
    this.memoryCache.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // Ignore
      }
    }
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        // Ignore
      }
    }
    this.memoryCache.clear();
  }
}

export const sessionStorage = new SessionStorage();
export { SESSION_STORAGE_KEY };
