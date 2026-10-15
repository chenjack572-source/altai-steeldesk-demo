import { pageHeader, statusBadge } from '../ui/components.js';
import { escapeHtml, formatDate } from '../core/format.js';
import { acquisitionStages, getChannelStrategy, priorityLabels } from '../domain/channel-strategy.js';

function scoreDots(value, label) {
  return `<span class="channel-score" role="img" aria-label="${escapeHtml(label)}，5 分制 ${value} 分">${Array.from({ length: 5 }, (_, index) => `<i class="${index < value ? 'is-on' : ''}"></i>`).join('')}</span>`;
}

function renderPrioritySummary(items) {
  const groups = [1, 2, 3].map(priority => ({
    priority,
    meta: priorityLabels[priority],
    items: items.filter(item => getChannelStrategy(item.id).priority === priority)
  }));
  return `<section class="channel-priority" aria-labelledby="channel-priority-title">
    <header><div><p>建议投入顺序</p><h2 id="channel-priority-title">先抓高意向，再用内容放大</h2></div><p>按不锈钢外贸获客场景评估；成本为相对投入，不是固定广告报价。</p></header>
    <div class="channel-priority__lanes">
      ${groups.map(group => `<div class="priority-lane priority-lane--${group.meta.tone}"><strong><b>${group.meta.short}</b>${group.meta.label}</strong><div>${group.items.map(item => `<span>${escapeHtml(item.name)}<small>${escapeHtml(getChannelStrategy(item.id).role)}</small></span>`).join('')}</div></div>`).join('')}
    </div>
  </section>`;
}

function renderAcquisitionPath() {
  return `<section class="acquisition-path" aria-label="推荐获客路径">
    ${acquisitionStages.map((stage, index) => `<div><span>${index + 1}</span><p><strong>${escapeHtml(stage.label)}</strong><small>${escapeHtml(stage.channels.join(' / '))}</small></p></div>`).join('')}
  </section>`;
}

function renderIntegrationCard(item) {
  const strategy = getChannelStrategy(item.id);
  const priority = priorityLabels[strategy.priority];
  return `<article class="integration-card integration-card--p${strategy.priority}">
    <header><div class="integration-card__mark">${escapeHtml(item.name.slice(0, 2).toUpperCase())}</div><div><div class="integration-card__title"><h2>${escapeHtml(item.name)}</h2><span>${priority.short} · ${escapeHtml(strategy.role)}</span></div><p>${escapeHtml(item.account || item.mode)}</p></div>${statusBadge(item.status)}</header>
    <dl class="channel-metrics">
      <div><dt>获客成本</dt><dd>${scoreDots(strategy.cost, '获客成本')}<b>${escapeHtml(strategy.costLabel)}</b></dd></div>
      <div><dt>线索质量</dt><dd>${scoreDots(strategy.quality, '线索质量')}<b>${escapeHtml(strategy.qualityLabel)}</b></dd></div>
      <div><dt>见效周期</dt><dd><b>${escapeHtml(strategy.cycle)}</b></dd></div>
    </dl>
    <p class="channel-fit"><span>最适合</span>${escapeHtml(strategy.bestFor)}</p>
    <div class="channel-tradeoffs"><p><strong>优势</strong>${escapeHtml(strategy.strength)}</p><p><strong>短板</strong>${escapeHtml(strategy.weakness)}</p></div>
    <div class="channel-next"><span>建议下一步</span><strong>${escapeHtml(strategy.action)}</strong></div>
    <div class="capability-list">${item.capabilities.map(capability => `<span>${escapeHtml(capability)}</span>`).join('')}</div>
    <footer><small>状态更新 ${formatDate(item.updatedAt)}</small><button class="button button--ghost" disabled>${item.status === 'active' ? '查看配置' : '以后配置'}</button></footer>
  </article>`;
}

function renderDataConnector(item) {
  return `<article class="data-connector">
    <div class="integration-card__mark">${escapeHtml(item.name.slice(0, 2).toUpperCase())}</div>
    <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.mode)}</p><div class="capability-list">${item.capabilities.map(capability => `<span>${escapeHtml(capability)}</span>`).join('')}</div></div>
    <div>${statusBadge(item.status)}<small>状态更新 ${formatDate(item.updatedAt)}</small></div>
  </article>`;
}

export function renderIntegrations(state) {
  const items = state.integrations.filter(item => item.category !== 'market_data').sort((a, b) => getChannelStrategy(a.id).rank - getChannelStrategy(b.id).rank);
  const dataConnectors = state.integrations.filter(item => item.category === 'market_data');
  return `${pageHeader({
    eyebrow: 'CHANNELS / DECISION DESK', title: '平台连接与获客决策',
    description: '先判断平台是否值得投入，再决定连接顺序。所有评价都以寻找不锈钢采购客户为目标。'
  })}
  ${renderPrioritySummary(items)}
  ${renderAcquisitionPath()}
  <section class="integration-notice"><strong>当前为安全离线模式</strong><p>这里先辅助你做渠道判断；连接卡片不会登录平台，也不会产生 API 调用。实际授权、保存草稿或发布仍需单独配置并确认。</p></section>
  <section class="integration-grid">
    ${items.map(renderIntegrationCard).join('')}
  </section>
  ${dataConnectors.length ? `<section class="data-connectors" aria-labelledby="data-connectors-title"><header><div><h2 id="data-connectors-title">业务数据连接</h2><p>为行情、报价和复核提供数据，不参与获客优先级评分。</p></div><span>${dataConnectors.length} 个已接入</span></header>${dataConnectors.map(renderDataConnector).join('')}</section>` : ''}`;
}
