import { approvalRow, pageHeader } from '../ui/components.js';
import {
  APPROVAL_PRIORITIES, filterApprovalsByPriority, groupApprovalsByPriority, sortApprovalsByPriority
} from '../core/approval-policy.js';

function renderPrioritySummary(priority, count, activeFilter) {
  const selected = activeFilter === priority.key;
  return `<button class="approval-priority-card approval-priority-card--${priority.tone} ${selected ? 'is-active' : ''}" type="button" data-action="filter-approvals" data-filter="${priority.key}" aria-pressed="${selected}" aria-controls="approval-results" aria-label="筛选${priority.label}，${count}项待审批；再次点击取消筛选">
    <div><span>${priority.code}</span><strong>${count}</strong></div>
    <span class="approval-priority-card__title">${priority.label}</span>
    <p>${priority.description}</p>
    <small>${selected ? '正在筛选 · 再次点击取消' : '点击筛选'}</small>
  </button>`;
}

function renderPendingGroup({ priority, items }) {
  return `<section class="approval-tier approval-tier--${priority.tone}" aria-labelledby="approval-tier-${priority.key}">
    <header class="approval-tier__header">
      <div class="approval-tier__marker"><strong>${priority.code}</strong><span>优先级 ${priority.rank}</span></div>
      <div><h2 id="approval-tier-${priority.key}">${priority.label}</h2><p>${priority.description}</p></div>
      <b>${items.length} 项</b>
    </header>
    <div class="approval-list">${items.map(approvalRow).join('') || '<p class="approval-tier__empty">当前没有待审批事项</p>'}</div>
  </section>`;
}

function renderHistoryGroup({ priority, items }, open = false) {
  return `<details class="approval-history-tier" ${open ? 'open' : ''}>
    <summary><span><b>${priority.code}</b>${priority.label}</span><strong>${items.length}</strong></summary>
    <div class="approval-list approval-list--history">${items.slice(0, 8).map(approvalRow).join('')}</div>
  </details>`;
}

export function renderApprovals(state, activeFilter = 'all') {
  const allPending = sortApprovalsByPriority(state.approvals.filter(item => item.status === 'pending'));
  const allReviewed = sortApprovalsByPriority(state.approvals.filter(item => item.status !== 'pending'));
  const pending = filterApprovalsByPriority(allPending, activeFilter);
  const reviewed = filterApprovalsByPriority(allReviewed, activeFilter);
  const pendingGroups = groupApprovalsByPriority(allPending, { includeEmpty: true })
    .filter(group => activeFilter === 'all' || group.priority.key === activeFilter);
  const reviewedGroups = groupApprovalsByPriority(reviewed);
  const activePriority = APPROVAL_PRIORITIES.find(item => item.key === activeFilter);
  const filterLabel = activePriority?.label || '全部环节';
  return `${pageHeader({
    eyebrow: 'APPROVAL / HUMAN CONTROL', title: '审批中心',
    description: '审批按业务风险分层：先处理报价与合同，再处理客户沟通，最后处理内容发布。批准只代表允许执行，本地版不会直接对外发送。'
  })}
  <div class="approval-filter-bar" role="group" aria-label="审批环节筛选">
    <div><span>当前范围</span><strong>${filterLabel}</strong><small>${pending.length === allPending.length ? `${pending.length} 项待审批` : `${pending.length} / ${allPending.length} 项待审批`}</small></div>
    <button class="button ${activeFilter === 'all' ? 'button--primary' : 'button--ghost'}" type="button" data-action="filter-approvals" data-filter="all" aria-pressed="${activeFilter === 'all'}" aria-controls="approval-results">展示全部</button>
  </div>
  <section class="approval-priority-overview" aria-label="待审批优先级概览">
    ${APPROVAL_PRIORITIES.map(priority => renderPrioritySummary(priority, allPending.filter(item => item.actionType === priority.actionType).length, activeFilter)).join('')}
  </section>
  <section class="approval-workspace" id="approval-results" aria-live="polite">
    <main class="approval-queue">
      <header class="section-heading"><div><p class="eyebrow">DECISION QUEUE</p><h2>等待决定${activePriority ? ` · ${activePriority.label}` : ''}</h2></div><span>${pending.length} 项</span></header>
      ${pending.length ? pendingGroups.map(renderPendingGroup).join('') : `<div class="approval-queue__empty"><strong>${activePriority ? `${activePriority.label}暂无待审批` : '审批队列已清空'}</strong><p>${activePriority ? '可以点击“展示全部”返回完整队列。' : '当前没有需要你决定的外部动作。'}</p></div>`}
    </main>
    <aside class="approval-history">
      <header class="section-heading"><div><p class="eyebrow">REVIEWED</p><h2>最近复核${activePriority ? ` · ${activePriority.label}` : ''}</h2></div><span>${reviewed.length} 项</span></header>
      ${reviewedGroups.length ? reviewedGroups.map((group, index) => renderHistoryGroup(group, index === 0)).join('') : `<p class="quiet">${activePriority ? '该分类暂无复核记录。' : '暂无审批记录。'}</p>`}
    </aside>
  </section>`;
}
