const DB_NAME = 'altai-steeldesk-public-demo-v2';
const DB_VERSION = 3;

export const STORES = [
  'tasks', 'companies', 'contacts', 'rfqs', 'content', 'approvals',
  'suppliers', 'quotes', 'integrations', 'settings', 'activity', 'marketSnapshots', 'marketPrices'
];

export class IndexedDbProvider {
  #dbPromise;

  constructor() {
    this.#dbPromise = this.#open();
  }

  #open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        for (const store of STORES) {
          if (!database.objectStoreNames.contains(store)) {
            database.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async #store(name, mode = 'readonly') {
    if (!STORES.includes(name)) throw new Error(`Unknown data store: ${name}`);
    const database = await this.#dbPromise;
    return database.transaction(name, mode).objectStore(name);
  }

  async list(name) {
    const store = await this.#store(name);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get(name, itemId) {
    const store = await this.#store(name);
    return new Promise((resolve, reject) => {
      const request = store.get(itemId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(name, item) {
    const store = await this.#store(name, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(structuredClone(item));
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async putMany(name, items) {
    const database = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(name, 'readwrite');
      const store = transaction.objectStore(name);
      for (const item of items) store.put(structuredClone(item));
      transaction.oncomplete = () => resolve(items);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(name, itemId) {
    const store = await this.#store(name, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(itemId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(name) {
    const store = await this.#store(name, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async exportAll() {
    const data = {};
    for (const store of STORES) data[store] = await this.list(store);
    return { schemaVersion: DB_VERSION, exportedAt: new Date().toISOString(), data };
  }

  async importAll(payload) {
    if (!payload?.data || typeof payload.data !== 'object') throw new Error('备份文件格式无效。');
    for (const store of STORES) {
      if (!Array.isArray(payload.data[store])) continue;
      await this.clear(store);
      await this.putMany(store, payload.data[store]);
    }
  }
}

