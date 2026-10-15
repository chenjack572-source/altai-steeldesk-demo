import { choiceField, dialog, formField, pageHeader, selectField, statusBadge, textareaField } from '../ui/components.js';
import { escapeHtml, formatDate } from '../core/format.js';
import { COUNTRY_OPTIONS, GRADE_OPTIONS, INDUSTRY_OPTIONS } from '../domain/form-options.js';
import { storedChoiceOptions } from '../services/content-options.js';

export function renderCrm(state, query = '') {
  const needle = query.trim().toLowerCase();
  const companies = state.companies.filter(item => !needle || [item.name, item.country, item.segment, item.likelyGrades].some(value => value?.toLowerCase().includes(needle)));
  const countries = storedChoiceOptions('company-countries', COUNTRY_OPTIONS);
  const industries = storedChoiceOptions('company-industries', INDUSTRY_OPTIONS);
  const grades = storedChoiceOptions('stainless-grades', GRADE_OPTIONS);
  return `${pageHeader({
    eyebrow: 'SALES / 客户资产', title: '客户与目标公司',
    description: '按行业、国家、可能牌号和下一步行动管理客户，而不是只保存一张通讯录。',
    actions: '<button class="button button--primary" data-action="open-company-dialog">新增公司</button>'
  })}
  <section class="toolbar" aria-label="客户筛选">
    <label class="search-field"><span>⌕</span><input type="search" id="crm-filter" value="${escapeHtml(query)}" placeholder="搜索公司、国家、行业或牌号" /></label>
    <div class="toolbar__summary">${companies.length} 家公司 · ${companies.filter(item => item.priority === 'A').length} 家 A 级</div>
  </section>
  <section class="table-shell">
    <table class="data-table">
      <thead><tr><th>公司</th><th>市场 / 行业</th><th>可能需求</th><th>阶段</th><th>评分</th><th>下一步</th></tr></thead>
      <tbody>${companies.map(company => `<tr>
        <td><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.city || '')}</small></td>
        <td>${escapeHtml(company.country)}<small>${escapeHtml(company.segment)}</small></td>
        <td>${escapeHtml(company.likelyGrades || '待确认')}</td>
        <td>${statusBadge(company.stage)}</td>
        <td class="numeric"><strong>${company.score || 0}</strong><small>${escapeHtml(company.priority || 'B')} 级</small></td>
        <td><span>${escapeHtml(company.nextAction || '待安排')}</span><small>${formatDate(company.nextActionAt)}</small></td>
      </tr>`).join('')}</tbody>
    </table>
  </section>
  ${dialog('company-dialog', '新增目标公司', `<form id="company-form" class="form-grid">
    ${formField({ id: 'name', label: '公司名称', required: true })}
    ${choiceField({ id: 'country', label: '国家', options: countries, required: true, storageKey: 'company-countries', customLabel: '新增国家 / 市场', help: '选项较多，可用中文、英文或国家代码搜索。' })}
    ${formField({ id: 'city', label: '城市' })}
    ${choiceField({ id: 'segment', label: '下游行业', options: industries, multiple: true, required: true, storageKey: 'company-industries', customLabel: '新增行业', help: '可选择多个行业；超过 20 项时自动提供搜索。' })}
    ${choiceField({ id: 'likelyGrades', label: '可能牌号', options: grades, multiple: true, storageKey: 'stainless-grades', customLabel: '新增牌号', help: '可按 430、J1L、1.4003 等关键词搜索。' })}
    ${selectField({ id: 'priority', label: '优先级', value: 'B', options: ['A', 'B', 'C'] })}
    ${formField({ id: 'website', label: '网站', type: 'url', placeholder: 'https://' })}
    ${formField({ id: 'nextAction', label: '下一步行动', placeholder: '确认采购负责人' })}
    ${textareaField({ id: 'notes', label: '备注' })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="company-form" value="default">保存公司</button>')}`;
}
