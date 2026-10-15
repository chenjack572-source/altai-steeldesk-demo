import { badge, dialog, formField, metric, pageHeader, selectField, statusBadge } from '../ui/components.js';
import { escapeHtml, formatDate, formatNumber } from '../core/format.js';
import { approvalPriority, sortApprovalsByPriority } from '../core/approval-policy.js';

export function renderDashboard(state) {
  const openTasks = state.tasks.filter(item => !item.completed);
  const approvals = sortApprovalsByPriority(state.approvals.filter(item => item.status === 'pending'));
  const openRfqs = state.rfqs.filter(item => !['won', 'lost'].includes(item.status));
  const highPriority = state.companies.filter(item => item.priority === 'A').length;
  const completed = state.tasks.length ? Math.round((state.tasks.filter(item => item.completed).length / state.tasks.length) * 100) : 0;
  const marketSnapshots = [...(state.marketSnapshots || [])].sort((left, right) => String(right.marketDate || '').localeCompare(String(left.marketDate || '')) || (right.session === 'afternoon' ? 1 : -1));
  const marketPrices = state.marketPrices || [];
  const latestArchive = marketSnapshots[0];
  const latestDaySnapshots = marketSnapshots.filter(item => item.marketDate === latestArchive?.marketDate);
  const latestMarket = latestDaySnapshots.find(snapshot => marketPrices.some(item => item.snapshotId === snapshot.id)) || latestArchive;
  const latestMarketRows = marketPrices.filter(item => item.snapshotId === latestMarket?.id);
  const verifiedMarketRows = latestMarketRows.filter(item => item.reviewStatus === 'verified');
  const marketReviewLabel = verifiedMarketRows.length === latestMarketRows.length && latestMarketRows.length
    ? '当日价格均已确认'
    : `${latestMarketRows.length - verifiedMarketRows.length} 条待复核`;
  const latestMarketPreview = latestMarket?.sourceType === 'structured-table'
    ? `<div class="dashboard-market__source">
        <div class="dashboard-market__source-head"><div><span>当日最新价格</span><strong>${latestMarketRows.length} 条报价</strong></div><small>CNY / MT</small></div>
        <table aria-label="${escapeHtml(latestMarket.marketDate)} 无锡最新公开价格"><thead><tr><th>品种</th><th>产地 / 钢厂</th><th>规格</th><th>涨跌</th><th>价格</th></tr></thead><tbody>${latestMarketRows.map(row => {
          const change = String(row.change || '').trim();
          const changeTone = change.startsWith('-') ? 'is-down' : change && !['0', '平', '—'].includes(change) ? 'is-up' : '';
          return `<tr><td>${escapeHtml(row.material)}</td><td>${escapeHtml(row.origin || row.company || '—')}</td><td title="${escapeHtml(row.specification || '—')}">${escapeHtml(row.specification || '—')}</td><td class="market-change ${changeTone}">${escapeHtml(change || '—')}</td><td>${escapeHtml(formatNumber(row.normalizedPrice ?? row.rawPrice, 0))}</td></tr>`;
        }).join('')}</tbody></table>
        <small class="dashboard-market__source-foot">${marketReviewLabel}</small>
      </div>`
    : `<img src="${escapeHtml(latestMarket?.imageUrl)}" alt="${escapeHtml(latestMarket?.imageLabel || latestMarket?.title)}" loading="lazy" referrerpolicy="no-referrer" />`;

  const stages = [
    ['目标公司', state.companies.length],
    ['已联系', state.companies.filter(item => ['contacted', 'qualified'].includes(item.stage)).length],
    ['RFQ', state.rfqs.length],
    ['已报价', state.quotes.length],
    ['订单', state.rfqs.filter(item => item.status === 'won').length]
  ];
  const maxStage = Math.max(...stages.map(([, value]) => value), 1);

  return `${pageHeader({
    eyebrow: '2026 · 本地工作台',
    title: '今天先处理真正影响成交的事。',
    description: '所有对外发布、客户消息和正式报价仍需你的批准；本地功能不会消耗模型 token。',
    actions: '<button class="button button--primary" data-action="open-quick-add">快速新增</button>'
  })}
  <section class="metric-grid" aria-label="今日概况">
    ${metric('未完成任务', String(openTasks.length), `完成率 ${completed}%`, openTasks.length > 3 ? 'warning' : 'default')}
    ${metric('待审批动作', String(approvals.length), '不会自动对外执行', approvals.length ? 'warning' : 'success')}
    ${metric('进行中 RFQ', String(openRfqs.length), `${openRfqs.filter(item => item.completeness < 85).length} 个待补资料`)}
    ${metric('A级目标客户', String(highPriority), '优先开发与跟进')}
  </section>

  <section class="dashboard-grid">
    <article class="panel panel--tasks">
      <header class="panel__header"><div><p class="eyebrow">TODAY / 今日</p><h2>行动队列</h2></div><span>${openTasks.length} OPEN</span></header>
      <div class="task-list">
        ${state.tasks.length ? state.tasks
          .sort((a, b) => Number(a.completed) - Number(b.completed))
          .map(task => `<label class="task ${task.completed ? 'is-complete' : ''}">
            <input type="checkbox" data-action="toggle-task" data-id="${escapeHtml(task.id)}" ${task.completed ? 'checked' : ''} />
            <span class="task__check" aria-hidden="true"></span>
            <span class="task__body"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.group)} · ${formatDate(task.dueDate)}</small></span>
            ${badge(task.priority === 'high' ? '优先' : task.priority === 'medium' ? '正常' : '低', task.priority === 'high' ? 'danger' : 'neutral')}
          </label>`).join('') : '<p>今天没有任务。</p>'}
      </div>
      <footer class="panel__footer"><button class="text-button text-button--add" data-action="open-task-dialog">添加任务</button><span>点击方框即可完成</span></footer>
    </article>

    <article class="panel panel--market">
      <header class="panel__header"><div><p class="eyebrow">MARKET / MULTI-SOURCE</p><h2>无锡每日报价</h2></div><a href="#/market">查看全部 →</a></header>
      ${latestMarket ? `<a class="dashboard-market ${latestMarket.sourceType === 'structured-table' ? 'dashboard-market--structured' : ''}" href="#/market">
        ${latestMarketPreview}
        <div class="dashboard-market__copy"><span>${escapeHtml(latestMarket.sessionLabel)} · ${escapeHtml(latestMarket.source)}</span><time datetime="${escapeHtml(latestMarket.marketDate)}">${escapeHtml(formatDate(latestMarket.marketDate))}</time><strong>${escapeHtml(latestMarket.sourceType === 'structured-table' ? '无锡卷板最新报价' : latestMarket.title)}</strong><small>${latestMarket.sourceType === 'structured-table' ? `${marketReviewLabel} · 点击查看全部` : '原表归档 · 仅供内部询价参考'}</small></div>
      </a>` : `<div class="market-awaiting"><strong>正在首次同步行情</strong><small>不调用 AI，不消耗 token。</small><button class="text-button" data-action="refresh-market">立即同步</button></div>`}
    </article>

    <article class="panel panel--pipeline">
      <header class="panel__header"><div><p class="eyebrow">PIPELINE</p><h2>开发漏斗</h2></div><a href="#/crm">查看客户 →</a></header>
      <div class="funnel" role="img" aria-label="客户开发漏斗">
        ${stages.map(([label, value]) => `<div class="funnel__row"><span>${escapeHtml(label)}</span><div class="funnel__track"><i style="inline-size:${Math.max((value / maxStage) * 100, value ? 12 : 0)}%"></i></div><strong>${value}</strong></div>`).join('')}
      </div>
    </article>

    <article class="panel panel--approvals">
      <header class="panel__header"><div><p class="eyebrow">CONTROL GATE</p><h2>待你批准</h2></div><a href="#/approvals">全部审批 →</a></header>
      <div class="compact-list">
        ${approvals.slice(0, 4).map(item => `<a href="#/approvals" class="compact-item"><span>${approvalPriority(item).code} · ${escapeHtml(item.channel || '外部动作')}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary)}</small></div>${statusBadge(item.status)}</a>`).join('') || '<p class="quiet">没有待审批动作。</p>'}
      </div>
    </article>
  </section>
  ${dialog('task-dialog', '新增今日任务', `<form id="task-form" class="form-grid">
    ${formField({ id: 'title', label: '任务', required: true, placeholder: '例如：确认 430 钢厂报价' })}
    ${selectField({ id: 'group', label: '分类', options: ['行情', '开发', '内容', '询盘', '报价', '系统'] })}
    ${selectField({ id: 'priority', label: '优先级', value: 'medium', options: [{ value: 'high', label: '优先' }, { value: 'medium', label: '正常' }, { value: 'low', label: '低' }] })}
    ${formField({ id: 'dueDate', label: '截止日期', type: 'date' })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="task-form">保存任务</button>')}`;
}
