export const formatDate = (value, locale = 'zh-CN') => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
};

export const formatDateTime = (value, locale = 'zh-CN') => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

export const formatCurrency = (value, currency = 'USD', locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0));

export const formatNumber = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits }).format(Number(value || 0));

export const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const id = prefix => `${prefix}_${crypto.randomUUID()}`;

export const today = () => new Date().toISOString().slice(0, 10);

export const daysFromNow = days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
