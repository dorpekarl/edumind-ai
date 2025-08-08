export type OfflineKV = {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
};

export function createOfflineKV(namespace: string): OfflineKV {
  const prefix = `edumind:${namespace}:`;
  return {
    async get(key) {
      try {
        const raw = localStorage.getItem(prefix + key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    async set(key, value) {
      localStorage.setItem(prefix + key, JSON.stringify(value));
    },
    async del(key) {
      localStorage.removeItem(prefix + key);
    },
  };
}