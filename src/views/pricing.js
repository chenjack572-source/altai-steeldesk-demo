import { dialog, formField, pageHeader, selectField, textareaField } from '../ui/components.js';
import { calculateQuote } from '../services/pricing.js';
import { escapeHtml, formatCurrency, formatNumber } from '../core/format.js';
import { groupQuotesByMonth, quoteRecordDate, serializeLineItems } from '../services/quote-archive.js';

const defaults = {
  currency: 'USD', weightMt: 25, materialPerMt: 1080, processingPerMt: 35,
  freightPerMt: 65, packagingTotal: 320, fixedFees: 480, financeRate: 1.2,
  riskRate: 1, marginRate: 7, fxRate: 7.1
};

export function renderPricing(state, current = defaults, query = '', editId = '', deleteId = '') {
  const result = calculateQuote(current);
  const quoteCurrency = String(current.currency || 'USD').toUpperCase();
  const isCny = quoteCurrency === 'CNY';
  const records = [...state.quotes]
    .filter(item => quoteSearchText(item).includes(query.trim().toLowerCase()))
    .sort((a, b) => String(b.quoteDate || b.createdAt).localeCompare(String(a.quoteDate || a.createdAt)));
  const groups = groupQuotesByMonth(records);
  const editRecord = state.quotes.find(item => item.id === editId);
  const deleteRecord = state.quotes.find(item => item.id === deleteId);
  return `${pageHeader({
    eyebrow: 'PRICING / COMMERCIAL RECORDS', title: '报价与合同',
    description: '新报价由明确的成本层组成；历史报价、合同与原始附件保留在同一处。',
    actions: '<button class="button button--primary" type="submit" form="pricing-form">保存并提交审批</button>'
  })}
  <section class="pricing-layout">
    <form id="pricing-form" class="panel pricing-form" data-live-calculator>
      <header class="panel__header"><div><p class="eyebrow">INPUT</p><h2>成本与政策</h2></div><span>本地计算</span></header>
      <div class="form-grid">
        ${selectField({ id: 'currency', label: '报价币种', value: current.currency, options: ['USD', 'CNY', 'EUR', 'AED', 'SAR', 'INR'] })}
        ${formField({ id: 'weightMt', label: '重量 MT', type: 'number', value: current.weightMt, min: 0, step: '0.01' })}
        ${formField({ id: 'materialPerMt', label: '材料成本 / MT', type: 'number', value: current.materialPerMt, min: 0, step: '0.01' })}
        ${formField({ id: 'processingPerMt', label: '加工费 / MT', type: 'number', value: current.processingPerMt, min: 0, step: '0.01' })}
        ${formField({ id: 'freightPerMt', label: '运费 / MT', type: 'number', value: current.freightPerMt, min: 0, step: '0.01' })}
        ${formField({ id: 'packagingTotal', label: '包装费（总额）', type: 'number', value: current.packagingTotal, min: 0, step: '0.01' })}
        ${formField({ id: 'fixedFees', label: '港杂/文件等固定费', type: 'number', value: current.fixedFees, min: 0, step: '0.01' })}
        ${formField({ id: 'financeRate', label: '融资成本 %', type: 'number', value: current.financeRate, min: 0, step: '0.1' })}
        ${formField({ id: 'riskRate', label: '风险缓冲 %', type: 'number', value: current.riskRate, min: 0, step: '0.1' })}
        ${formField({ id: 'marginRate', label: '目标毛利率 %', type: 'number', value: current.marginRate, min: 0, step: '0.1' })}
        <div class="field" data-fx-field>
          <div class="field__label-row"><label for="fxRate" data-fx-label>${isCny ? '人民币报价无需换算' : `人民币换算汇率（1 ${escapeHtml(quoteCurrency)} = ? CNY）`}</label><button class="text-button fx-refresh" type="button" data-action="refresh-fx" ${isCny ? 'hidden' : ''}>刷新汇率</button></div>
          <input id="fxRate" name="fxRate" type="number" value="${escapeHtml(isCny ? 1 : current.fxRate)}" min="0.0001" step="0.0001" data-previous-rate="${escapeHtml(current.fxRate || 7.1)}" aria-describedby="fxRate-help" ${isCny ? 'disabled aria-disabled="true"' : ''} />
          <input type="hidden" name="fxDate" value="${escapeHtml(current.fxDate || '')}" />
          <input type="hidden" name="fxSource" value="${escapeHtml(current.fxSource || '')}" />
          <small id="fxRate-help" data-fx-help aria-live="polite">${isCny ? '报价币种已经是人民币，人民币参考金额与报价总额相同。' : `正在获取 ${escapeHtml(quoteCurrency)} 对人民币的最新日度汇率…`}</small>
          ${!isCny ? '<a class="fx-source" href="https://frankfurter.dev/" target="_blank" rel="noreferrer">数据源：Frankfurter · 官方来源日度参考 ↗</a>' : ''}
        </div>
      </div>
    </form>
    ${renderQuoteResult(result, current)}
  </section>
  <section class="quote-history-section">
    <header class="section-heading"><div><p class="eyebrow">ARCHIVE / SOURCE LINKED</p><h2>历史报价与合同</h2></div><span>${records.length} 份记录</span></header>
    <div class="toolbar quote-history-toolbar" aria-label="历史报价筛选">
      <label class="search-field"><span>⌕</span><input type="search" id="quote-history-filter" value="${escapeHtml(query)}" placeholder="搜索客户、合同号、牌号或规格" aria-label="搜索历史报价与合同" /></label>
      <small>已导入资料保留原文件；识别不确定项会单独标记。</small>
    </div>
    <div class="quote-month-list">${groups.map((group, index) => renderQuoteMonth(group, index === 0)).join('') || '<p class="quiet">没有匹配的报价记录。</p>'}</div>
  </section>
  ${editRecord ? renderEditQuoteDialog(editRecord) : ''}
  ${deleteRecord ? renderDeleteQuoteDialog(deleteRecord) : ''}`;
}

function quoteSearchText(item) {
  return [item.customer, item.supplier, item.reference, item.recordType, ...(item.lineItems || []).flatMap(line => [line.product, line.grade, line.specification])]
    .filter(Boolean).join(' ').toLowerCase();
}

function renderQuoteMonth(group, open) {
  const quotations = group.items.filter(item => item.recordType !== 'contract').length;
  const contracts = group.items.length - quotations;
  return `<details class="quote-month" ${open ? 'open' : ''}>
    <summary><span><b>${escapeHtml(group.label)}</b><small>${group.items.length} 条记录 · ${quotations} 份报价${contracts ? ` · ${contracts} 份合同` : ''}</small></span><strong>${group.items.length}</strong></summary>
    <div class="quote-month__records">${group.items.map(renderQuoteMenuItem).join('')}</div>
  </details>`;
}

function renderQuoteMenuItem(item) {
  const typeLabel = item.recordType === 'contract' ? '购销合同' : item.recordType === 'quotation' ? '报价单' : '本地报价';
  const total = item.recordType ? item.total : item.result?.quoteTotal;
  const currency = item.recordType ? item.currency : item.input?.currency;
  return `<details class="quote-record-menu">
    <summary>
      <span class="record-type record-type--${escapeHtml(item.recordType || 'local')}">${typeLabel}</span>
      <span><strong>${escapeHtml(item.customer || '客户待选择')}</strong><small>${escapeHtml(item.reference || '未编号')} · ${escapeHtml(quoteRecordDate(item) || '日期待补充')}</small></span>
      <b>${formatCurrency(total || 0, currency || 'CNY', 'zh-CN')}</b>
    </summary>
    ${item.recordType ? renderQuoteRecord(item) : renderCalculatedRecord(item)}
  </details>`;
}

function renderQuoteRecord(item) {
  const typeLabel = item.recordType === 'contract' ? '购销合同' : '报价单';
  const lines = item.lineItems || [];
  const grades = [...new Set(lines.map(line => line.grade).filter(Boolean))].join(' / ') || '—';
  return `<article class="quote-record">
    <header class="quote-record__header">
      <div><div class="quote-record__meta"><span class="record-type record-type--${escapeHtml(item.recordType)}">${typeLabel}</span><time>${escapeHtml(item.quoteDate || '日期待补充')}</time></div><h3>${escapeHtml(item.customer || '客户待补充')}</h3><p>${escapeHtml(item.reference || '未编号')}</p></div>
      <strong>${formatCurrency(item.total, item.currency || 'CNY', 'zh-CN')}</strong>
    </header>
    <div class="quote-record__facts">
      <div><span>供应方</span><strong>${escapeHtml(item.supplier || '—')}</strong></div>
      <div><span>牌号</span><strong>${escapeHtml(grades)}</strong></div>
      <div><span>明细</span><strong>${lines.length} 项</strong></div>
      <div><span>税费</span><strong>${item.taxIncluded ? `含税${item.taxRate ? ` ${formatNumber(item.taxRate)}%` : ''}` : '未注明'}</strong></div>
    </div>
    <details class="quote-record__details">
      <summary>查看产品明细与交易条款</summary>
      <div class="table-scroll"><table class="line-item-table"><thead><tr><th>产品</th><th>材质</th><th>规格</th><th>数量</th><th>重量 kg</th><th>单价</th><th>金额</th><th>备注</th></tr></thead><tbody>
        ${lines.map(line => `<tr><td>${escapeHtml(line.product)}</td><td>${escapeHtml(line.grade || '—')}</td><td>${escapeHtml(line.specification || '—')}</td><td>${formatNumber(line.quantity)} ${escapeHtml(line.unit || '')}</td><td>${line.weightKg == null ? '—' : formatNumber(line.weightKg)}</td><td>${formatNumber(line.unitPrice)}<small>${escapeHtml(line.priceBasis || '')}</small></td><td>${formatCurrency(line.amount, item.currency || 'CNY', 'zh-CN')}</td><td>${escapeHtml(line.remarks || '—')}</td></tr>`).join('')}
      </tbody></table></div>
      <dl class="commercial-terms">
        <div><dt>交货</dt><dd>${escapeHtml(item.delivery || '未注明')}</dd></div>
        <div><dt>付款</dt><dd>${escapeHtml(item.payment || '未注明')}</dd></div>
        <div><dt>交期</dt><dd>${escapeHtml(item.leadTime || '未注明')}</dd></div>
        <div><dt>有效期</dt><dd>${escapeHtml(item.validity || '未注明')}</dd></div>
      </dl>
      ${(item.notes || []).length ? `<div class="record-notes"><strong>原件备注</strong><ul>${item.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>` : ''}
      ${(item.dataQuality || []).length ? `<div class="data-quality"><strong>需要核实</strong><ul>${item.dataQuality.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>` : ''}
    </details>
    <footer><span>${escapeHtml(item.status === 'historical' ? '历史资料' : item.status)}</span><div class="quote-record__actions">${item.attachment ? `<a class="text-button" href="${escapeHtml(item.attachment)}" target="_blank" rel="noreferrer">${escapeHtml(item.attachmentLabel || '打开原件')} ↗</a>` : ''}<button class="text-button" type="button" data-action="edit-quote-record" data-id="${escapeHtml(item.id)}">编辑</button><button class="text-button text-button--danger" type="button" data-action="delete-quote-record" data-id="${escapeHtml(item.id)}">删除</button></div></footer>
  </article>`;
}

function renderCalculatedRecord(item) {
  const total = item.result?.quoteTotal || 0;
  const currency = item.input?.currency || 'USD';
  return `<article class="quote-record quote-record--draft"><header class="quote-record__header"><div><div class="quote-record__meta"><span class="record-type">本地报价</span><time>${escapeHtml(quoteRecordDate(item))}</time></div><h3>${escapeHtml(item.customer || '客户待选择')}</h3><p>${escapeHtml(item.reference || '未编号')}</p></div><strong>${formatCurrency(total, currency, 'zh-CN')}</strong></header><div class="quote-record__facts"><div><span>重量</span><strong>${formatNumber(item.input?.weightMt || 0)} MT</strong></div><div><span>报价币种</span><strong>${escapeHtml(currency)}</strong></div><div><span>毛利率</span><strong>${formatNumber((item.result?.grossMargin || 0) * 100, 1)}%</strong></div><div><span>汇率日期</span><strong>${escapeHtml(item.input?.fxDate || '未记录')}</strong></div></div><footer><span>${escapeHtml(item.status || '待审批')}</span><div class="quote-record__actions"><a class="text-button" href="#/approvals">前往审批中心 →</a><button class="text-button" type="button" data-action="edit-quote-record" data-id="${escapeHtml(item.id)}">编辑</button><button class="text-button text-button--danger" type="button" data-action="delete-quote-record" data-id="${escapeHtml(item.id)}">删除</button></div></footer></article>`;
}

function renderEditQuoteDialog(item) {
  const local = !item.recordType;
  const currency = local ? item.input?.currency || 'USD' : item.currency || 'CNY';
  const total = local ? item.result?.quoteTotal || 0 : item.total || 0;
  return dialog('quote-edit-dialog', '编辑报价 / 合同记录', `<form id="quote-edit-form" class="form-grid">
    <input type="hidden" name="quoteId" value="${escapeHtml(item.id)}" />
    ${selectField({ id: 'edit-recordType', label: '记录类型', value: item.recordType || 'local', options: [{ value: 'local', label: '本地报价' }, { value: 'quotation', label: '报价单' }, { value: 'contract', label: '购销合同' }] })}
    ${formField({ id: 'edit-quoteDate', label: '记录日期', type: 'date', value: quoteRecordDate(item), required: true })}
    ${formField({ id: 'edit-reference', label: '编号 / 文件名', value: item.reference || '', required: true })}
    ${formField({ id: 'edit-customer', label: '客户名称', value: item.customer || '', required: true })}
    ${formField({ id: 'edit-supplier', label: '供应方', value: item.supplier || '无锡阿尔泰钢业有限公司' })}
    ${selectField({ id: 'edit-currency', label: '币种', value: currency, options: ['USD', 'CNY', 'EUR', 'AED', 'SAR', 'INR'] })}
    ${formField({ id: 'edit-total', label: '总金额', type: 'number', value: total, min: 0, step: '0.01', required: true })}
    ${selectField({ id: 'edit-taxIncluded', label: '是否含税', value: item.taxIncluded ? 'yes' : 'no', options: [{ value: 'yes', label: '含税' }, { value: 'no', label: '未注明 / 不含税' }] })}
    ${formField({ id: 'edit-taxRate', label: '税率 %', type: 'number', value: item.taxRate ?? '', min: 0, step: '0.01' })}
    ${formField({ id: 'edit-delivery', label: '交货地点 / 条件', value: item.delivery || '' })}
    ${formField({ id: 'edit-payment', label: '付款方式', value: item.payment || '' })}
    ${formField({ id: 'edit-leadTime', label: '交期', value: item.leadTime || '' })}
    ${formField({ id: 'edit-validity', label: '有效期', value: item.validity || '' })}
    ${textareaField({ id: 'edit-lineItems', label: '产品明细', value: serializeLineItems(item.lineItems), help: '每行：产品 | 材质 | 规格 | 数量 | 单位 | 重量kg | 单价 | 计价方式 | 金额 | 备注' })}
    ${textareaField({ id: 'edit-notes', label: '备注', value: (item.notes || []).join('\n'), help: '每行一条备注。' })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="quote-edit-form" value="default">保存修改</button>');
}

function renderDeleteQuoteDialog(item) {
  return dialog('quote-delete-dialog', '删除历史记录', `<div class="delete-warning"><strong>将从本地数据库删除这条记录</strong><p>${escapeHtml(item.reference || '未编号')} · ${escapeHtml(item.customer || '客户待选择')}</p><small>对应的审批记录会一并删除；原始 Word 或图片附件不会从磁盘删除。</small></div>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--danger" type="button" data-action="confirm-delete-quote" value="default">确认删除</button>');
}

export function renderQuoteResult(result, current) {
  const quoteCurrency = String(current.currency || 'USD').toUpperCase();
  const isCny = quoteCurrency === 'CNY';
  return `<aside class="quote-sheet" id="quote-result">
      <header><p>INDICATIVE QUOTATION</p><strong>${formatCurrency(result.quotePerMt, quoteCurrency)}<small>/ MT</small></strong></header>
      <dl>
        <div><dt>材料</dt><dd>${formatCurrency(result.material, quoteCurrency)}</dd></div>
        <div><dt>加工</dt><dd>${formatCurrency(result.processing, quoteCurrency)}</dd></div>
        <div><dt>物流与固定费用</dt><dd>${formatCurrency(result.freight + Number(current.packagingTotal) + Number(current.fixedFees), quoteCurrency)}</dd></div>
        <div><dt>融资与风险</dt><dd>${formatCurrency(result.finance + result.risk, quoteCurrency)}</dd></div>
        <div class="quote-sheet__subtotal"><dt>利润前成本</dt><dd>${formatCurrency(result.costBeforeMargin, quoteCurrency)}</dd></div>
        <div><dt>毛利</dt><dd>${formatCurrency(result.grossProfit, quoteCurrency)} · ${formatNumber(result.grossMargin * 100, 1)}%</dd></div>
      </dl>
      <div class="quote-sheet__total"><span>报价总额</span><strong>${formatCurrency(result.quoteTotal, quoteCurrency)}</strong><small>人民币参考：${formatCurrency(result.localCurrencyTotal, 'CNY', 'zh-CN')}${isCny ? '（无需换算）' : ''}</small>${!isCny ? `<small class="quote-sheet__rate">1 ${escapeHtml(quoteCurrency)} = ${formatNumber(current.fxRate, 6)} CNY${current.fxDate ? ` · 数据日 ${escapeHtml(current.fxDate)}` : ' · 等待最新汇率'}</small>` : ''}</div>
      <p class="quote-sheet__note">此页面仅进行本地计算。保存后生成“正式报价”审批，批准前不会发送给任何客户。</p>
    </aside>`;
}
