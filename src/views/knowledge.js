import { pageHeader } from '../ui/components.js';
import { gradeKnowledge } from '../domain/seed.js';
import { escapeHtml } from '../core/format.js';

export function renderKnowledge() {
  return `${pageHeader({
    eyebrow: 'KNOWLEDGE / 400 SERIES', title: '400 系销售知识库',
    description: '知识按应用和客户类型组织，避免把 400 系当作一个统一商品销售。'
  })}
  <section class="knowledge-index">
    ${gradeKnowledge.map((item, index) => `<article class="knowledge-card">
      <header><span>${String(index + 1).padStart(2, '0')}</span><div><p>${escapeHtml(item.grades)}</p><h2>${escapeHtml(item.family)}</h2></div></header>
      <div class="knowledge-card__grid"><div><h3>供应形态</h3><p>${escapeHtml(item.forms)}</p></div><div><h3>典型应用</h3><p>${escapeHtml(item.applications)}</p></div><div><h3>目标客户</h3><p>${escapeHtml(item.buyers)}</p></div><div><h3>优先市场</h3><p>${escapeHtml(item.regions)}</p></div></div>
      <footer><strong>RFQ 检查</strong>${item.checkpoints.map(check => `<span>${escapeHtml(check)}</span>`).join('')}</footer>
    </article>`).join('')}
  </section>`;
}
