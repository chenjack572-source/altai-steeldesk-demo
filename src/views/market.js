import { pageHeader } from '../ui/components.js';
import { escapeHtml } from '../core/format.js';

function timeLabel(value) {
  if (!value) return '尚未同步';
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function renderMarket(state) {
  const snapshots = [...(state.marketSnapshots || [])].sort((left, right) => {
    const date = String(right.marketDate || '').localeCompare(String(left.marketDate || ''));
    if (date) return date;
    return (right.session === 'afternoon' ? 1 : 0) - (left.session === 'afternoon' ? 1 : 0);
  });
  const latestSync = snapshots.map(item => item.syncedAt).filter(Boolean).sort().at(-1);
  const latestDate = snapshots[0]?.marketDate || '待同步';
  const latestDayCount = snapshots.filter(item => item.marketDate === snapshots[0]?.marketDate).length;

  return `${pageHeader({
    eyebrow: 'MARKET DATA / INTERNAL REFERENCE',
    title: '无锡不锈钢每日报价',
    description: '自动读取“不锈购”公开的现货公司报价表，按日期和上午盘归档。仅供内部询价参考，价格以供应商最终确认为准。',
    actions: '<button class="button button--primary" data-action="refresh-market">立即同步</button>'
  })}
  <section class="metric-grid market-metrics" aria-label="行情同步概况">
    <article class="metric"><span>最新行情日</span><strong>${escapeHtml(latestDate)}</strong><small>${latestDayCount ? `${latestDayCount} 个盘次` : '等待首次同步'}</small></article>
    <article class="metric"><span>已归档报价表</span><strong>${snapshots.length}</strong><small>浏览器本地保存索引</small></article>
    <article class="metric"><span>最后检查</span><strong>${escapeHtml(timeLabel(latestSync))}</strong><small>打开工作台后每 2 小时自动检查</small></article>
    <article class="metric"><span>数据方式</span><strong>原表展示</strong><small>不用 OCR 猜测价格</small></article>
  </section>
  <section class="market-archive">
    ${snapshots.length ? snapshots.map((item, index) => `<article class="panel market-sheet ${index === 0 ? 'is-latest' : ''}">
      <header class="panel__header"><div><p class="eyebrow">${escapeHtml(item.marketDate)} / ${escapeHtml(item.sessionLabel || '')}</p><h2>${escapeHtml(item.title)}</h2></div><span>${index === 0 ? '最新' : '已归档'}</span></header>
      <a class="market-sheet__image" href="${escapeHtml(item.imageUrl)}" target="_blank" rel="noreferrer" aria-label="查看原始报价表大图">
        <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageLabel || item.title)}" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      <footer class="panel__footer"><span>来源：${escapeHtml(item.source)} · 内部参考</span><a class="text-button" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">查看原文 ↗</a></footer>
    </article>`).join('') : `<article class="panel empty-market"><p class="eyebrow">WAITING FOR FIRST SYNC</p><h2>还没有行情快照</h2><p>点击“立即同步”后，工作台会读取最近的上午盘报价表。</p></article>`}
  </section>`;
}

