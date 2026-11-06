import { isWeb } from '../utils/platform';

const SESSION_STORAGE_KEY = 'hbplus_auth_session';

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
        // quota exceeded or storage blocked; keep it in memory
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
        // storage blocked, nothing to remove
      }
    }
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        // storage blocked, nothing to clear
      }
    }
    this.memoryCache.clear();
  }
}

export const sessionStorage = new SessionStorage();
export { SESSION_STORAGE_KEY };
