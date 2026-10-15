import { choiceField, dialog, formField, pageHeader, statusBadge, textareaField } from '../ui/components.js';
import { escapeHtml, formatDate } from '../core/format.js';
import { COUNTRY_OPTIONS, FINISH_OPTIONS, GRADE_OPTIONS, INCOTERM_OPTIONS, PRODUCT_FORM_OPTIONS, STANDARD_OPTIONS } from '../domain/form-options.js';
import { storedChoiceOptions } from '../services/content-options.js';

export function renderRfqs(state) {
  const countries = storedChoiceOptions('rfq-countries', COUNTRY_OPTIONS);
  const grades = storedChoiceOptions('stainless-grades', GRADE_OPTIONS);
  return `${pageHeader({
    eyebrow: 'RFQ / SPECIFICATION FIRST', title: '询盘与规格完整性',
    description: '先补齐影响材料、加工和交付的参数，再向钢厂询价。',
    actions: '<button class="button button--primary" data-action="open-rfq-dialog">新增 RFQ</button>'
  })}
  <section class="rfq-grid">
    ${state.rfqs.map(rfq => `<article class="rfq-card">
      <header><div><p>${escapeHtml(rfq.reference)}</p><h2>${escapeHtml(rfq.companyName)}</h2></div>${statusBadge(rfq.status)}</header>
      <div class="spec-line"><strong>${escapeHtml(rfq.grade)}</strong><span>${escapeHtml(rfq.product)}</span><span>${escapeHtml(rfq.thickness)} × ${escapeHtml(rfq.width)}</span></div>
      <dl><div><dt>标准</dt><dd>${escapeHtml(rfq.standard || '待确认')}</dd></div><div><dt>表面</dt><dd>${escapeHtml(rfq.finish || '待确认')}</dd></div><div><dt>数量</dt><dd>${escapeHtml(rfq.quantityMt)} MT</dd></div><div><dt>贸易条款</dt><dd>${escapeHtml(rfq.incoterm)} ${escapeHtml(rfq.destination || '')}</dd></div></dl>
      <div class="completeness"><div><span>规格完整度</span><strong>${rfq.completeness}%</strong></div><div class="progress"><i style="inline-size:${rfq.completeness}%"></i></div></div>
      <footer><small>报价截止 ${formatDate(rfq.dueAt)}</small><button class="text-button" data-action="advance-rfq" data-id="${escapeHtml(rfq.id)}">推进状态 →</button></footer>
    </article>`).join('')}
  </section>
  ${dialog('rfq-dialog', '新增 RFQ', `<form id="rfq-form" class="form-grid">
    ${formField({ id: 'companyName', label: '客户公司', required: true })}
    ${choiceField({ id: 'country', label: '国家', options: countries, required: true, storageKey: 'rfq-countries', customLabel: '新增国家 / 市场', help: '支持中文、英文和关键词搜索。' })}
    ${choiceField({ id: 'product', label: '产品形态', options: storedChoiceOptions('product-forms', PRODUCT_FORM_OPTIONS), required: true, storageKey: 'product-forms', customLabel: '新增产品形态' })}
    ${choiceField({ id: 'grade', label: '牌号', options: grades, multiple: true, required: true, storageKey: 'stainless-grades', customLabel: '新增牌号', help: '同一 RFQ 可包含多个牌号或替代牌号。' })}
    ${choiceField({ id: 'standard', label: '标准', options: storedChoiceOptions('material-standards', STANDARD_OPTIONS), multiple: true, storageKey: 'material-standards', customLabel: '新增标准' })}
    ${choiceField({ id: 'finish', label: '表面', options: storedChoiceOptions('surface-finishes', FINISH_OPTIONS), multiple: true, storageKey: 'surface-finishes', customLabel: '新增表面' })}
    ${formField({ id: 'thickness', label: '厚度', placeholder: '0.6 mm' })}
    ${formField({ id: 'width', label: '宽度', placeholder: '1219 mm' })}
    ${formField({ id: 'quantityMt', label: '数量 MT', type: 'number', min: 0, step: '0.01' })}
    ${choiceField({ id: 'incoterm', label: '贸易条款', options: storedChoiceOptions('incoterms', INCOTERM_OPTIONS), selected: 'FOB', required: true, storageKey: 'incoterms', customLabel: '新增贸易条款' })}
    ${formField({ id: 'destination', label: '目的港 / 地点' })}
    ${textareaField({ id: 'notes', label: '补充要求', placeholder: '卷重、包装、MTC、检验、交期…' })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="rfq-form" value="default">保存 RFQ</button>')}`;
}
