import { routes } from '../core/router.js';
import { escapeHtml } from '../core/format.js';
import { uiIcon } from './components.js';

const groupOrder = ['工作', '销售', '增长', '供应', '系统'];

export function renderShell(currentRoute, content, state) {
  const pending = state.approvals.filter(item => item.status === 'pending').length;
  const openTasks = state.tasks.filter(item => !item.completed).length;
  const groups = groupOrder.map(group => {
    const items = Object.entries(routes).filter(([, route]) => route.group === group);
    return `<section class="nav-group"><p>${escapeHtml(group)}</p>${items.map(([id, route]) => `
      <a href="#/${id}" class="nav-link ${currentRoute === id ? 'is-active' : ''}" ${currentRoute === id ? 'aria-current="page"' : ''}>
        <span class="nav-link__icon">${uiIcon(id)}</span><span>${escapeHtml(route.label)}</span>
        ${id === 'approvals' && pending ? `<strong>${pending}</strong>` : ''}
      </a>`).join('')}</section>`;
  }).join('');

  return `<div class="app-shell public-demo">
    <aside class="sidebar" id="sidebar">
      <div class="brand"><div class="brand__mark">A</div><div><strong>ALTAI</strong><span>STEELDESK</span></div></div>
      <div class="system-state"><span class="signal" aria-hidden="true"></span><div><strong>公开演示版</strong><small>示例数据 · 与正式版隔离</small></div></div>
      <nav aria-label="主要导航">${groups}</nav>
      <footer class="sidebar__footer"><a href="https://altai-stainless.netlify.app/en" target="_blank" rel="noreferrer">打开 Altai 官网 ${uiIcon('external')}</a><small>DEMO · 浏览器本地数据</small></footer>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <button class="icon-button mobile-only" data-action="toggle-sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="打开导航">${uiIcon('menu')}</button>
        <div class="command"><span aria-hidden="true">${uiIcon('search')}</span><input id="global-command" type="search" placeholder="搜索客户或历史报价…" aria-label="全局搜索" /><kbd>Ctrl K</kbd></div>
        <div class="topbar__status"><span>${openTasks} 项未完成</span><a href="#/approvals">${pending} 项待审批</a><button class="theme-button" data-action="cycle-theme" aria-label="切换主题">${uiIcon('theme')}</button></div>
      </header>
      <div class="demo-banner" role="status"><strong>公开演示版</strong><span>所有更改只保存在你当前的浏览器中，不会进入 Altai 的正式工作台。</span></div>
      <main id="main-content" class="main-content" tabindex="-1">${content}</main>
    </div>
    <div class="sidebar-scrim" data-action="toggle-sidebar" aria-hidden="true"></div>
    <div id="toast-region" class="toast-region" aria-live="polite"></div>
  </div>`;
}
