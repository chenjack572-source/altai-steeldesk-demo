export function quoteRecordDate(record) {
  return String(record.quoteDate || record.createdAt || '').slice(0, 10);
}

export function quoteMonthKey(record) {
  const date = quoteRecordDate(record);
  return /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : 'undated';
}

export function quoteMonthLabel(key) {
  if (key === 'undated') return '日期待补充';
  const [year, month] = key.split('-');
  return `${year}年${Number(month)}月`;
}

export function groupQuotesByMonth(records) {
  const groups = new Map();
  for (const record of records) {
    const key = quoteMonthKey(record);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({ key, label: quoteMonthLabel(key), items }));
}

export function serializeLineItems(items = []) {
  return items.map(line => [
    line.product, line.grade, line.specification, line.quantity, line.unit, line.weightKg,
    line.unitPrice, line.priceBasis, line.amount, line.remarks
  ].map(value => String(value ?? '')).join(' | ')).join('\n');
}

export function parseLineItems(value = '') {
  return String(value).split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const [product = '', grade = '', specification = '', quantity = '', unit = '', weightKg = '', unitPrice = '', priceBasis = '', amount = '', ...remarks] = line.split('|').map(part => part.trim());
    return {
      product, grade, specification,
      quantity: Number(quantity || 0), unit, weightKg: weightKg === '' ? null : Number(weightKg),
      unitPrice: Number(unitPrice || 0), priceBasis, amount: Number(amount || 0),
      remarks: remarks.join(' | ')
    };
  });
}
