import { choiceField, dialog, formField, pageHeader, statusBadge, textareaField } from '../ui/components.js';
import { escapeHtml } from '../core/format.js';
import { GRADE_OPTIONS, PRODUCT_FORM_OPTIONS, REGION_OPTIONS, SUPPLIER_TYPE_OPTIONS } from '../domain/form-options.js';
import { storedChoiceOptions } from '../services/content-options.js';

export function renderSuppliers(state) {
  const grades = storedChoiceOptions('stainless-grades', GRADE_OPTIONS);
  return `${pageHeader({
    eyebrow: 'SUPPLY / MILL NETWORK', title: '钢厂与供应商能力库',
    description: '代理模式的核心不是虚拟库存，而是清楚知道哪家钢厂适合哪种牌号、规格、交期和市场。',
    actions: '<button class="button button--primary" data-action="open-supplier-dialog">新增供应商</button>'
  })}
  <section class="supplier-grid">
    ${state.suppliers.map(item => `<article class="supplier-card">
      <header><div><p>${escapeHtml(item.type)} · ${escapeHtml(item.region)}</p><h2>${escapeHtml(item.name)}</h2></div>${statusBadge(item.status)}</header>
      <dl><div><dt>优势牌号</dt><dd>${escapeHtml(item.grades)}</dd></div><div><dt>供应形态</dt><dd>${escapeHtml(item.forms)}</dd></div><div><dt>MOQ</dt><dd>${escapeHtml(item.moq)}</dd></div><div><dt>典型交期</dt><dd>${escapeHtml(item.leadTime)}</dd></div></dl>
      <p>${escapeHtml(item.strengths)}</p><footer><span>综合记录</span><strong>${'◆'.repeat(item.rating)}${'◇'.repeat(Math.max(0, 5 - item.rating))}</strong></footer>
    </article>`).join('')}
  </section>
  ${dialog('supplier-dialog', '新增钢厂或服务中心', `<form id="supplier-form" class="form-grid">
    ${formField({ id: 'name', label: '名称', required: true })}
    ${choiceField({ id: 'type', label: '类型', options: storedChoiceOptions('supplier-types', SUPPLIER_TYPE_OPTIONS), selected: '钢厂', required: true, storageKey: 'supplier-types', customLabel: '新增供应商类型' })}
    ${choiceField({ id: 'region', label: '地区', options: storedChoiceOptions('supplier-regions', REGION_OPTIONS), required: true, storageKey: 'supplier-regions', customLabel: '新增地区' })}
    ${choiceField({ id: 'grades', label: '优势牌号', options: grades, multiple: true, required: true, storageKey: 'stainless-grades', customLabel: '新增牌号', help: '牌号超过 20 项，可直接搜索。' })}
    ${choiceField({ id: 'forms', label: '供应形态', options: storedChoiceOptions('supplier-forms', PRODUCT_FORM_OPTIONS), multiple: true, storageKey: 'supplier-forms', customLabel: '新增供应形态' })}
    ${formField({ id: 'moq', label: 'MOQ', placeholder: '20 MT' })}
    ${formField({ id: 'leadTime', label: '典型交期', placeholder: '25–35 天' })}
    ${textareaField({ id: 'strengths', label: '优势与注意事项' })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="supplier-form" value="default">保存供应商</button>')}`;
}
