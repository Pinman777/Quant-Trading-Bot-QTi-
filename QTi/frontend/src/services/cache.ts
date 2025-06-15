import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QTiDBSchema extends DBSchema {
  marketData: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiry: number;
    };
  };
  botStats: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiry: number;
    };
  };
  configs: {
    key: string;
    value: {
      data: any;
      timestamp: number;
    };
  };
}

class CacheService {
  private db: IDBPDatabase<QTiDBSchema> | null = null;
  private readonly DB_NAME = 'qti-cache';
  private readonly VERSION = 1;

  async init() {
    if (!this.db) {
      this.db = await openDB<QTiDBSchema>(this.DB_NAME, this.VERSION, {
        upgrade(db) {
          // Market data store (expires after 5 minutes)
          if (!db.objectStoreNames.contains('marketData')) {
            db.createObjectStore('marketData');
          }
          // Bot stats store (expires after 1 minute)
          if (!db.objectStoreNames.contains('botStats')) {
            db.createObjectStore('botStats');
          }
          // Configs store (no expiry)
          if (!db.objectStoreNames.contains('configs')) {
            db.createObjectStore('configs');
          }
        },
      });
    }
    return this.db;
  }

  private async getStore(storeName: keyof QTiDBSchema) {
    const db = await this.init();
    return db.transaction(storeName, 'readwrite').objectStore(storeName);
  }

  async set<T>(
    storeName: keyof QTiDBSchema,
    key: string,
    data: T,
    expiryMinutes: number = 5
  ) {
    const store = await this.getStore(storeName);
    const timestamp = Date.now();
    const expiry = expiryMinutes * 60 * 1000;

    await store.put({
      data,
      timestamp,
      expiry,
    }, key);
  }

  async get<T>(storeName: keyof QTiDBSchema, key: string): Promise<T | null> {
    const store = await this.getStore(storeName);
    const result = await store.get(key);

    if (!result) {
      return null;
    }

    // Check if data has expired
    if (result.expiry && Date.now() - result.timestamp > result.expiry) {
      await store.delete(key);
      return null;
    }

    return result.data as T;
  }

  async delete(storeName: keyof QTiDBSchema, key: string) {
    const store = await this.getStore(storeName);
    await store.delete(key);
  }

  async clear(storeName: keyof QTiDBSchema) {
    const store = await this.getStore(storeName);
    await store.clear();
  }

  async clearAll() {
    const db = await this.init();
    const storeNames = db.objectStoreNames;
    
    for (const storeName of storeNames) {
      await this.clear(storeName as keyof QTiDBSchema);
    }
  }
}

export const cacheService = new CacheService(); 