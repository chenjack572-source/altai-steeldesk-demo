async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || '行情同步失败。');
  return payload;
}

export function fetchLatestMarketSnapshots() {
  return request('./api/market/latest?limit=12');
}

export function recognizeMarketSnapshot(snapshotId) {
  return request('./api/market/buxiugou/recognize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshotId })
  });
}
