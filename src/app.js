import { store } from './core/store.js?v=0.25.0';
import { router } from './core/router.js';
import { events } from './core/events.js';
import { id, today } from './core/format.js';
import { APPROVAL_TYPES, createApproval, reviewApproval } from './core/approval-policy.js';
import { calculateQuote } from './services/pricing.js';
import { exchangeRateProvider, fetchCnyRate } from './services/exchange-rates.js';
import { parseLineItems } from './services/quote-archive.js';
import { composeVariantCopy, composeVideoProductionPackage, createContentFromBrief, createVideoLaneContent, normalizeVisualPlan, parseAiVideoPlan, parseVisualPlan, videoShotProduction } from './services/content.js';
import { normalizeChoiceValues, VIDEO_CONTENT_LANES } from './services/content-options.js';
import { contentAssetFilename, downloadContentImage, renderContentImage } from './services/content-assets.js';
import { disconnectChatGpt, generateChatGptVideoPlan, getChatGptConnectionStatus, getChatGptModels, startChatGptAuthorization } from './services/chatgpt-auth.js';
import { fetchLatestMarketSnapshots, recognizeMarketSnapshot } from './services/market-data.js';
import { anomalyFor } from './services/market-review.js';
import { searchChoiceMatch } from './domain/form-options.js';
import { brandKit } from './domain/brand.js';
import { normalizeMarketOcrRows } from './domain/market-semantics.js?v=0.25.0';
import { renderShell } from './ui/shell.js?v=0.25.0';
import { renderDashboard } from './views/dashboard.js';
import { renderCrm } from './views/crm.js';
import { renderRfqs } from './views/rfqs.js';
import { renderPricing, renderQuoteResult } from './views/pricing.js';
import { renderContent } from './views/content.js';
import { renderApprovals } from './views/approvals.js';
import { renderSuppliers } from './views/suppliers.js';
import { renderMarket } from './views/market-v2.js?v=0.25.0';
import { renderKnowledge } from './views/knowledge.js';
import { renderIntegrations } from './views/integrations.js';
import { renderSettings } from './views/settings.js';

const app = document.querySelector('#app');
const PUBLIC_DEMO = true;
let state = {};
let crmQuery = '';
let quoteQuery = '';
let quoteEditId = '';
let quoteDeleteId = '';
let fxRequestId = 0;
let contentSelectionId = 'content_430';
let contentVariantId = 'variant_430_linkedin';
let contentVisualIndex = 0;
let approvalFilter = 'all';
let marketReviewSnapshotId = '';
let marketFilters = { material: '', origin: '', specification: '', source: '', session: '', unit: 'CNY/MT' };
const marketOpenFolders = new Set();
let marketSelectedSeriesKey = '';

const views = {
  dashboard: () => renderDashboard(state),
  crm: () => renderCrm(state, crmQuery),
  rfqs: () => renderRfqs(state),
  pricing: () => renderPricing(state, undefined, quoteQuery, quoteEditId, quoteDeleteId),
  content: () => renderContent(state, contentSelectionId, contentVariantId, contentVisualIndex),
  approvals: () => renderApprovals(state, approvalFilter),
  suppliers: () => renderSuppliers(state),
  market: () => renderMarket(state, marketReviewSnapshotId, marketFilters, marketOpenFolders, marketSelectedSeriesKey),
  knowledge: () => renderKnowledge(state),
  integrations: () => renderIntegrations(state),
  settings: () => renderSettings(state)
};

function commitRender() {
  if (!state.settings) return;
  const view = views[router.current] || views.dashboard;
  app.innerHTML = renderShell(router.current, view(), state);
  document.title = `${router.current === 'dashboard' ? '今日工作台' : document.querySelector('h1')?.textContent || 'SteelDesk'} · Altai SteelDesk`;
  bindPageEvents();
}

function render({ transition = false } = {}) {
  if (!state.settings) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (transition && !reduceMotion && document.startViewTransition && app.childElementCount) {
    document.startViewTransition(commitRender);
    return;
  }
  commitRender();
}

function toast(message, tone = 'success') {
  const region = document.querySelector('#toast-region');
  if (!region) return;
  const element = document.createElement('div');
  element.className = `toast toast--${tone}`;
  element.textContent = message;
  region.append(element);
  setTimeout(() => element.remove(), 3200);
}

function openDialog(dialogId) {
  const element = document.querySelector(`#${dialogId}`);
  if (element instanceof HTMLDialogElement) element.showModal();
}

function closeDialog(target) {
  target.closest('dialog')?.close();
}

function positionChoicePanel(panel) {
  const group = panel.closest('[data-choice-group]');
  const trigger = group?.querySelector('.multi-select__trigger');
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const gutter = 8;
  const gap = 4;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const width = Math.min(Math.max(rect.width, 260), viewportWidth - (gutter * 2));
  const below = viewportHeight - rect.bottom - gutter;
  const above = rect.top - gutter;
  const desiredHeight = Math.min(panel.scrollHeight || 420, 420);
  const openAbove = below < Math.min(desiredHeight, 260) && above > below;
  const availableHeight = Math.max(160, (openAbove ? above : below) - gap);
  const maxHeight = Math.min(420, availableHeight);
  const renderedHeight = Math.min(panel.scrollHeight || maxHeight, maxHeight);
  const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, viewportWidth - width - gutter));
  const top = openAbove
    ? Math.max(gutter, rect.top - gap - renderedHeight)
    : Math.min(viewportHeight - gutter - renderedHeight, rect.bottom + gap);

  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
  panel.style.width = `${Math.round(width)}px`;
  panel.style.maxHeight = `${Math.round(maxHeight)}px`;
}

function closeSingleChoice(group) {
  if (group?.dataset.choiceMode !== 'single') return;
  const panel = group.querySelector('[data-choice-panel]');
  if (panel?.matches(':popover-open')) panel.hidePopover();
  group.querySelector('.multi-select__trigger')?.focus();
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function syncChoiceSummary(groupElement) {
  const selected = [...groupElement.querySelectorAll('.multi-select__options input:checked')];
  const values = selected.map(input => input.value);
  const labels = selected.map(input => input.closest('label')?.querySelector('span')?.textContent || input.value);
  const summary = groupElement.querySelector('[data-choice-summary]');
  const multiple = groupElement.dataset.choiceMode !== 'single';
  if (summary) summary.textContent = values.length ? `${labels.join('、')}${multiple ? ` · ${values.length} 项` : ''}` : `请选择${multiple ? '（可单选或多选）' : ''}`;
  const field = groupElement.closest('[data-choice-field]');
  field?.classList.toggle('is-invalid', groupElement.dataset.choiceRequired === 'true' && !values.length);
  const error = field?.querySelector('[data-choice-error]');
  if (error && values.length) error.hidden = true;
  return values;
}

function validateChoiceGroup(form, group) {
  const element = form.querySelector(`[data-choice-group="${group}"]`);
  const values = element ? syncChoiceSummary(element) : [];
  const required = element?.dataset.choiceRequired === 'true';
  const field = element?.closest('[data-choice-field]');
  const error = field?.querySelector('[data-choice-error]');
  if (error) error.hidden = !required || Boolean(values.length);
  if (required && !values.length) element?.querySelector('.multi-select__trigger')?.focus();
  return values;
}

function rememberCustomChoice(details, value) {
  const storageKey = `steeldesk:choice-${details.dataset.choiceStorage || details.dataset.choiceGroup}`;
  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify(normalizeChoiceValues([...(Array.isArray(existing) ? existing : []), value])));
  } catch {
    localStorage.setItem(storageKey, JSON.stringify([value]));
  }
}

function addContentChoice(group) {
  const details = document.querySelector(`[data-choice-group="${group}"]`);
  const input = details?.querySelector(`#${group}Custom`);
  const value = String(input?.value || '').trim();
  if (!details || !input || !value) {
    input?.focus();
    return;
  }
  const existing = [...details.querySelectorAll('.multi-select__options input')].find(option => option.value.toLowerCase() === value.toLowerCase());
  if (existing) {
    existing.checked = true;
  } else {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const text = document.createElement('span');
    checkbox.type = details.dataset.choiceMode === 'single' ? 'radio' : 'checkbox';
    checkbox.name = `${group}Option`;
    checkbox.value = value;
    checkbox.checked = true;
    text.textContent = value;
    label.dataset.choiceOption = '';
    label.dataset.search = value;
    label.append(checkbox, text);
    details.querySelector('[data-choice-empty]')?.before(label);
    rememberCustomChoice(details, value);
  }
  input.value = '';
  syncChoiceSummary(details);
  if (details.dataset.choiceMode === 'single') closeSingleChoice(details);
  else input.focus();
}

function filterChoiceOptions(searchInput) {
  const details = searchInput.closest('[data-choice-group]');
  if (!details) return;
  let visible = 0;
  for (const option of details.querySelectorAll('[data-choice-option]')) {
    const matches = searchChoiceMatch(searchInput.value, option.dataset.search || option.textContent);
    option.hidden = !matches;
    if (matches) visible += 1;
  }
  const empty = details.querySelector('[data-choice-empty]');
  if (empty) empty.hidden = visible > 0;
}

function bindPageEvents() {
  const globalCommand = document.querySelector('#global-command');
  globalCommand?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = event.target.value.trim();
    if (!query) return;
    const normalized = query.toLowerCase();
    const hasQuoteMatch = state.quotes.some(item => [
      item.customer, item.supplier, item.reference,
      ...(item.lineItems || []).flatMap(line => [line.product, line.grade, line.specification])
    ].filter(Boolean).join(' ').toLowerCase().includes(normalized));
    if (hasQuoteMatch) {
      quoteQuery = query;
      if (router.current === 'pricing') render();
      else router.go('pricing');
      return;
    }
    crmQuery = query;
    if (router.current === 'crm') render();
    else router.go('crm');
  });

  const crmFilter = document.querySelector('#crm-filter');
  crmFilter?.addEventListener('input', event => {
    crmQuery = event.target.value;
    const selectionStart = event.target.selectionStart;
    render();
    const next = document.querySelector('#crm-filter');
    next?.focus();
    next?.setSelectionRange(selectionStart, selectionStart);
  });

  const quoteFilter = document.querySelector('#quote-history-filter');
  quoteFilter?.addEventListener('input', event => {
    quoteQuery = event.target.value;
    const selectionStart = event.target.selectionStart;
    render();
    const next = document.querySelector('#quote-history-filter');
    next?.focus();
    next?.setSelectionRange(selectionStart, selectionStart);
  });

  const themeSelect = document.querySelector('#theme-setting');
  themeSelect?.addEventListener('change', event => setTheme(event.target.value));

  const aiSettingsForm = document.querySelector('#ai-settings-form');
  aiSettingsForm?.addEventListener('submit', saveAiSettings);
  aiSettingsForm?.elements.aiEnabled?.addEventListener('change', () => syncAiSettingsVisibility(aiSettingsForm));
  if (router.current === 'settings') void syncChatGptConnectionStatus();

  const pricingForm = document.querySelector('#pricing-form');
  pricingForm?.addEventListener('input', event => {
    if (event.target.name === 'currency') {
      syncQuoteCurrency(pricingForm);
      void refreshQuoteRate(pricingForm);
    }
    if (event.target.name === 'fxRate') markRateAsManual(pricingForm);
    updateQuotePreview(pricingForm);
  });
  pricingForm?.addEventListener('submit', saveQuote);
  if (pricingForm) void refreshQuoteRate(pricingForm, { silent: true });

  document.querySelector('#task-form')?.addEventListener('submit', saveTask);
  document.querySelector('#company-form')?.addEventListener('submit', saveCompany);
  document.querySelector('#rfq-form')?.addEventListener('submit', saveRfq);
  document.querySelector('#content-form')?.addEventListener('submit', saveContent);
  for (const input of document.querySelectorAll('.multi-select__custom input')) {
    input.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      addContentChoice(input.closest('[data-choice-group]')?.dataset.choiceGroup);
    });
  }
  document.querySelector('#variant-form')?.addEventListener('submit', saveContentVariant);
  document.querySelector('#supplier-form')?.addEventListener('submit', saveSupplier);
  document.querySelector('#quote-edit-form')?.addEventListener('submit', saveQuoteRecordEdits);
  document.querySelector('#market-review-form')?.addEventListener('submit', saveMarketReview);
  const marketFilterForm = document.querySelector('#market-filter-form');
  marketFilterForm?.addEventListener('change', () => {
    marketFilters = { ...marketFilters, ...formObject(marketFilterForm) };
    marketSelectedSeriesKey = '';
    render();
  });
  document.querySelector('#import-data')?.addEventListener('change', importData);
}

function setTheme(theme) {
  localStorage.setItem('steeldesk:theme', theme);
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  toast(`主题已切换为${theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'}。`);
}

function syncAiSettingsVisibility(form) {
  const enabled = Boolean(form?.elements.aiEnabled?.checked);
  const config = form?.querySelector('[data-ai-config]');
  if (config) config.hidden = !enabled;
  const stateLabel = form?.querySelector('.ai-master-control > b');
  if (stateLabel) stateLabel.textContent = enabled ? 'ON' : 'OFF';
}

async function saveAiSettings(event) {
  event.preventDefault();
  const form = event.target;
  const current = store.get('settings', 'app');
  if (!current) return;
  const aiEnabled = Boolean(form.elements.aiEnabled.checked);
  const aiProvider = form.elements['ai-provider']?.value || 'none';
  const aiFeatureScopes = [...form.querySelectorAll('input[name="aiFeatureScopes"]:checked')].map(input => input.value);
  await store.save('settings', {
    ...current,
    aiEnabled,
    aiProvider,
    aiFeatureScopes,
    aiExecutionMode: 'manual',
    aiConnectionStatus: current.aiConnectionStatus === 'connected' && current.aiProvider === aiProvider ? 'connected' : 'not_configured'
  });
  toast(aiEnabled
    ? aiProvider === 'chatgpt_signin'
      ? '已选择 ChatGPT 账号授权。请点击“Continue with ChatGPT”完成连接。'
      : '已允许 AI 辅助；模型尚未连接，因此不会产生调用或费用。'
    : 'AI 辅助已关闭。');
}

function sameValue(left, right) {
  return (left ?? null) === (right ?? null);
}

async function syncChatGptConnectionStatus({ notify = false } = {}) {
  if (PUBLIC_DEMO) return;
  const current = store.get('settings', 'app');
  if (!current || (current.aiProvider !== 'chatgpt_signin' && current.aiConnectionStatus !== 'connected')) return;
  try {
    const status = await getChatGptConnectionStatus();
    const remoteState = status.state || 'not_configured';
    const staleNetworkError = status.network?.route === 'proxy' && /无法访问 OpenAI|检查可用网络|VPN/.test(current.aiConnectionMessage || '');
    const keepLocalError = current.aiConnectionStatus === 'error' && remoteState === 'not_configured' && !staleNetworkError;
    const patch = {
      aiConnectionStatus: keepLocalError ? 'error' : remoteState,
      aiConnectionAccount: status.account?.email || status.account?.name || '',
      aiConnectionMessage: status.connected
        ? 'ChatGPT 计划使用权限已连接。'
        : keepLocalError
          ? current.aiConnectionMessage
          : '尚未连接 ChatGPT 账号。',
      aiConnectionUpdatedAt: status.savedAt || null,
      aiNetworkRoute: status.network?.route || current.aiNetworkRoute || 'unknown',
      aiNetworkSource: status.network?.source || current.aiNetworkSource || '',
      aiNetworkProxy: status.network?.proxy || current.aiNetworkProxy || ''
    };
    if (Object.entries(patch).some(([key, value]) => !sameValue(current[key], value))) {
      await store.save('settings', { ...current, ...patch });
    }
    if (notify) toast(status.connected ? 'ChatGPT 账号连接可用。' : '尚未连接 ChatGPT 账号。', status.connected ? 'success' : 'warning');
  } catch (error) {
    if (notify) toast(error.message || '无法读取 ChatGPT 连接状态。', 'danger');
  }
}

function showChatGptPopupMessage(popup, { title, message, tone = 'progress' }) {
  if (!popup || popup.closed) return;
  const document = popup.document;
  document.title = title;
  document.body.replaceChildren();
  document.body.style.cssText = 'margin:0;min-height:100vh;display:grid;place-items:center;background:#0d171d;color:#f4f7f8;font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:28px;box-sizing:border-box';
  const card = document.createElement('main');
  card.style.cssText = `width:min(100%,480px);border:1px solid ${tone === 'error' ? '#d85a5a' : '#70818b'};background:#132129;padding:28px;box-sizing:border-box`;
  const eyebrow = document.createElement('p');
  eyebrow.textContent = tone === 'error' ? 'CONNECTION BLOCKED' : 'SECURE AUTHORIZATION';
  eyebrow.style.cssText = `margin:0 0 8px;color:${tone === 'error' ? '#ff9a91' : '#b7ff32'};font:700 12px/1.2 ui-monospace,monospace;letter-spacing:.12em`;
  const heading = document.createElement('h1');
  heading.textContent = title;
  heading.style.cssText = 'margin:0;font-size:26px;line-height:1.2';
  const detail = document.createElement('p');
  detail.textContent = message;
  detail.style.cssText = 'margin:14px 0 0;color:#c4d0d5';
  card.append(eyebrow, heading, detail);
  if (tone === 'error') {
    const hint = document.createElement('p');
    hint.textContent = '请检查当前网络或 VPN，然后返回 SteelDesk 点击“重新尝试连接”。';
    hint.style.cssText = 'margin:10px 0 0;color:#93a5ae;font-size:14px';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '关闭此页';
    close.style.cssText = 'margin-top:22px;border:0;background:#b7ff32;color:#0d171d;padding:11px 16px;font-weight:800;cursor:pointer';
    close.addEventListener('click', () => popup.close());
    card.append(hint, close);
  }
  document.body.append(card);
}

async function connectChatGpt() {
  if (PUBLIC_DEMO) {
    toast('公开演示版不连接任何人的 ChatGPT 账号。', 'warning');
    return;
  }
  const current = store.get('settings', 'app');
  if (!current) return;
  const popup = window.open('', 'steeldesk-chatgpt-auth', 'popup,width=560,height=760');
  showChatGptPopupMessage(popup, {
    title: '正在连接 ChatGPT',
    message: '工作台正在检查 OpenAI 授权服务，通过后会自动进入账号登录。'
  });
  await store.save('settings', {
    ...current,
    aiEnabled: true,
    aiProvider: 'chatgpt_signin',
    aiConnectionStatus: 'authorizing',
    aiConnectionMessage: '请在打开的浏览器页面中登录 ChatGPT 并确认权限。'
  });
  try {
    const { authorizeUrl } = await startChatGptAuthorization();
    if (popup) popup.location.assign(authorizeUrl);
    else location.assign(authorizeUrl);
    toast('已打开 ChatGPT 授权页面。');
  } catch (error) {
    const route = error.network?.route === 'proxy' ? `代理 ${error.network.proxy || error.network.source || ''}`.trim() : error.network?.route === 'direct' ? '直连' : '';
    const message = `${error.message || '无法启动 ChatGPT 授权。'}${route ? ` 当前路由：${route}。` : ''}`;
    showChatGptPopupMessage(popup, { title: '暂时无法打开授权页', message, tone: 'error' });
    const latest = store.get('settings', 'app');
    await store.save('settings', {
      ...latest,
      aiConnectionStatus: 'error',
      aiConnectionMessage: `${message} 已保留本次错误，修复网络后可直接重试。`,
      aiNetworkRoute: error.network?.route || latest.aiNetworkRoute || 'unknown',
      aiNetworkSource: error.network?.source || latest.aiNetworkSource || '',
      aiNetworkProxy: error.network?.proxy || latest.aiNetworkProxy || ''
    });
    toast(message, 'danger');
  }
}

let marketSyncPromise;

async function syncMarketSnapshots({ notify = false } = {}) {
  if (PUBLIC_DEMO) {
    if (notify) toast('公开演示版不连接正式行情数据源。', 'warning');
    return null;
  }
  if (marketSyncPromise) return marketSyncPromise;
  marketSyncPromise = (async () => {
    try {
      const result = await fetchLatestMarketSnapshots();
      const snapshots = Array.isArray(result.snapshots) ? result.snapshots : [];
      const incomingPrices = Array.isArray(result.prices) ? result.prices : [];
      if (snapshots.length) await store.saveMany('marketSnapshots', snapshots);
      const newPrices = incomingPrices.filter(item => item?.id && !store.get('marketPrices', item.id));
      if (newPrices.length) await store.saveMany('marketPrices', newPrices);
      if (notify) {
        const failedSources = (result.sources || []).filter(item => item.status === 'error');
        const sourceSummary = (result.sources || []).filter(item => item.status === 'ok').map(item => `${item.label} ${item.count} 份`).join('、');
        const message = snapshots.length
          ? `已同步 ${sourceSummary || `${snapshots.length} 份行情来源`}${newPrices.length ? `；新增 ${newPrices.length} 条 Mysteel 待复核价格` : ''}${failedSources.length ? `；${failedSources.map(item => `${item.label}暂不可用`).join('、')}` : ''}。`
          : '行情来源暂时没有新记录。';
        toast(message, failedSources.length || !snapshots.length ? 'warning' : 'success');
      }
      return snapshots;
    } catch (error) {
      if (notify) toast(error.message || '行情同步失败。', 'danger');
      return [];
    }
  })().finally(() => { marketSyncPromise = null; });
  return marketSyncPromise;
}

async function runMarketRecognition(snapshotId, trigger) {
  const existing = state.marketPrices.filter(item => item.snapshotId === snapshotId);
  if (existing.some(item => item.reviewStatus === 'verified')) {
    toast('这份原图已有人工确认数据，为保护历史行情，系统不会覆盖。', 'warning');
    return;
  }
  const originalLabel = trigger?.textContent;
  if (trigger) {
    trigger.disabled = true;
    trigger.setAttribute('aria-busy', 'true');
    trigger.textContent = '本机识别中…';
  }
  toast('正在裁切中央价格表并执行两次本地 OCR，长图可能需要约 1 分钟。');
  try {
    const result = await recognizeMarketSnapshot(snapshotId);
    const rows = normalizeMarketOcrRows(result.rows || []).map(row => ({ ...row, recognizerVersion: 'structure-v4' }));
    for (const item of existing) await store.remove('marketPrices', item.id);
    if (rows.length) await store.saveMany('marketPrices', rows);
    marketReviewSnapshotId = snapshotId;
    render();
    openDialog('market-review-dialog');
    toast(`识别出 ${rows.length} 条价格候选，请逐项对照原图。`, rows.length ? 'warning' : 'danger');
  } catch (error) {
    toast(error.message || '本地 OCR 失败。', 'danger');
    if (trigger?.isConnected) {
      trigger.disabled = false;
      trigger.removeAttribute('aria-busy');
      trigger.textContent = originalLabel;
    }
  }
}

async function saveMarketReview(event) {
  event.preventDefault();
  const form = event.target;
  const action = event.submitter?.value || 'draft';
  const verify = action === 'verify';
  if (verify && !form.elements.confirmSource?.checked) {
    form.elements.confirmSource?.focus();
    toast('确认加入行情前，必须勾选“我已逐项对照原图”。', 'warning');
    return;
  }
  const currentVerified = state.marketPrices.filter(item => item.reviewStatus === 'verified');
  const updates = [];
  for (const rowElement of form.querySelectorAll('[data-price-row]')) {
    const existing = store.get('marketPrices', rowElement.dataset.priceId);
    if (!existing) continue;
    const value = field => rowElement.querySelector(`[data-field="${field}"]`)?.value?.trim() || '';
    const included = rowElement.querySelector('[data-field="include"]')?.checked;
    const normalizedPrice = Number(value('normalizedPrice'));
    if (verify && included && (!value('material') || !value('company') || !value('thirdColumnRaw') || !value('productForm') || !value('unit') || !Number.isFinite(normalizedPrice) || normalizedPrice <= 0)) {
      rowElement.classList.add('has-error');
      rowElement.querySelector('input:invalid, select:invalid, input[data-field="material"], input[data-field="company"], input[data-field="thirdColumnRaw"], input[data-field="productForm"]')?.focus();
      toast('请补齐所有保留行的产品型号、公司名称、第三列原文、产品形态、单位和有效价格。产地可以为空。', 'warning');
      return;
    }
    const draft = {
      ...existing,
      material: value('material'), thirdColumnRaw: value('thirdColumnRaw'), origin: value('origin'), quoteBasis: value('quoteBasis'), specification: value('specification'), productForm: value('productForm'), company: value('company'),
      unit: value('unit'), currency: value('unit').startsWith('CNY') ? 'CNY' : existing.currency,
      normalizedPrice: Number.isFinite(normalizedPrice) ? normalizedPrice : existing.normalizedPrice,
      reviewStatus: included ? (verify ? 'verified' : 'needs_review') : 'rejected',
      reviewedAt: verify && included ? new Date().toISOString() : existing.reviewedAt || null,
      verifiedBy: verify && included ? 'local-user' : existing.verifiedBy || null
    };
    const anomaly = included ? anomalyFor(draft, currentVerified.filter(item => item.id !== draft.id)) : { score: 0, reasons: [] };
    draft.anomalyScore = anomaly.score;
    draft.anomalyReasons = [...new Set([...(existing.anomalyReasons || []).filter(reason => !reason.startsWith('较上一条') && !reason.startsWith('偏离近')), ...anomaly.reasons])];
    updates.push(draft);
  }
  if (!updates.length) {
    toast('没有可保存的识别行。', 'warning');
    return;
  }
  marketReviewSnapshotId = '';
  await store.saveMany('marketPrices', updates);
  toast(verify ? `已人工确认 ${updates.filter(item => item.reviewStatus === 'verified').length} 条，价格曲线已更新。` : '已保存为待复核；这些数据仍不会进入价格曲线。', verify ? 'success' : 'warning');
}

async function finishChatGptAuthorization(result) {
  await syncChatGptConnectionStatus();
  const latest = store.get('settings', 'app');
  if (result?.success) {
    if (latest && latest.aiConnectionStatus !== 'connected') {
      await store.save('settings', { ...latest, aiConnectionStatus: 'connected', aiConnectionMessage: result.message || 'ChatGPT 账号已连接。' });
    }
    toast('ChatGPT 账号已连接。');
  } else {
    if (latest) await store.save('settings', { ...latest, aiConnectionStatus: 'error', aiConnectionMessage: result?.message || '授权未完成。' });
    toast(result?.message || 'ChatGPT 授权未完成。', 'warning');
  }
}

async function disconnectChatGptAccount() {
  if (!confirm('确定断开 ChatGPT 账号吗？断开后，SteelDesk 将停止使用此账号的计划额度。')) return;
  try {
    const result = await disconnectChatGpt();
    const current = store.get('settings', 'app');
    await store.save('settings', {
      ...current,
      aiConnectionStatus: 'signed_out',
      aiConnectionAccount: '',
      aiConnectionModelCount: 0,
      aiConnectionMessage: result.revocationConfirmed ? 'ChatGPT 账号已断开。' : '本机凭据已清除；远程撤销未能确认，可在 ChatGPT 设置中检查。'
    });
    toast(result.revocationConfirmed ? 'ChatGPT 账号已安全断开。' : '本机连接已清除，远程撤销未确认。', result.revocationConfirmed ? 'success' : 'warning');
  } catch (error) {
    toast(error.message || '断开 ChatGPT 账号失败。', 'danger');
  }
}

async function testAiConnection() {
  if (PUBLIC_DEMO) {
    toast('公开演示版已关闭 AI 账号连接。', 'warning');
    return;
  }
  const settings = store.get('settings', 'app');
  if (!settings?.aiEnabled) {
    toast('请先打开“允许工作台使用 AI 辅助”并保存。', 'warning');
    return;
  }
  if (settings.aiProvider === 'chatgpt_signin') {
    try {
      const { models } = await getChatGptModels();
      await store.save('settings', { ...settings, aiConnectionStatus: 'connected', aiConnectionModelCount: models.length, aiConnectionMessage: 'ChatGPT 账号连接可用。' });
      toast(`连接正常，当前账号可用模型 ${models.length} 个。`);
    } catch (error) {
      toast(error.message || 'ChatGPT 连接测试失败。', 'danger');
    }
    return;
  }
  if (settings.aiConnectionStatus !== 'connected') {
    toast('尚未配置模型连接。当前不会调用 API，也不会产生费用。', 'warning');
    return;
  }
  toast('模型连接可用。');
}

function cycleTheme() {
  const current = localStorage.getItem('steeldesk:theme') || 'system';
  const next = current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system';
  setTheme(next);
}

async function saveTask(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  await store.save('tasks', {
    id: id('task'), title: data.title, group: data.group, priority: data.priority,
    dueDate: data.dueDate || today(), completed: false, createdAt: new Date().toISOString()
  });
  closeDialog(event.target);
  toast('任务已保存。');
}

async function saveCompany(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const country = validateChoiceGroup(event.target, 'country');
  const segments = validateChoiceGroup(event.target, 'segment');
  const grades = validateChoiceGroup(event.target, 'likelyGrades');
  if (!country.length || !segments.length) {
    toast('请选择国家和至少一个下游行业。', 'warning');
    return;
  }
  data.country = country[0];
  data.segment = segments.join('、');
  data.likelyGrades = grades.join(' / ');
  await store.save('companies', {
    ...data, id: id('company'), stage: 'research', score: data.priority === 'A' ? 75 : 50,
    source: '手动录入', nextActionAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString()
  });
  closeDialog(event.target);
  toast('目标公司已加入 CRM。');
}

function rfqCompleteness(data) {
  const keys = ['companyName', 'country', 'product', 'grade', 'standard', 'finish', 'thickness', 'width', 'quantityMt', 'incoterm', 'destination'];
  return Math.round((keys.filter(key => String(data[key] || '').trim()).length / keys.length) * 100);
}

async function saveRfq(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const choiceMap = {
    country: ['country', false], product: ['product', false], grade: ['grade', true],
    standard: ['standard', true], finish: ['finish', true], incoterm: ['incoterm', false]
  };
  for (const [field, [group, multiple]] of Object.entries(choiceMap)) {
    const values = validateChoiceGroup(event.target, group);
    data[field] = multiple ? values.join(' / ') : (values[0] || '');
  }
  if (!data.country || !data.product || !data.grade || !data.incoterm) {
    toast('请补齐国家、产品形态、牌号和贸易条款。', 'warning');
    return;
  }
  const completeness = rfqCompleteness(data);
  await store.save('rfqs', {
    ...data,
    id: id('rfq'), reference: `RFQ-${new Date().getFullYear()}-${String(state.rfqs.length + 1).padStart(3, '0')}`,
    companyId: '', quantityMt: Number(data.quantityMt || 0), completeness,
    status: completeness >= 85 ? 'mill_inquiry' : 'needs_info',
    dueAt: new Date(Date.now() + 2 * 86400000).toISOString(), createdAt: new Date().toISOString()
  });
  closeDialog(event.target);
  toast(completeness >= 85 ? 'RFQ 已保存，可以向钢厂询价。' : `RFQ 已保存，完整度 ${completeness}%。`, completeness >= 85 ? 'success' : 'warning');
}

async function saveContent(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const content = createContentFromBrief(data, id);
  contentSelectionId = content.id;
  contentVariantId = content.variants[0]?.id || '';
  await store.save('content', content);
  closeDialog(event.target);
  toast('短视频内容包已生成。受众、目标、结构和 CTA 已自动完成；请直接复核成品。');
}

async function saveContentVariant(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const content = store.get('content', data.contentId);
  if (!content) return;
  const existing = content.variants?.find(item => item.id === data.variantId);
  if (!existing) return;
  const parsedPlan = parseVisualPlan(data['variant-plan']);
  const updatedVariant = {
    ...existing,
    hook: data['variant-hook'], spec: data['variant-spec'], caption: data['variant-caption'],
    hashtags: data['variant-hashtags'], cta: data['variant-cta'], status: 'ready',
    visualPlan: normalizeVisualPlan(parsedPlan, existing.visualPlan)
  };
  const pendingApproval = state.approvals.find(item => item.entityType === 'content' && item.entityId === content.id && item.status === 'pending');
  if (pendingApproval) {
    await store.save('approvals', reviewApproval(pendingApproval, 'rejected', '内容版本修改后，原审批自动作废。'));
  }
  contentSelectionId = content.id;
  contentVariantId = updatedVariant.id;
  await store.save('content', { ...content, status: 'draft', variants: content.variants.map(item => item.id === updatedVariant.id ? updatedVariant : item) });
  closeDialog(event.target);
  toast('平台版本已保存。若原内容正在审批，旧审批已自动作废。');
}

async function copyTextValue(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

async function copyContentVariant(contentId, variantId) {
  const content = store.get('content', contentId);
  const variant = content?.variants?.find(item => item.id === variantId);
  if (!content || !variant) return;
  const copy = composeVariantCopy(content, variant);
  await copyTextValue(copy);
  toast(`${variant.platform} 完整文案和画面脚本已复制。`);
}

async function copyVideoShotPrompt(contentId, variantId, visualIndex) {
  const content = store.get('content', contentId);
  const variant = content?.variants?.find(item => item.id === variantId);
  const index = Number(visualIndex) || 0;
  const block = variant?.visualPlan?.[index];
  if (!content || !variant || !block) return;
  const shot = videoShotProduction(content, variant, block, index);
  await copyTextValue([`${shot.time} · ${shot.shot}`, `字幕：${shot.overlay}`, `口播：${shot.voiceover}`, `转场：${shot.transition}`, '', shot.prompt].join('\n'));
  toast(`第 ${index + 1} 镜的提示词已复制。`);
}

async function copyVideoPackage(contentId, variantId) {
  const content = store.get('content', contentId);
  const variant = content?.variants?.find(item => item.id === variantId);
  if (!content || !variant) return;
  await copyTextValue(composeVideoProductionPackage(content, variant));
  toast('整套短视频制作包已复制，包含口播、逐镜提示词、转场和执行备注。');
}

async function useVideoLane(laneId) {
  const lane = VIDEO_CONTENT_LANES.find(item => item.id === laneId);
  if (!lane) return;
  const existing = state.content.find(item => item.sourceLaneId === lane.id && item.status !== 'published');
  if (existing) {
    contentSelectionId = existing.id;
    contentVariantId = existing.variants?.[0]?.id || '';
    contentVisualIndex = 0;
    render();
    toast(`已打开《${lane.label}》现有方案，可继续编辑或用 AI 重写。`);
    return;
  }
  const content = createVideoLaneContent(lane, id);
  contentSelectionId = content.id;
  contentVariantId = content.variants[0]?.id || '';
  contentVisualIndex = 0;
  await store.save('content', content);
  toast(`已生成《${lane.label}》完整短视频方案；没有调用 AI，请直接复核和编辑。`);
}

async function aiBuildVideo(contentId, variantId, button) {
  if (PUBLIC_DEMO) {
    toast('公开演示版可编辑现有分镜，但不调用 AI 模型。', 'warning');
    return;
  }
  const content = store.get('content', contentId);
  const variant = content?.variants?.find(item => item.id === variantId);
  if (!content || !variant) return;
  const originalLabel = button?.textContent || 'AI 重写完整分镜';
  if (button) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = '正在分析事实与镜头…';
  }
  try {
    const result = await generateChatGptVideoPlan({
      title: content.title, pillar: content.pillar, objective: content.objective,
      audience: content.audience, language: variant.language, platform: variant.platform,
      format: content.videoFormat || variant.format, duration: variant.duration,
      tone: content.videoTone || '专业、克制', verifiedFacts: content.body,
      buyerDecision: content.buyerDecision, factBoundary: content.factNote, existingPlan: variant.visualPlan
    });
    const updatedVariant = parseAiVideoPlan(result.output, variant);
    const pendingApproval = state.approvals.find(item => item.entityType === 'content' && item.entityId === content.id && item.status === 'pending');
    if (pendingApproval) await store.save('approvals', reviewApproval(pendingApproval, 'rejected', 'AI 分镜重写后，原审批自动作废。'));
    await store.save('content', { ...content, status: 'draft', variants: content.variants.map(item => item.id === variantId ? updatedVariant : item) });
    contentVisualIndex = 0;
    toast(`AI 已用 ${result.modelName || result.model || '当前模型'} 重写分镜；请逐镜复核事实与画面。`);
  } catch (error) {
    const signedOut = /尚未连接|断开|授权/.test(error.message || '');
    toast(signedOut ? 'ChatGPT 尚未连接。现有行业分镜仍可直接编辑和复制；需要 AI 重写时请先在设置页连接。' : (error.message || 'AI 分镜生成失败，现有内容已保留。'), signedOut ? 'warning' : 'danger');
    if (button?.isConnected) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = originalLabel;
    }
  }
}

async function createContentImage(contentId, variantId, visualIndex) {
  const content = store.get('content', contentId);
  const variant = content?.variants?.find(item => item.id === variantId);
  if (!content || !variant) return null;
  const blob = await renderContentImage(content, variant, Number(visualIndex) || 0, brandKit.logo);
  return { content, variant, blob, filename: contentAssetFilename(content, variant, Number(visualIndex) || 0) };
}

async function copyContentImage(contentId, variantId, visualIndex) {
  let asset;
  try {
    asset = await createContentImage(contentId, variantId, visualIndex);
  } catch (error) {
    toast(`图片生成失败：${error.message}`, 'warning');
    return;
  }
  if (!asset) return;
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('image clipboard unavailable');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': asset.blob })]);
    toast(`${asset.variant.platform} 当前画面已复制为高清 PNG。`);
  } catch {
    downloadContentImage(asset.blob, asset.filename);
    toast('浏览器未开放图片剪贴板，已改为下载 PNG。', 'warning');
  }
}

async function downloadContentAsset(contentId, variantId, visualIndex) {
  try {
    const asset = await createContentImage(contentId, variantId, visualIndex);
    if (!asset) return;
    downloadContentImage(asset.blob, asset.filename);
    toast(`${asset.variant.platform} 当前画面已下载。`);
  } catch (error) {
    toast(`图片生成失败：${error.message}`, 'warning');
  }
}

async function saveSupplier(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const type = validateChoiceGroup(event.target, 'type');
  const region = validateChoiceGroup(event.target, 'region');
  const grades = validateChoiceGroup(event.target, 'grades');
  const forms = validateChoiceGroup(event.target, 'forms');
  if (!type.length || !region.length || !grades.length) {
    toast('请补齐供应商类型、地区和优势牌号。', 'warning');
    return;
  }
  data.type = type[0];
  data.region = region[0];
  data.grades = grades.join(' / ');
  data.forms = forms.join('、');
  await store.save('suppliers', { ...data, id: id('supplier'), status: 'review', rating: 3, createdAt: new Date().toISOString() });
  closeDialog(event.target);
  toast('供应商已保存为待复核。');
}

function quoteInput(form) {
  const data = formObject(form);
  const numericKeys = ['weightMt', 'materialPerMt', 'processingPerMt', 'freightPerMt', 'packagingTotal', 'fixedFees', 'financeRate', 'riskRate', 'marginRate', 'fxRate'];
  for (const key of numericKeys) data[key] = Number(data[key] || 0);
  data.currency = String(data.currency || 'USD').toUpperCase();
  if (data.currency === 'CNY') {
    data.fxRate = 1;
    data.fxSource = 'fixed';
    data.fxDate = '';
  }
  return data;
}

function syncQuoteCurrency(form) {
  const currency = String(form.elements.currency?.value || 'USD').toUpperCase();
  const rate = form.elements.fxRate;
  const label = form.querySelector('[data-fx-label]');
  const help = form.querySelector('[data-fx-help]');
  const refresh = form.querySelector('[data-action="refresh-fx"]');
  const date = form.elements.fxDate;
  const source = form.elements.fxSource;
  if (!rate) return;

  if (currency === 'CNY') {
    if (!rate.disabled && Number(rate.value) !== 1) rate.dataset.previousRate = rate.value;
    rate.value = '1';
    rate.disabled = true;
    rate.setAttribute('aria-disabled', 'true');
    if (date) date.value = '';
    if (source) source.value = 'fixed';
    if (refresh) refresh.hidden = true;
    if (label) label.textContent = '人民币报价无需换算';
    if (help) help.textContent = '报价币种已经是人民币，人民币参考金额与报价总额相同。';
    return;
  }

  if (rate.disabled) rate.value = rate.dataset.previousRate || '7.1';
  rate.disabled = false;
  rate.removeAttribute('aria-disabled');
  if (refresh) refresh.hidden = false;
  if (label) label.textContent = `人民币换算汇率（1 ${currency} = ? CNY）`;
  if (help) help.textContent = `正在获取 ${currency} 对人民币的最新日度汇率…`;
}

function markRateAsManual(form) {
  const currency = String(form.elements.currency?.value || 'USD').toUpperCase();
  if (currency === 'CNY') return;
  if (form.elements.fxSource) form.elements.fxSource.value = 'manual';
  if (form.elements.fxDate) form.elements.fxDate.value = '';
  const help = form.querySelector('[data-fx-help]');
  if (help) help.textContent = `当前为手动汇率：1 ${currency} = ${form.elements.fxRate.value || 0} CNY。可点击“刷新汇率”恢复最新日度数据。`;
}

async function refreshQuoteRate(form, { silent = false } = {}) {
  const currency = String(form.elements.currency?.value || 'USD').toUpperCase();
  if (currency === 'CNY') {
    syncQuoteCurrency(form);
    updateQuotePreview(form);
    return;
  }
  const requestId = ++fxRequestId;
  const help = form.querySelector('[data-fx-help]');
  if (help) help.textContent = `正在从 ${exchangeRateProvider.name} 获取 ${currency} 对人民币的最新日度汇率…`;
  try {
    const result = await fetchCnyRate(currency);
    if (requestId !== fxRequestId || !form.isConnected || form.elements.currency.value !== currency) return;
    form.elements.fxRate.value = String(result.rate);
    form.elements.fxRate.dataset.previousRate = String(result.rate);
    form.elements.fxDate.value = result.date || '';
    form.elements.fxSource.value = result.source;
    if (help) help.textContent = `${result.source === 'cache' ? '离线缓存' : '最新日度参考'}：1 ${currency} = ${result.rate} CNY · 数据日期 ${result.date || '未提供'}。可手动调整。`;
    updateQuotePreview(form);
    if (!silent && result.source === 'cache') toast('网络不可用，已使用上次缓存汇率。', 'warning');
  } catch (error) {
    if (requestId !== fxRequestId || !form.isConnected) return;
    form.elements.fxSource.value = 'manual';
    form.elements.fxDate.value = '';
    if (help) help.textContent = `自动汇率暂不可用，保留当前手动值。原因：${error.message}`;
    if (!silent) toast('未能更新汇率，当前数值仍可手动修改。', 'warning');
  }
}

function updateQuotePreview(form) {
  const input = quoteInput(form);
  const target = document.querySelector('#quote-result');
  if (!target) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderQuoteResult(calculateQuote(input), input);
  target.replaceWith(wrapper.firstElementChild);
}

async function saveQuote(event) {
  event.preventDefault();
  const input = quoteInput(event.target);
  const result = calculateQuote(input);
  const quoteId = id('quote');
  await store.save('quotes', {
    id: quoteId, reference: `Q-${new Date().getFullYear()}-${String(state.quotes.length + 1).padStart(3, '0')}`,
    status: 'pending_approval', input, result, createdAt: new Date().toISOString()
  });
  await store.save('approvals', createApproval({
    id: id('approval'), actionType: APPROVAL_TYPES.QUOTE, entityType: 'quote', entityId: quoteId,
    title: `正式报价 ${input.weightMt} MT`, summary: `${input.currency} ${result.quotePerMt.toFixed(2)} / MT，毛利率 ${(result.grossMargin * 100).toFixed(1)}%`,
    channel: '正式报价', recipient: '客户待选择'
  }));
  toast('报价已保存并进入审批中心。');
  router.go('approvals');
}

async function saveQuoteRecordEdits(event) {
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const data = formObject(event.target);
  const existing = store.get('quotes', data.quoteId);
  if (!existing) return;
  const recordType = data['edit-recordType'] === 'local' ? null : data['edit-recordType'];
  const currency = String(data['edit-currency'] || 'CNY').toUpperCase();
  const total = Number(data['edit-total'] || 0);
  const lineItems = parseLineItems(data['edit-lineItems']);
  const common = {
    ...existing,
    recordType,
    quoteDate: data['edit-quoteDate'], reference: data['edit-reference'], customer: data['edit-customer'], supplier: data['edit-supplier'],
    currency, total, taxIncluded: data['edit-taxIncluded'] === 'yes', taxRate: data['edit-taxRate'] === '' ? null : Number(data['edit-taxRate']),
    delivery: data['edit-delivery'], payment: data['edit-payment'], leadTime: data['edit-leadTime'], validity: data['edit-validity'],
    lineItems, itemSubtotal: lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    notes: String(data['edit-notes'] || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean)
  };
  if (!recordType) {
    const input = { ...existing.input, currency };
    const costBeforeMargin = Number(existing.result?.costBeforeMargin || 0);
    const grossProfit = total - costBeforeMargin;
    common.input = input;
    common.result = {
      ...existing.result, currency, quoteTotal: total,
      quotePerMt: Number(input.weightMt) ? total / Number(input.weightMt) : 0,
      grossProfit, grossMargin: total ? grossProfit / total : 0,
      localCurrencyTotal: currency === 'CNY' ? total : total * Number(input.fxRate || 0)
    };
  }
  quoteEditId = '';
  await store.save('quotes', common);
  toast('报价 / 合同记录已更新。');
}

async function deleteQuoteRecord() {
  const record = store.get('quotes', quoteDeleteId);
  if (!record) return;
  const linkedApprovals = state.approvals.filter(item => item.entityType === 'quote' && item.entityId === record.id);
  for (const approval of linkedApprovals) await store.remove('approvals', approval.id);
  const recordId = record.id;
  quoteDeleteId = '';
  await store.remove('quotes', recordId);
  toast('记录与对应审批已删除；原始附件文件仍保留。', 'warning');
}

async function submitContent(contentId) {
  const content = store.get('content', contentId);
  if (!content) return;
  if (!content.variants?.length) {
    toast('至少需要一个平台版本才能提交审批。', 'warning');
    return;
  }
  await store.save('content', { ...content, status: 'pending_approval' });
  await store.save('approvals', createApproval({
    id: id('approval'), actionType: APPROVAL_TYPES.CONTENT, entityType: 'content', entityId: content.id,
    title: `发布：${content.title}`, summary: `${content.variants.length} 个平台版本：${content.variants.map(item => `${item.platform} ${item.format}`).join('；')}`, channel: content.channels.join(', '), recipient: '公开账号'
  }));
  toast('内容已提交审批，不会自动发布。');
}

async function review(idValue, decision) {
  const approval = store.get('approvals', idValue);
  if (!approval) return;
  await store.save('approvals', reviewApproval(approval, decision, decision === 'rejected' ? '用户在工作台拒绝' : ''));
  if (approval.entityType === 'content') {
    const content = store.get('content', approval.entityId);
    if (content) await store.save('content', { ...content, status: decision === 'approved' ? 'approved' : 'draft' });
  }
  toast(decision === 'approved' ? '已批准。外部连接未配置，因此不会自动发送。' : '已拒绝并退回。', decision === 'approved' ? 'success' : 'warning');
}

async function toggleTask(taskId, checked) {
  const task = store.get('tasks', taskId);
  if (task) await store.save('tasks', { ...task, completed: checked, completedAt: checked ? new Date().toISOString() : null });
}

async function advanceRfq(rfqId) {
  const rfq = store.get('rfqs', rfqId);
  if (!rfq) return;
  const sequence = ['needs_info', 'mill_inquiry', 'quoted', 'won'];
  const next = sequence[Math.min(sequence.indexOf(rfq.status) + 1, sequence.length - 1)];
  await store.save('rfqs', { ...rfq, status: next });
  toast(`RFQ 状态已推进到 ${next}。`);
}

async function exportData() {
  const payload = await store.exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `altai-steeldesk-backup-${today()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast('备份文件已导出。');
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    await store.importAll(payload);
    toast('备份已导入。');
  } catch (error) {
    toast(error.message || '导入失败。', 'danger');
  } finally {
    event.target.value = '';
  }
}

async function resetToSeed() {
  await store.resetToSeed();
  closeDialog(document.querySelector('#reset-dialog'));
  toast('已恢复为初始示例数据。', 'warning');
}

app.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id: itemId } = target.dataset;
  if (action === 'toggle-sidebar') document.body.classList.toggle('sidebar-open');
  if (action === 'cycle-theme') cycleTheme();
  if (action === 'open-task-dialog' || action === 'open-quick-add') openDialog('task-dialog');
  if (action === 'open-company-dialog') openDialog('company-dialog');
  if (action === 'open-rfq-dialog') openDialog('rfq-dialog');
  if (action === 'open-content-dialog') openDialog('content-dialog');
  if (action === 'use-video-lane') await useVideoLane(target.dataset.laneId);
  if (action === 'add-content-choice') addContentChoice(target.dataset.choiceGroup);
  if (action === 'select-content') {
    contentSelectionId = itemId;
    contentVariantId = store.get('content', itemId)?.variants?.[0]?.id || '';
    contentVisualIndex = 0;
    render();
  }
  if (action === 'select-content-variant') {
    contentSelectionId = itemId;
    contentVariantId = target.dataset.variantId;
    contentVisualIndex = 0;
    render();
  }
  if (action === 'select-content-visual') {
    contentVisualIndex = Number(target.dataset.visualIndex) || 0;
    render();
  }
  if (action === 'edit-content-variant') {
    contentSelectionId = itemId;
    contentVariantId = target.dataset.variantId;
    render();
    openDialog('variant-dialog');
  }
  if (action === 'copy-content-variant') await copyContentVariant(itemId, target.dataset.variantId);
  if (action === 'copy-video-shot-prompt') await copyVideoShotPrompt(itemId, target.dataset.variantId, target.dataset.visualIndex);
  if (action === 'copy-video-package') await copyVideoPackage(itemId, target.dataset.variantId);
  if (action === 'ai-build-video') await aiBuildVideo(itemId, target.dataset.variantId, target);
  if (action === 'copy-content-image') await copyContentImage(itemId, target.dataset.variantId, target.dataset.visualIndex);
  if (action === 'download-content-image') await downloadContentAsset(itemId, target.dataset.variantId, target.dataset.visualIndex);
  if (action === 'open-platform-draft') {
    contentSelectionId = itemId;
    contentVariantId = target.dataset.variantId;
    render();
    openDialog('platform-draft-dialog');
  }
  if (action === 'open-integrations') {
    closeDialog(target);
    location.hash = '#/integrations';
  }
  if (action === 'open-supplier-dialog') openDialog('supplier-dialog');
  if (action === 'open-reset-dialog') openDialog('reset-dialog');
  if (action === 'open-ai-setup') openDialog('ai-setup-dialog');
  if (action === 'connect-chatgpt') await connectChatGpt();
  if (action === 'disconnect-chatgpt') await disconnectChatGptAccount();
  if (action === 'test-ai-connection') await testAiConnection();
  if (action === 'refresh-market') await syncMarketSnapshots({ notify: true });
  if (action === 'reset-market-filters') {
    marketFilters = { material: '', origin: '', specification: '', source: '', session: '', unit: marketFilters.unit || 'CNY/MT' };
    marketSelectedSeriesKey = '';
    render();
  }
  if (action === 'select-market-series') {
    marketSelectedSeriesKey = marketSelectedSeriesKey === target.dataset.seriesKey ? '' : target.dataset.seriesKey;
    render();
    requestAnimationFrame(() => [...document.querySelectorAll('button[data-action="select-market-series"]')].find(element => element.dataset.seriesKey === marketSelectedSeriesKey)?.focus({ preventScroll: true }));
  }
  if (action === 'clear-market-series') {
    const interactiveTarget = event.target.closest('a, button, input, select, textarea, summary');
    if (interactiveTarget && interactiveTarget !== target) return;
    if (!marketSelectedSeriesKey) return;
    marketSelectedSeriesKey = '';
    render();
  }
  if (action === 'recognize-market') await runMarketRecognition(itemId, target);
  if (action === 'open-market-review') {
    marketReviewSnapshotId = itemId;
    render();
    openDialog('market-review-dialog');
  }
  if (action === 'filter-approvals') {
    const requestedFilter = target.dataset.filter || 'all';
    approvalFilter = requestedFilter !== 'all' && approvalFilter === requestedFilter ? 'all' : requestedFilter;
    render();
    document.querySelector(`[data-action="filter-approvals"][data-filter="${approvalFilter}"]`)?.focus();
  }
  if (action === 'refresh-fx') {
    const form = target.closest('form');
    if (form) await refreshQuoteRate(form);
  }
  if (action === 'edit-quote-record') {
    quoteEditId = itemId;
    quoteDeleteId = '';
    render();
    openDialog('quote-edit-dialog');
  }
  if (action === 'delete-quote-record') {
    quoteDeleteId = itemId;
    quoteEditId = '';
    render();
    openDialog('quote-delete-dialog');
  }
  if (action === 'confirm-delete-quote') await deleteQuoteRecord();
  if (action === 'close-dialog' || target.value === 'cancel') closeDialog(target);
  if (action === 'approve-approval') await review(itemId, 'approved');
  if (action === 'reject-approval') await review(itemId, 'rejected');
  if (action === 'submit-content') await submitContent(itemId);
  if (action === 'advance-rfq') await advanceRfq(itemId);
  if (action === 'export-data') await exportData();
  if (action === 'confirm-reset') await resetToSeed();
});

app.addEventListener('change', async event => {
  const target = event.target;
  if (target.matches('[data-action="toggle-task"]')) await toggleTask(target.dataset.id, target.checked);
  if (target.matches('[data-choice-group] input[type="checkbox"]')) syncChoiceSummary(target.closest('[data-choice-group]'));
  if (target.matches('[data-choice-group] input[type="radio"]')) {
    const group = target.closest('[data-choice-group]');
    syncChoiceSummary(group);
    closeSingleChoice(group);
  }
});

app.addEventListener('keydown', event => {
  const target = event.target.closest?.('svg [data-action="select-market-series"]');
  if (!target || !['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

app.addEventListener('input', event => {
  if (event.target.matches('[data-choice-search]')) filterChoiceOptions(event.target);
});

addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.querySelector('#global-command')?.focus();
  }
  if (event.key === 'Escape') document.body.classList.remove('sidebar-open');
});

addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'steeldesk:chatgpt-auth') return;
  void finishChatGptAuthorization(event.data);
});

document.addEventListener('toggle', event => {
  const panel = event.target;
  if (!(panel instanceof HTMLElement)) return;
  if (panel.matches('[data-market-source-folder]')) {
    const folderKey = panel.dataset.marketSourceFolder;
    if (!folderKey) return;
    if (panel.open) marketOpenFolders.add(folderKey);
    else marketOpenFolders.delete(folderKey);
    return;
  }
  if (!panel.matches('[data-choice-panel]')) return;
  const group = panel.closest('[data-choice-group]');
  const trigger = group?.querySelector('.multi-select__trigger');
  const isOpen = event.newState === 'open' || panel.matches(':popover-open');
  trigger?.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) requestAnimationFrame(() => positionChoicePanel(panel));
}, true);

function repositionOpenChoicePanels() {
  for (const panel of document.querySelectorAll('[data-choice-panel]:popover-open')) positionChoicePanel(panel);
}

addEventListener('resize', repositionOpenChoicePanels);
document.addEventListener('scroll', repositionOpenChoicePanels, true);

events.on('state:changed', nextState => {
  state = nextState;
  render();
});
events.on('route:changed', () => {
  if (router.current !== 'crm') crmQuery = '';
  if (router.current !== 'pricing') quoteQuery = '';
  if (router.current !== 'market') marketReviewSnapshotId = '';
  document.body.classList.remove('sidebar-open');
  render({ transition: true });
  document.querySelector('#main-content')?.focus();
});

try {
  await store.initialize();
  state = store.snapshot();
  router.start();
  if (!PUBLIC_DEMO) {
    void syncMarketSnapshots();
    setInterval(() => { void syncMarketSnapshots(); }, 2 * 60 * 60 * 1000);
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
} catch (error) {
  app.innerHTML = `<main class="fatal"><h1>SteelDesk 无法启动</h1><p>${error.message}</p><button onclick="location.reload()">重新加载</button></main>`;
}
