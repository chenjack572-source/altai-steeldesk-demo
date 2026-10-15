const VIDEO_PLATFORMS = /TikTok|Shorts|Reels|抖音|视频号|YouTube/i;

export function isVideoVariant(variant = {}) {
  return VIDEO_PLATFORMS.test(`${variant.platform || ''} ${variant.format || ''}`);
}

function durationSeconds(value, fallback = 35) {
  const number = Number(String(value || '').match(/\d+/)?.[0]);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function defaultVideoPlan(content, variant = {}) {
  const total = durationSeconds(content.videoDuration || variant.duration, 35);
  const closeStart = Math.max(total - 6, 24);
  const buyerDecision = content.buyerDecision || content.objective || '完成采购判断';
  return [
    { time: '0–3s', shot: '买家正在处理的零件、图纸或收货标签特写', overlay: content.title, voiceover: `如果你正在为实际项目采购不锈钢，先确认这件事：${content.title}`, sourceType: '实拍优先', transition: '硬切 + 金属碰撞音', detail: '前三秒点名采购对象或决策，不以行业争议、牌号冷知识或行情闲谈开场。' },
    { time: `3–10s`, shot: '买家手中的规格、零件或订单条件近景', overlay: 'THE BUYING QUESTION', voiceover: content.body, sourceType: '实拍 / 数据卡', transition: '动作匹配切', detail: '只使用已核实事实，并把技术信息翻译成采购条件。' },
    { time: `10–20s`, shot: '应用工况、图纸或交付场景', overlay: 'WHY IT CHANGES THE ORDER', voiceover: `这会直接影响你的采购判断：${buyerDecision}。`, sourceType: 'AI 辅助镜头', transition: '推近', detail: 'AI 镜头只做示意，不伪造工厂、客户或检测结果。' },
    { time: `20–${closeStart}s`, shot: '采购核对清单逐项出现', overlay: 'CHECK BEFORE YOU BUY', voiceover: '把应用、标准、完整规格、数量和目的地放在同一张询价表里，才能比较可执行的方案。', sourceType: '动态图形', transition: '逐项跳切', detail: '字幕每屏不超过两行，避免写成供应商同行培训。' },
    { time: `${closeStart}–${total}s`, shot: '样品、RFQ 表与品牌片尾', overlay: 'SEND THE COMPLETE SPEC', voiceover: '把应用、规格、数量和目的地发给我们，再做针对性判断。', sourceType: '实拍 + 品牌片尾', transition: '定格收尾', detail: '完整显示 Logo 与 CTA，不使用未核实承诺。' }
  ];
}

function plannedDate(createdAt) {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function laneVideoPlan(lane) {
  const points = lane.proofPoints || [];
  const total = durationSeconds(lane.duration, 30);
  const closeStart = Math.max(total - 6, 24);
  return [
    { time: '0–3s', shot: '采购场景中的零件、图纸或收货文件特写', overlay: lane.title, voiceover: lane.hook, sourceType: '实拍优先', transition: '硬切开场', detail: `点名买家：${lane.buyer}；不要先讲品牌或行业观点。` },
    { time: '3–9s', shot: '第一项采购条件的实物或图纸标注', overlay: 'CHECK 01', voiceover: points[0] || lane.body, sourceType: '实拍 / 数据卡', transition: '动作匹配切', detail: points[0] || '只使用已核实事实。' },
    { time: '9–16s', shot: '第二项采购条件的对比画面', overlay: 'CHECK 02', voiceover: points[1] || lane.decision, sourceType: '实拍 / 动态图形', transition: '左右对比切', detail: points[1] || lane.decision },
    { time: `16–${closeStart}s`, shot: '第三项采购条件与询价表特写', overlay: 'CHECK 03', voiceover: points[2] || lane.decision, sourceType: '动态图形', transition: '逐项跳切', detail: points[2] || lane.decision },
    { time: `${closeStart}–${total}s`, shot: '完整规格清单与品牌片尾', overlay: 'SEND THE BUYING REQUIREMENT', voiceover: lane.cta, sourceType: '实拍 + 品牌片尾', transition: '定格收尾', detail: 'CTA 只要求客户提交采购所需信息，不承诺未经确认的价格或交期。' }
  ];
}

export function createVideoLaneContent(lane, idFactory, createdAt = new Date().toISOString()) {
  const contentId = idFactory('content');
  const variantId = idFactory('variant');
  const seconds = durationSeconds(lane.duration, 30);
  const caption = [lane.hook, '', lane.body, '', '采购核对：', ...(lane.proofPoints || []).map((point, index) => `${index + 1}. ${point}`), '', lane.cta].join('\n');
  return {
    id: contentId,
    sourceLaneId: lane.id,
    title: lane.title,
    pillar: lane.pillar,
    campaign: lane.label,
    objective: lane.objective,
    buyerDecision: lane.decision,
    audience: (lane.audiences || []).join('、') || lane.buyer,
    audiences: lane.audiences || [],
    channels: ['TikTok'],
    language: '中文',
    videoFormat: lane.format,
    videoDuration: lane.duration,
    videoTone: lane.tone,
    body: lane.body,
    proofPoints: lane.proofPoints || [],
    factNote: '这是系统生成的专业草稿；发布前请核对技术事实、标准、价格、交期和客户保密信息。',
    status: 'draft',
    scheduledAt: plannedDate(createdAt),
    createdAt,
    variants: [{
      id: variantId,
      platform: 'TikTok',
      language: '中文',
      format: lane.format,
      spec: `1080 × 1920 px · 9:16 · ${seconds} sec`,
      duration: `${seconds} sec`,
      status: 'ready',
      hook: lane.hook,
      caption,
      hashtags: lane.hashtags,
      cta: lane.cta,
      visualPlan: laneVideoPlan(lane)
    }]
  };
}

export function createContentFromBrief({ brief, verifiedFacts = '', language = '中文' }, idFactory, createdAt = new Date().toISOString()) {
  const title = String(brief || '').trim();
  const facts = String(verifiedFacts || '').trim();
  const content = {
    id: idFactory('content'), title, pillar: '采购指南', campaign: '自定义买家选题',
    objective: '获得包含完整规格的有效询盘',
    buyerDecision: `判断“${title}”对规格、质量、成本或交付的实际影响`,
    audience: '正在采购不锈钢的制造商、项目采购与质量人员', audiences: ['金属加工厂 / OEM'],
    channels: ['TikTok'], language, videoFormat: '人物口播', videoDuration: '35 秒', videoTone: '直接、实用',
    body: facts || `围绕“${title}”回答一个实际采购问题；先说明适用条件，再给核对清单，未提供的数据不作推断。`,
    factNote: facts ? '发布前请复核所提供资料、适用标准与客户保密信息。' : '尚未提供已核实资料；当前为结构草稿，技术结论和数据必须在发布前补充并复核。',
    status: 'draft', scheduledAt: plannedDate(createdAt), createdAt
  };
  content.variants = createStarterVariants(content, idFactory);
  return content;
}

export function createStarterVariants(content, idFactory) {
  return content.channels.map(platform => {
    const video = VIDEO_PLATFORMS.test(platform);
    const duration = content.videoDuration || '35 秒';
    const seconds = durationSeconds(duration);
    const base = {
      id: idFactory('variant'), platform, language: content.language,
      format: video ? content.videoFormat || '人物口播' : 'Post + visual',
      spec: video ? `1080 × 1920 px · 9:16 · ${seconds} sec` : '1080 × 1350 px · 4:5',
      duration: video ? `${seconds} sec` : undefined, status: 'draft', hook: content.title,
      caption: content.body, hashtags: '#IndustrialProcurement #StainlessSteelBuying #Manufacturing',
      cta: 'Send the application, specification, quantity and destination for review.'
    };
    return {
      ...base,
      visualPlan: video ? defaultVideoPlan(content, base) : [
        { index: '01', shot: '封面', overlay: content.title, detail: '工业蓝底、酸性绿色编号、拉丝钢材局部；Logo 小角标置于左上。' },
        { index: '02', shot: '核心事实', overlay: 'WHAT BUYERS SHOULD KNOW', detail: content.body },
        { index: '03', shot: '询盘清单', overlay: 'SEND A COMPLETE SPEC', detail: '应用、标准、规格、数量、目的地；结尾恢复完整 Logo。' }
      ]
    };
  });
}

export function parseVisualPlan(value = '') {
  return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const [marker = '', shot = '', overlay = '', ...detail] = line.split('|').map(part => part.trim());
    return { marker, shot, overlay, detail: detail.join(' | ') };
  });
}

export function normalizeVisualPlan(parsed, existing = []) {
  const usesTimeMarkers = existing.some(block => block.time);
  return parsed.map((block, index) => ({
    ...(usesTimeMarkers ? { time: block.marker } : { index: block.marker || String(index + 1).padStart(2, '0') }),
    shot: block.shot, overlay: block.overlay, detail: block.detail,
    ...(existing[index]?.voiceover ? { voiceover: existing[index].voiceover } : {}),
    ...(existing[index]?.prompt ? { prompt: existing[index].prompt } : {}),
    ...(existing[index]?.sourceType ? { sourceType: existing[index].sourceType } : {}),
    ...(existing[index]?.transition ? { transition: existing[index].transition } : {})
  }));
}

export function videoShotProduction(content, variant, block = {}, index = 0) {
  const subject = block.shot || content.title;
  const isLast = index === (variant.visualPlan?.length || 1) - 1;
  const direction = String(block.detail || '').trim();
  const directedSpeech = direction.match(/^(?:Say|Mention|CTA)\s*:\s*(.+)$/i)?.[1]
    || direction.match(/^Mention\s+(.+)$/i)?.[1];
  const voiceover = block.voiceover
    || (index === 0 ? variant.hook : isLast ? variant.cta : directedSpeech || `${block.overlay || 'Key point'}：${subject}`);
  const prompt = block.prompt || [
    'Vertical 9:16 industrial documentary shot for a stainless-steel B2B short video.',
    `Scene: ${subject}.`,
    `Message: ${block.overlay || variant.hook}.`,
    'Cool steel-blue palette, realistic factory or product lighting, controlled camera movement, crisp material texture.',
    'No invented logos, certificates, customer names, prices or unsafe factory behavior. Leave clean subtitle safe areas at top and bottom.'
  ].join(' ');
  return {
    ...block,
    voiceover,
    prompt,
    sourceType: block.sourceType || (index === 0 || isLast ? '实拍优先' : 'AI 辅助镜头'),
    transition: block.transition || (index === 0 ? '硬切开场' : '动作匹配切')
  };
}

export function composeVideoProductionPackage(content, variant) {
  const shots = (variant.visualPlan || []).map((block, index) => videoShotProduction(content, variant, block, index));
  return [
    `SHORT VIDEO PRODUCTION PACK · ${variant.platform}`,
    `Topic: ${content.title}`,
    `Format: ${variant.format} · ${variant.spec}`,
    `Audience: ${content.audience || '待补充'}`,
    `Buyer decision: ${content.buyerDecision || '待补充'}`,
    `Goal: ${content.objective || '待补充'}`,
    `Tone: ${content.videoTone || '专业、克制'}`,
    '', `HOOK`, variant.hook, '', `CAPTION`, variant.caption, '', 'SHOT LIST',
    ...shots.flatMap((shot, index) => [
      `${String(index + 1).padStart(2, '0')} · ${shot.time || shot.index} · ${shot.sourceType}`,
      `画面：${shot.shot}`,
      `字幕：${shot.overlay}`,
      `口播：${shot.voiceover}`,
      `转场：${shot.transition}`,
      `AI VIDEO PROMPT: ${shot.prompt}`,
      `执行：${shot.detail || '—'}`,
      ''
    ]),
    `CTA: ${variant.cta}`, variant.hashtags || ''
  ].join('\n');
}

function cleanJsonText(value = '') {
  const text = String(value).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

export function parseAiVideoPlan(value, existingVariant) {
  const payload = JSON.parse(cleanJsonText(value));
  if (!payload.hook || !Array.isArray(payload.visualPlan) || payload.visualPlan.length < 3) throw new Error('AI 返回的分镜结构不完整。');
  return {
    ...existingVariant,
    hook: String(payload.hook),
    caption: String(payload.caption || existingVariant.caption || ''),
    cta: String(payload.cta || existingVariant.cta || ''),
    hashtags: String(payload.hashtags || existingVariant.hashtags || ''),
    status: 'ready',
    visualPlan: payload.visualPlan.slice(0, 8).map((block, index) => ({
      time: String(block.time || `${index * 5}–${(index + 1) * 5}s`),
      shot: String(block.shot || ''), overlay: String(block.overlay || ''),
      voiceover: String(block.voiceover || ''), prompt: String(block.prompt || ''),
      sourceType: String(block.sourceType || 'AI 辅助镜头'), transition: String(block.transition || ''),
      detail: String(block.detail || '')
    }))
  };
}

export function composeVariantCopy(content, variant) {
  if (isVideoVariant(variant)) return composeVideoProductionPackage(content, variant);
  return [
    `${variant.platform} · ${variant.format}`,
    variant.spec,
    '',
    variant.hook,
    '',
    variant.caption,
    '',
    variant.hashtags,
    '',
    `CTA: ${variant.cta}`,
    '',
    'VISUAL PLAN',
    ...(variant.visualPlan || []).map(block => `${block.time || block.index} | ${block.shot} | ${block.overlay} | ${block.detail || ''}`),
    '',
    `Source topic: ${content.title}`
  ].join('\n');
}
