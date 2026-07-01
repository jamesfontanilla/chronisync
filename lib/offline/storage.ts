/**
 * =============================================================================
 * ChroniSync
 * Offline Storage Helpers
 * =============================================================================
 */

export interface OfflineStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryStore = new Map<string, string>();

function createMemoryStorage(): OfflineStorageAdapter {
  return {
    getItem(key: string) {
      return memoryStore.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      memoryStore.set(key, value);
    },
    removeItem(key: string) {
      memoryStore.delete(key);
    },
  };
}

function createBrowserStorage(): OfflineStorageAdapter {
  if (typeof window === "undefined") {
    return createMemoryStorage();
  }

  try {
    const storage = window.localStorage;

    return {
      getItem(key: string) {
        return storage.getItem(key);
      },
      setItem(key: string, value: string) {
        storage.setItem(key, value);
      },
      removeItem(key: string) {
        storage.removeItem(key);
      },
    };
  } catch {
    return createMemoryStorage();
  }
}

const defaultStorage = createBrowserStorage();

export function getOfflineStorage(): OfflineStorageAdapter {
  return defaultStorage;
}

export function readOfflineJson<T>(
  key: string,
  fallback: T
): T {
  const raw = getOfflineStorage().getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeOfflineJson<T>(
  key: string,
  value: T
): void {
  getOfflineStorage().setItem(key, JSON.stringify(value));
}

export function removeOfflineItem(key: string): void {
  getOfflineStorage().removeItem(key);
}

export function isBrowserStorageAvailable(): boolean {
  return typeof window !== "undefined";
}
