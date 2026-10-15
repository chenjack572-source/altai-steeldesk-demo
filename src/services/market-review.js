const finite = value => Number.isFinite(Number(value));

export function median(values = []) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function marketSeriesKey(item = {}) {
  return [item.material, item.origin, item.specification, item.productForm, item.unit, item.currency, item.source, item.session]
    .map(value => String(value || '').trim().toLowerCase())
    .join('|');
}

export function anomalyFor(candidate, history = []) {
  if (!finite(candidate?.normalizedPrice ?? candidate?.rawPrice)) return { score: 1, reasons: ['价格不是有效数字'] };
  const price = Number(candidate.normalizedPrice ?? candidate.rawPrice);
  const comparable = history
    .filter(item => item.reviewStatus === 'verified' && marketSeriesKey(item) === marketSeriesKey(candidate))
    .filter(item => finite(item.normalizedPrice ?? item.rawPrice))
    .sort((a, b) => String(a.marketDate).localeCompare(String(b.marketDate)))
    .slice(-14);
  const reasons = [];
  let score = 0;
  if (price <= 0) return { score: 1, reasons: ['价格必须大于 0'] };
  if (comparable.length) {
    const previous = Number(comparable.at(-1).normalizedPrice ?? comparable.at(-1).rawPrice);
    const dayChange = previous ? Math.abs(price - previous) / previous : 0;
    if (dayChange >= 0.08) {
      score = Math.max(score, Math.min(1, dayChange / 0.2));
      reasons.push(`较上一条同口径价格波动 ${(dayChange * 100).toFixed(1)}%`);
    }
  }
  if (comparable.length >= 4) {
    const values = comparable.map(item => Number(item.normalizedPrice ?? item.rawPrice));
    const center = median(values);
    const mad = median(values.map(value => Math.abs(value - center)));
    const robustDeviation = mad ? Math.abs(price - center) / (1.4826 * mad) : Math.abs(price - center) / Math.max(center * 0.015, 1);
    if (robustDeviation >= 3.5) {
      score = Math.max(score, Math.min(1, robustDeviation / 8));
      reasons.push(`偏离近 ${values.length} 条同口径中位数，稳健偏差 ${robustDeviation.toFixed(1)}`);
    }
  }
  return { score: Number(score.toFixed(3)), reasons };
}

export function withMarketAnomalies(rows = []) {
  const ordered = [...rows].sort((a, b) => String(a.marketDate).localeCompare(String(b.marketDate)) || String(a.createdAt).localeCompare(String(b.createdAt)));
  return ordered.map((row, index) => {
    const result = anomalyFor(row, ordered.slice(0, index));
    return {
      ...row,
      anomalyScore: Math.max(Number(row.anomalyScore || 0), result.score),
      anomalyReasons: [...new Set([...(row.anomalyReasons || []), ...result.reasons])]
    };
  });
}

export function assignSeriesAxes(rows = []) {
  const groups = new Map();
  for (const row of rows) {
    const key = marketSeriesKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const series = [...groups.entries()].map(([key, items]) => ({
    key,
    items: [...items].sort((a, b) => String(a.marketDate).localeCompare(String(b.marketDate))),
    median: median(items.map(item => item.normalizedPrice ?? item.rawPrice)),
    label: [items[0]?.material || '未命名材质', items[0]?.origin, items[0]?.productForm, items[0]?.specification].filter(Boolean).join(' · '),
    unit: items[0]?.unit || ''
  })).sort((a, b) => a.median - b.median);
  if (series.length < 2) return series.map(item => ({ ...item, axis: 'left' }));
  let splitIndex = Math.ceil(series.length / 2);
  let largestGap = -Infinity;
  for (let index = 1; index < series.length; index += 1) {
    const previous = Math.max(series[index - 1].median, 0.0001);
    const gap = Math.log(Math.max(series[index].median, 0.0001) / previous);
    if (gap > largestGap) {
      largestGap = gap;
      splitIndex = index;
    }
  }
  return series.map((item, index) => ({ ...item, axis: index < splitIndex ? 'left' : 'right' }));
}

export function verifiedMarketRows(rows = [], filters = {}) {
  return withMarketAnomalies(rows).filter(item => {
    if (item.reviewStatus !== 'verified') return false;
    return ['material', 'origin', 'specification', 'source', 'session', 'unit'].every(key => !filters[key] || item[key] === filters[key]);
  });
}
