const API_BASE = 'https://api.frankfurter.dev/v2';
const CACHE_KEY = 'steeldesk:exchange-rates:cny';

export const LIVE_RATE_CURRENCIES = Object.freeze(['USD', 'EUR', 'AED', 'SAR', 'INR']);

function readCache(storage) {
  try {
    return JSON.parse(storage?.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(storage, cache) {
  try {
    storage?.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable in private mode; the live result still works.
  }
}

export function cachedCnyRate(currency, storage = globalThis.localStorage) {
  return readCache(storage)[String(currency || '').toUpperCase()] || null;
}

export async function fetchCnyRate(currency, options = {}) {
  const code = String(currency || '').toUpperCase();
  if (code === 'CNY') return { currency: 'CNY', rate: 1, date: '', source: 'fixed' };
  if (!LIVE_RATE_CURRENCIES.includes(code)) throw new Error(`暂不支持 ${code} 的自动汇率。`);

  const fetcher = options.fetcher || globalThis.fetch;
  const storage = options.storage === undefined ? globalThis.localStorage : options.storage;
  try {
    const response = await fetcher(`${API_BASE}/rates?base=${code}&quotes=CNY`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`汇率接口返回 ${response.status}`);
    const rows = await response.json();
    const row = Array.isArray(rows) ? rows.find(item => item.base === code && item.quote === 'CNY') : null;
    const rate = Number(row?.rate);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('汇率数据无效');
    const result = { currency: code, rate, date: row.date || '', source: 'live', fetchedAt: new Date().toISOString() };
    writeCache(storage, { ...readCache(storage), [code]: result });
    return result;
  } catch (error) {
    const cached = cachedCnyRate(code, storage);
    if (cached?.rate) return { ...cached, source: 'cache', error: error.message };
    throw error;
  }
}

export const exchangeRateProvider = Object.freeze({
  name: 'Frankfurter',
  url: 'https://frankfurter.dev/',
  cadence: '官方来源日度参考汇率'
});
