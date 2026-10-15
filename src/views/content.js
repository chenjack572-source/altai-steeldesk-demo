import { dialog, formField, pageHeader, selectField, statusBadge, textareaField } from '../ui/components.js';
import { escapeHtml, formatDate } from '../core/format.js';
import { brandKit } from '../domain/brand.js';
import { VIDEO_CONTENT_LANES } from '../services/content-options.js';
import { isVideoVariant, videoShotProduction } from '../services/content.js';

export function renderContent(state, selectedId, activeVariantId, activeVisualIndex = 0) {
  const selected = state.content.find(item => item.id === selectedId) || state.content[0];
  const variants = selected?.variants || [];
  const activeVariant = variants.find(item => item.id === activeVariantId) || variants[0];
  const readyVariants = state.content.flatMap(item => item.variants || []).filter(item => item.status === 'ready').length;
  const videoVariants = state.content.flatMap(item => item.variants || []).filter(isVideoVariant).length;
  const pending = state.content.filter(item => item.status === 'pending_approval').length;

  return `${pageHeader({
    eyebrow: 'CONTENT / PRODUCTION DESK', title: '内容工作室',
    description: '选择一个采购场景，系统直接生成脚本、分镜、口播、提示词和 CTA；你只负责复核与取舍。',
    actions: '<button class="button button--primary" data-action="open-content-dialog">输入一个自定义主题</button>'
  })}
  <section class="content-production-metrics" aria-label="内容生产概况">
    <div><span>主题</span><strong>${state.content.length}</strong><small>可持续扩展</small></div>
    <div><span>短视频制作包</span><strong>${videoVariants}</strong><small>含脚本、分镜与提示词</small></div>
    <div><span>可用成品</span><strong>${readyVariants}</strong><small>正文与画面均齐全</small></div>
    <div><span>待审批</span><strong>${pending}</strong><small>批准前不发布</small></div>
  </section>
  ${renderVideoIdeaBank()}
  ${renderBrandKit()}
  <section class="content-production-layout">
    <aside class="content-library" aria-label="内容主题库">
      <header><div><p class="eyebrow">CONTENT LIBRARY</p><h2>内容主题</h2></div><span>${state.content.length}</span></header>
      <div class="content-library__list">
        ${state.content.map(item => `<button class="content-library__item ${item.id === selected?.id ? 'is-active' : ''}" type="button" data-action="select-content" data-id="${escapeHtml(item.id)}" aria-pressed="${item.id === selected?.id}">
          <span><i>${escapeHtml(item.pillar)}</i>${statusBadge(item.status)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${item.variants?.length || 0} 个平台版本 · ${formatDate(item.scheduledAt)}</small>
        </button>`).join('')}
      </div>
    </aside>
    <section class="production-console">
      ${selected ? renderProductionConsole(selected, activeVariant, activeVisualIndex) : '<p class="quiet">先新建一个内容包。</p>'}
    </section>
  </section>
  ${renderPipeline(state.content)}
  ${newContentDialog()}
  ${selected && activeVariant ? `${variantEditorDialog(selected, activeVariant)}${platformDraftDialog(selected, activeVariant)}` : ''}`;
}

function renderProductionConsole(content, activeVariant, activeVisualIndex) {
  const variants = content.variants || [];
  return `<header class="production-console__header">
    <div><p class="eyebrow">MASTER BRIEF</p><h2>${escapeHtml(content.title)}</h2><p>${escapeHtml(content.body)}</p></div>
    <div class="production-console__actions">${statusBadge(content.status)}${content.status === 'draft' || content.status === 'idea' ? `<button class="button button--ghost" data-action="submit-content" data-id="${escapeHtml(content.id)}">提交全部版本审批</button>` : ''}</div>
  </header>
  <dl class="content-brief-grid">
    <div><dt>目标</dt><dd>${escapeHtml(content.objective || '待补充')}</dd></div>
    <div><dt>受众</dt><dd>${escapeHtml(content.audience || '待补充')}</dd></div>
    <div><dt>${activeVariant && isVideoVariant(activeVariant) ? '视频形式' : '内容支柱'}</dt><dd>${escapeHtml(activeVariant && isVideoVariant(activeVariant) ? content.videoFormat || activeVariant.format : content.pillar)}</dd></div>
    <div><dt>计划日期</dt><dd>${formatDate(content.scheduledAt)}</dd></div>
  </dl>
  ${content.buyerDecision ? `<div class="buyer-decision-note"><strong>这条内容帮助客户决定</strong><span>${escapeHtml(content.buyerDecision)}</span></div>` : ''}
  ${content.factNote ? `<div class="fact-note"><strong>事实边界</strong><span>${escapeHtml(content.factNote)}</span></div>` : ''}
  ${variants.length ? `<div class="variant-tabs" role="tablist" aria-label="平台版本">${variants.map(variant => `<button type="button" role="tab" aria-selected="${variant.id === activeVariant?.id}" class="variant-tab ${variant.id === activeVariant?.id ? 'is-active' : ''}" data-action="select-content-variant" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}"><span>${escapeHtml(variant.platform)}</span><small>${escapeHtml(variant.format)}</small></button>`).join('')}</div>${renderVariant(content, activeVariant, activeVisualIndex)}` : renderNoVariant(content)}`;
}

function renderVariant(content, variant, activeVisualIndex) {
  const isVideo = isVideoVariant(variant);
  const plan = variant.visualPlan || [];
  const visualIndex = Math.max(0, Math.min(Number(activeVisualIndex) || 0, Math.max(plan.length - 1, 0)));
  return `<section class="variant-workspace" role="tabpanel">
    <div class="platform-preview platform-preview--${isVideo ? 'video' : 'post'}">
      <div class="platform-preview__label"><span>${escapeHtml(variant.platform)}</span><strong>${escapeHtml(variant.spec)}</strong></div>
      ${isVideo ? renderVideoPreview(content, variant, plan, visualIndex) : renderPostPreview(content, variant, plan, visualIndex)}
      <div class="platform-preview__tools"><span>${isVideo ? `当前镜头 ${String(visualIndex + 1).padStart(2, '0')} / ${String(Math.max(plan.length, 1)).padStart(2, '0')} · 可逐镜制作` : `当前画面 ${String(visualIndex + 1).padStart(2, '0')} / ${String(Math.max(plan.length, 1)).padStart(2, '0')} · 高清 PNG`}</span><div>${isVideo ? `<button class="button button--dark" type="button" data-action="copy-video-shot-prompt" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}" data-visual-index="${visualIndex}">复制本镜提示词</button><button class="button button--dark" type="button" data-action="copy-video-package" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}">复制整套制作包</button>` : `<button class="button button--dark" type="button" data-action="copy-content-image" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}" data-visual-index="${visualIndex}">复制图片</button><button class="button button--dark" type="button" data-action="download-content-image" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}" data-visual-index="${visualIndex}">下载 PNG</button>`}</div></div>
    </div>
    <article class="publish-copy">
      <header><div><p class="eyebrow">READY COPY</p><h3>发布正文</h3></div><span>${escapeHtml(variant.language)} · ${escapeHtml(variant.status === 'ready' ? '可用成品' : '草稿')}</span></header>
      <section><h4>Hook</h4><p class="publish-copy__hook">${escapeHtml(variant.hook)}</p></section>
      <section><h4>Caption</h4><p class="publish-copy__caption">${multiline(variant.caption)}</p></section>
      <section><h4>Hashtags</h4><p class="publish-copy__tags">${escapeHtml(variant.hashtags || '—')}</p></section>
      <section><h4>CTA</h4><p>${escapeHtml(variant.cta || '—')}</p></section>
      <footer>${isVideo ? `<button class="button button--ai" data-action="ai-build-video" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}">AI 重写完整分镜</button>` : ''}<button class="button button--ghost" data-action="copy-content-variant" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}">复制完整${isVideo ? '制作包' : '文案'}</button><button class="button button--ghost" data-action="open-platform-draft" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}">保存到平台草稿</button><button class="button button--primary" data-action="edit-content-variant" data-id="${escapeHtml(content.id)}" data-variant-id="${escapeHtml(variant.id)}">编辑这个版本</button></footer>
    </article>
  </section>`;
}

function renderVideoPreview(content, variant, plan, visualIndex) {
  const cover = videoShotProduction(content, variant, plan[visualIndex] || plan[0] || {}, visualIndex);
  const shots = plan.map((block, index) => videoShotProduction(content, variant, block, index));
  return `<div class="video-workbench">
    <div class="video-workbench__stages" aria-label="短视频制作流程"><span class="is-active">01 策划</span><span class="is-active">02 分镜</span><span>03 素材</span><span>04 剪辑与审批</span></div>
    <div class="video-production-grid">
    <div class="phone-preview" aria-label="${escapeHtml(variant.platform)} 竖屏镜头预览">
      <div class="phone-preview__top"><span class="phone-preview__brand"><img src="${brandKit.logo}" alt="" width="72" height="45" /><b>MATERIAL NOTE</b></span><span>${escapeHtml(variant.duration || 'VIDEO')}</span></div>
      <div class="phone-preview__content">
        <div class="phone-preview__grade">${escapeHtml(content.proofPoints?.[0] || content.pillar)}</div>
        <strong>${escapeHtml(cover.overlay || variant.hook)}</strong>
        <p>${escapeHtml(cover.detail || content.title)}</p>
      </div>
      <div class="phone-preview__caption"><b>@altai.stainless</b><span>${escapeHtml(variant.caption.slice(0, 90))}${variant.caption.length > 90 ? '…' : ''}</span></div>
    </div>
    <div class="shot-list"><header><span>时间</span><span>画面 / 口播 / 素材</span></header>${shots.map((block, index) => `<button type="button" class="${index === visualIndex ? 'is-active' : ''}" data-action="select-content-visual" data-visual-index="${index}" aria-pressed="${index === visualIndex}"><time>${escapeHtml(block.time || block.index)}</time><span><strong>${escapeHtml(block.shot)}</strong><b>${escapeHtml(block.overlay)}</b><i>${escapeHtml(block.voiceover)}</i><em>${escapeHtml(block.sourceType)}</em></span></button>`).join('')}</div>
    </div>
    <article class="shot-inspector" aria-live="polite">
      <header><div><p class="eyebrow">SHOT ${String(visualIndex + 1).padStart(2, '0')} / PRODUCTION</p><h3>${escapeHtml(cover.shot)}</h3></div><span>${escapeHtml(cover.sourceType)}</span></header>
      <div class="shot-inspector__grid"><section><h4>口播 / VOICE OVER</h4><p>${escapeHtml(cover.voiceover)}</p></section><section><h4>剪辑 / TRANSITION</h4><p>${escapeHtml(cover.transition)}</p></section></div>
      <section class="shot-prompt"><h4>AI VIDEO PROMPT</h4><p>${escapeHtml(cover.prompt)}</p><small>这是逐镜生成提示词；当前不自动渲染视频，也不会伪造真实工厂、客户或证书。</small></section>
    </article>
  </div>`;
}

function renderVideoIdeaBank() {
  return `<section class="video-idea-bank" aria-labelledby="video-idea-title">
    <header><div><p class="eyebrow">READY-TO-GENERATE BUYER CONTENT</p><h2 id="video-idea-title">选一个采购场景，直接生成完整短视频方案</h2><p>目标、受众、形式、时长、口播和 CTA 已由系统完成。点击后直接进入可编辑成品，不再填写内容立项表。</p></div><span>点击即生成 · 不调用 AI</span></header>
    <div class="buyer-content-gate" aria-label="系统自动完成的工作"><span><b>01</b>判断买家与购买问题</span><span><b>02</b>生成文案与逐镜分镜</span><span><b>03</b>保留事实复核与审批</span></div>
    <div class="video-lane-grid">${VIDEO_CONTENT_LANES.map(lane => `<button type="button" class="video-lane" data-action="use-video-lane" data-lane-id="${escapeHtml(lane.id)}"><span>${lane.index}</span><small>${escapeHtml(lane.kicker)}</small><strong>${escapeHtml(lane.label)}</strong><p>${escapeHtml(lane.title)}</p><em>${escapeHtml(lane.buyer)}</em><b>一键生成方案 →</b></button>`).join('')}</div>
  </section>`;
}

function renderPostPreview(content, variant, plan, visualIndex) {
  const cover = plan[visualIndex] || plan[0] || {};
  return `<div class="social-post-preview">
    <header><div class="social-avatar"><img src="${brandKit.logo}" alt="" width="34" height="28" /></div><div><strong>Altai Stainless</strong><span>${escapeHtml(variant.platform)} · Company page</span></div><b>•••</b></header>
    <div class="social-visual">
      <div class="social-visual__masthead"><span class="social-visual__brand"><i><img src="${brandKit.logo}" alt="" width="72" height="45" /></i><b>ALTAI STAINLESS<small>MATERIAL INTELLIGENCE</small></b></span><strong>${escapeHtml(cover.index || String(visualIndex + 1).padStart(2, '0'))}</strong></div>
      <div class="social-visual__body"><p>ALTAI / ${escapeHtml(content.campaign || content.pillar)}</p><strong>${escapeHtml(cover.overlay || variant.hook)}</strong><span>${escapeHtml(cover.detail || content.title)}</span></div>
      <footer><b>ALTAI STAINLESS</b><span>${Math.max(plan.length, 1)} PAGE${plan.length === 1 ? '' : 'S'}</span></footer>
    </div>
    ${plan.length > 1 ? `<div class="slide-strip">${plan.slice(0, 6).map((block, index) => `<button type="button" class="${index === visualIndex ? 'is-active' : ''}" data-action="select-content-visual" data-visual-index="${index}" aria-pressed="${index === visualIndex}"><span>${escapeHtml(block.index)}</span><strong>${escapeHtml(block.overlay)}</strong></button>`).join('')}</div>` : ''}
  </div>`;
}

function platformDraftDialog(content, variant) {
  const platform = variant.platform || '目标平台';
  const isTikTok = /TikTok|抖音/i.test(platform);
  const isLinkedIn = /LinkedIn/i.test(platform);
  const title = isTikTok ? '支持原生草稿上传' : isLinkedIn ? '官方接口不支持新建原生草稿' : '需要先连接平台账号';
  const detail = isTikTok
    ? '连接 TikTok Developer 应用并授权 video.upload 后，工作台可以把视频或图片送入 TikTok 收件箱草稿，你再在 TikTok 内检查、编辑并手动发布。'
    : isLinkedIn
      ? 'LinkedIn 官方 Posts API 创建内容时只接受发布状态。工作台会保留本地审核包；连接公司页后，可以在你最终确认时再发布，或辅助打开发布页面完成手动上传。'
      : '该平台尚未配置账号和开发者权限。连接完成前，工作台只生成本地图片与文案，不会向外部发送任何内容。';
  return dialog('platform-draft-dialog', `${platform} 发布交接`, `<div class="draft-handoff"><p class="eyebrow">PLATFORM HANDOFF</p><h3>${title}</h3><p>${detail}</p><dl><div><dt>当前素材</dt><dd>${escapeHtml(variant.spec)}</dd></div><div><dt>审核状态</dt><dd>${content.status === 'approved' ? '已批准，可交接' : '尚未批准，仅可本地准备'}</dd></div><div><dt>账号连接</dt><dd>未配置</dd></div></dl><div class="integration-notice"><strong>安全规则</strong><p>即使连接账号，保存草稿或发布前仍需要你在工作台明确确认。</p></div></div>`, '<button class="button button--ghost" value="cancel">关闭</button><button class="button button--primary" type="button" data-action="open-integrations">前往平台连接</button>');
}

function renderBrandKit() {
  return `<details class="brand-kit">
    <summary>
      <span class="brand-kit__logo"><img src="${brandKit.logo}" alt="${brandKit.alt}" width="120" height="76" /></span>
      <span><strong>阿尔泰品牌标识已接入内容模板</strong><small>封面角标、账号头像与视频安全区自动预览；最终发布仍需你的审批。</small></span>
      <b>使用规则</b>
    </summary>
    <div class="brand-kit__rules">
      <p><strong>图文</strong><span>${brandKit.usage.social}</span></p>
      <p><strong>视频</strong><span>${brandKit.usage.video}</span></p>
      <p><strong>保护</strong><span>${brandKit.usage.protection}</span></p>
    </div>
  </details>`;
}

function renderNoVariant(content) {
  return `<div class="empty-state"><span class="empty-state__mark" aria-hidden="true">＋</span><h3>还没有平台版本</h3><p>重新保存此内容包即可按目标平台建立可编辑的基础版本。</p><button class="button button--ghost" data-action="edit-source-content" data-id="${escapeHtml(content.id)}" disabled>源内容编辑将在下一版开放</button></div>`;
}

function renderPipeline(items) {
  const columns = [
    { id: 'idea', label: '选题' }, { id: 'draft', label: '制作中' }, { id: 'pending_approval', label: '待审批' },
    { id: 'approved', label: '已批准待发布' }, { id: 'published', label: '已发布' }
  ];
  return `<details class="content-pipeline"><summary><span>查看生产队列</span><small>从选题到发布的完整状态</small></summary><div class="content-board">${columns.map(column => { const records = items.filter(item => item.status === column.id); return `<section class="board-column"><header><span>${column.label}</span><strong>${records.length}</strong></header><div class="board-column__body">${records.map(item => `<article class="content-card"><div class="content-card__meta"><span>${escapeHtml(item.pillar)}</span><time>${formatDate(item.scheduledAt)}</time></div><h3>${escapeHtml(item.title)}</h3><p>${item.variants?.length || 0} 个平台版本</p><footer><span>${escapeHtml(item.channels.join(' · '))}</span>${statusBadge(item.status)}</footer><button class="text-button" data-action="select-content" data-id="${escapeHtml(item.id)}">打开制作台 →</button></article>`).join('') || '<p class="board-column__empty">暂无内容</p>'}</div></section>`; }).join('')}</div></details>`;
}

function newContentDialog() {
  return dialog('content-dialog', '从一句话生成短视频方案', `<div class="quick-content-intro"><strong>其他交给工作台</strong><p>你只需要说产品、应用或客户问题。系统会自动完成受众、内容目标、视频结构、时长、语气与 CTA。</p></div><form id="content-form" class="form-grid quick-content-form">
    ${textareaField({ id: 'brief', label: '你想让客户了解什么', required: true, placeholder: '例如：印度客户采购 430 BA 厨房设备面板时，为什么不能只比较每吨价格？' })}
    ${textareaField({ id: 'verifiedFacts', label: '必须使用的事实或资料（可选）', placeholder: '粘贴已经确认的数据、标准、产品参数或客户问题。没有也可以先生成结构草稿。' })}
    ${selectField({ id: 'language', label: '输出语言', value: '中文', options: ['中文', '英文', '中/英'] })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="content-form" value="default">生成短视频内容包</button>');
}

function variantEditorDialog(content, variant) {
  const planText = (variant.visualPlan || []).map(block => `${block.time || block.index || ''} | ${block.shot || ''} | ${block.overlay || ''} | ${block.detail || ''}`).join('\n');
  return dialog('variant-dialog', `编辑 ${variant.platform} 版本`, `<form id="variant-form" class="form-grid">
    <input type="hidden" name="contentId" value="${escapeHtml(content.id)}" />
    <input type="hidden" name="variantId" value="${escapeHtml(variant.id)}" />
    ${formField({ id: 'variant-hook', label: 'Hook / 首屏标题', value: variant.hook, required: true })}
    ${formField({ id: 'variant-spec', label: '发布规格', value: variant.spec, required: true })}
    ${textareaField({ id: 'variant-caption', label: '发布正文', value: variant.caption, required: true })}
    ${textareaField({ id: 'variant-plan', label: '画面 / 分镜', value: planText, required: true, help: '每行：时间或页码 | 画面 | 屏幕文字 | 执行备注。口播、AI 提示词和素材类型在制作台按镜头保留。' })}
    ${textareaField({ id: 'variant-hashtags', label: 'Hashtags / SEO', value: variant.hashtags || '' })}
    ${textareaField({ id: 'variant-cta', label: 'CTA', value: variant.cta || '', required: true })}
  </form>`, '<button class="button button--ghost" value="cancel">取消</button><button class="button button--primary" type="submit" form="variant-form" value="default">保存这个版本</button>');
}

function multiline(value = '') {
  return escapeHtml(value).replaceAll('\n', '<br />');
}
