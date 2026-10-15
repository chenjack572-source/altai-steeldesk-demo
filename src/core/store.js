import { IndexedDbProvider, STORES } from './db.js';
import { events } from './events.js';
import { seedData } from '../domain/seed.js';

export class AppStore {
  #provider;
  #state = Object.fromEntries(STORES.map(store => [store, []]));

  constructor(provider = new IndexedDbProvider()) {
    this.#provider = provider;
  }

  async initialize() {
    const settings = await this.#provider.list('settings');
    if (!settings.some(item => item.id === 'app')) {
      for (const [store, items] of Object.entries(seedData)) {
        if (STORES.includes(store) && items.length) await this.#provider.putMany(store, items);
      }
    }
    await this.refresh();
  }

  async #applyMigrations() {
    // Public demo intentionally excludes private historical-data migrations.
  }

  async refresh() {
    for (const store of STORES) this.#state[store] = await this.#provider.list(store);
    events.emit('state:changed', this.snapshot());
  }

  snapshot() {
    return structuredClone(this.#state);
  }

  list(name) {
    return structuredClone(this.#state[name] || []);
  }

  get(name, itemId) {
    return structuredClone((this.#state[name] || []).find(item => item.id === itemId));
  }

  async save(name, item) {
    const next = { ...item, updatedAt: new Date().toISOString() };
    await this.#provider.put(name, next);
    const items = this.#state[name];
    const index = items.findIndex(existing => existing.id === next.id);
    if (index >= 0) items[index] = next;
    else items.unshift(next);
    events.emit('state:changed', this.snapshot());
    return structuredClone(next);
  }

  async saveMany(name, items) {
    const now = new Date().toISOString();
    const nextItems = items.map(item => ({ ...item, updatedAt: now }));
    await this.#provider.putMany(name, nextItems);
    const byId = new Map(this.#state[name].map(item => [item.id, item]));
    for (const item of nextItems) byId.set(item.id, item);
    this.#state[name] = [...byId.values()];
    events.emit('state:changed', this.snapshot());
    return structuredClone(nextItems);
  }

  async remove(name, itemId) {
    await this.#provider.delete(name, itemId);
    this.#state[name] = this.#state[name].filter(item => item.id !== itemId);
    events.emit('state:changed', this.snapshot());
  }

  async exportAll() {
    return this.#provider.exportAll();
  }

  async importAll(payload) {
    await this.#provider.importAll(payload);
    await this.refresh();
  }

  async resetToSeed() {
    for (const store of STORES) await this.#provider.clear(store);
    for (const [store, items] of Object.entries(seedData)) {
      if (STORES.includes(store) && items.length) await this.#provider.putMany(store, items);
    }
    await this.refresh();
  }
}

export const store = new AppStore();
