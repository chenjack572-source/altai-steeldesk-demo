import { escapeHtml, formatDate, formatDateTime } from '../core/format.js';

const iconPaths = {
  dashboard: '<path d="M3.5 4.5h6v6h-6zM14.5 4.5h6v4h-6zM14.5 12.5h6v7h-6zM3.5 14.5h6v5h-6z"/>',
  crm: '<path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 3a3 3 0 1 0 0-6m-13 12c.8-4 3-6 6-6s5.2 2 6 6m1-6c2.6.2 4.3 2.2 5 5"/>',
  rfqs: '<path d="M5 3.5h14v17H5zM8 8h8M8 12h8M8 16h5M3 7h4M3 17h4"/>',
  pricing: '<path d="M4 6.5h16v12H4zM7 10h3M14 15h3M12 9.5c-1.7 0-2.7.7-2.7 1.7 0 2.5 5.4 1 5.4 3.4 0 1-1 1.8-2.7 1.8m0-6.9V8m0 10v-1.6"/>',
  content: '<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
  approvals: '<path d="M12 3 5 6v5c0 4.8 2.8 8.3 7 10 4.2-1.7 7-5.2 7-10V6l-7-3Z"/><path d="m8.7 12 2.1 2.1 4.6-5"/>',
  suppliers: '<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01"/>',
  market: '<path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-7"/>',
  knowledge: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23V5.5Z"/>',
  integrations: '<path d="M8 12h8M6.5 9.5 4 12l2.5 2.5m11-5L20 12l-2.5 2.5M10 5V3m4 2V3m-4 18v-2m4 2v-2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  theme: '<path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevronDown: '<path d="m7 10 5 5 5-5"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 13v6H5V5h6"/>'
};

export function uiIcon(name, className = 'ui-icon') {
  const paths = iconPaths[name] || iconPaths.dashboard;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export function badge(text, tone = 'neutral') {
  return `<span class="badge badge--${tone}">${escapeHtml(text)}</span>`;
}

export function statusBadge(status) {
  const map = {
    pending: ['待审批', 'warning'], approved: ['已批准', 'success'], rejected: ['已拒绝', 'danger'],
    draft: ['草稿', 'neutral'], idea: ['选题', 'info'], pending_approval: ['待审批', 'warning'], published: ['已发布', 'success'],
    research: ['研究中', 'info'], contacted: ['已联系', 'warning'], qualified: ['已确认', 'success'], nurture: ['培育中', 'neutral'],
    needs_info: ['待补资料', 'danger'], mill_inquiry: ['钢厂询价', 'warning'], quoted: ['已报价', 'success'], won: ['已成交', 'success'],
    active: ['已启用', 'success'], registered: ['已注册', 'info'], not_started: ['未开通', 'neutral'], review: ['待复核', 'warning']
  };
  const [label, tone] = map[status] || [status || '未知', 'neutral'];
  return badge(label, tone);
}

export function emptyState(title, detail, action = '') {
  return `<div class="empty-state"><span class="empty-state__mark" aria-hidden="true">∅</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p>${action}</div>`;
}

export function pageHeader({ eyebrow, title, description, actions = '' }) {
  return `<header class="page-header">
    <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>
    <div class="page-header__actions">${actions}</div>
  </header>`;
}

export function metric(label, value, detail = '', tone = 'default') {
  return `<article class="metric metric--${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small></article>`;
}

export function dialog(id, title, body, footer = '') {
  const safeFooter = footer.replaceAll('value="cancel"', 'value="cancel" data-action="close-dialog" type="button"');
  return `<dialog class="dialog" id="${escapeHtml(id)}" aria-labelledby="${escapeHtml(id)}-title">
    <div class="dialog__frame">
      <header class="dialog__header"><div><p class="eyebrow">SteelDesk</p><h2 id="${escapeHtml(id)}-title">${escapeHtml(title)}</h2></div><button class="icon-button" type="button" data-action="close-dialog" aria-label="关闭">${uiIcon('close')}</button></header>
      <div class="dialog__body">${body}</div>
      ${safeFooter ? `<footer class="dialog__footer">${safeFooter}</footer>` : ''}
    </div>
  </dialog>`;
}

export function formField({ id, label, value = '', type = 'text', required = false, placeholder = '', help = '', min, step }) {
  const attrs = [
    `id="${escapeHtml(id)}"`, `name="${escapeHtml(id)}"`, `type="${escapeHtml(type)}"`, `value="${escapeHtml(value)}"`,
    placeholder ? `placeholder="${escapeHtml(placeholder)}"` : '', required ? 'required' : '',
    min !== undefined ? `min="${escapeHtml(min)}"` : '', step !== undefined ? `step="${escapeHtml(step)}"` : ''
  ].filter(Boolean).join(' ');
  return `<div class="field"><label for="${escapeHtml(id)}">${escapeHtml(label)}${required ? ' <span aria-label="必填">*</span>' : ''}</label><input ${attrs} />${help ? `<small>${escapeHtml(help)}</small>` : ''}</div>`;
}

export function selectField({ id, label, value = '', options = [], required = false, help = '' }) {
  return `<div class="field"><label for="${escapeHtml(id)}">${escapeHtml(label)}${required ? ' <span aria-label="必填">*</span>' : ''}</label>
    <select id="${escapeHtml(id)}" name="${escapeHtml(id)}" ${required ? 'required' : ''}>
      ${options.map(option => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        return `<option value="${escapeHtml(item.value)}" ${item.value === value ? 'selected' : ''}>${escapeHtml(item.label)}</option>`;
      }).join('')}
    </select>${help ? `<small>${escapeHtml(help)}</small>` : ''}</div>`;
}

export function choiceField({
  id, label, options = [], selected = [], multiple = false, required = false, help = '',
  customLabel = '新增自定义选项', storageKey = id, searchable
}) {
  const normalized = options.map(option => typeof option === 'string' ? { value: option, label: option, keywords: '' } : option);
  const selectedValues = new Set(Array.isArray(selected) ? selected : [selected].filter(Boolean));
  const selectedLabels = normalized.filter(option => selectedValues.has(option.value)).map(option => option.label);
  const summary = selectedLabels.length ? `${selectedLabels.join('、')}${multiple ? ` · ${selectedLabels.length} 项` : ''}` : `请选择${multiple ? '（可单选或多选）' : ''}`;
  const hasSearch = searchable ?? normalized.length > 20;
  const inputType = multiple ? 'checkbox' : 'radio';
  const panelId = `${id}ChoicePanel`;
  return `<fieldset class="field multi-select-field" data-choice-field="${escapeHtml(id)}">
    <legend>${escapeHtml(label)}${required ? ' <span aria-label="必填">*</span>' : ''}</legend>
    <div class="multi-select" data-choice-group="${escapeHtml(id)}" data-choice-mode="${multiple ? 'multiple' : 'single'}" data-choice-required="${required}" data-choice-storage="${escapeHtml(storageKey)}">
      <button class="multi-select__trigger" type="button" popovertarget="${escapeHtml(panelId)}" aria-haspopup="listbox" aria-expanded="false" aria-describedby="${escapeHtml(id)}-help"><span data-choice-summary>${escapeHtml(summary)}</span><b aria-hidden="true">${uiIcon('chevronDown')}</b></button>
      <div class="multi-select__panel" id="${escapeHtml(panelId)}" popover="auto" data-choice-panel role="group" aria-label="${escapeHtml(label)}选项">
        ${hasSearch ? `<label class="choice-search" for="${escapeHtml(id)}Search"><span>搜索选项</span><input id="${escapeHtml(id)}Search" type="search" data-choice-search placeholder="输入中文、英文或关键词" autocomplete="off" /></label>` : ''}
        <p>${multiple ? '勾选一个或多个选项' : '选择一个选项'}${hasSearch ? ` · 共 ${normalized.length} 项` : ''}</p>
        <div class="multi-select__options">
          ${normalized.map(option => `<label data-choice-option data-search="${escapeHtml(`${option.label} ${option.value} ${option.keywords || ''}`)}"><input type="${inputType}" name="${escapeHtml(id)}Option" value="${escapeHtml(option.value)}" ${selectedValues.has(option.value) ? 'checked' : ''} /><span>${escapeHtml(option.label)}</span></label>`).join('')}
          <div class="choice-search-empty" data-choice-empty hidden>没有匹配项，可在下方新增自定义值。</div>
        </div>
        <div class="multi-select__custom">
          <label for="${escapeHtml(id)}Custom">${escapeHtml(customLabel)}</label>
          <div><input id="${escapeHtml(id)}Custom" type="text" maxlength="60" placeholder="输入后添加" /><button class="button button--ghost" type="button" data-action="add-content-choice" data-choice-group="${escapeHtml(id)}">添加并选中</button></div>
        </div>
      </div>
    </div>
    ${help ? `<small id="${escapeHtml(id)}-help">${escapeHtml(help)}</small>` : `<small id="${escapeHtml(id)}-help">${multiple ? '可以选择多项。' : '请选择一项。'}</small>`}
    <small class="choice-error" data-choice-error role="alert" hidden>请至少选择一项。</small>
  </fieldset>`;
}

export function textareaField({ id, label, value = '', required = false, placeholder = '', help = '' }) {
  return `<div class="field field--full"><label for="${escapeHtml(id)}">${escapeHtml(label)}${required ? ' <span aria-label="必填">*</span>' : ''}</label><textarea id="${escapeHtml(id)}" name="${escapeHtml(id)}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>${help ? `<small>${escapeHtml(help)}</small>` : ''}</div>`;
}

export function approvalRow(item) {
  const actionLabel = {
    formal_quote: '批准报价',
    customer_message: '批准发送',
    content_publish: '批准发布'
  }[item.actionType] || '批准';
  return `<article class="approval-row" data-approval-id="${escapeHtml(item.id)}" data-approval-type="${escapeHtml(item.actionType)}">
    <div class="approval-row__meta"><span>${escapeHtml(item.channel || item.actionType)}</span><time>${formatDateTime(item.createdAt)}</time></div>
    <div class="approval-row__body"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${item.recipient ? `<small>对象：${escapeHtml(item.recipient)}</small>` : ''}</div>${statusBadge(item.status)}</div>
    ${item.status === 'pending' ? `<div class="approval-row__actions"><button class="button button--ghost" data-action="reject-approval" data-id="${escapeHtml(item.id)}" aria-label="退回：${escapeHtml(item.title)}">退回</button><button class="button button--primary" data-action="approve-approval" data-id="${escapeHtml(item.id)}" aria-label="${actionLabel}：${escapeHtml(item.title)}">${actionLabel}</button></div>` : `<small>复核时间：${formatDate(item.reviewedAt)}</small>`}
  </article>`;
}
