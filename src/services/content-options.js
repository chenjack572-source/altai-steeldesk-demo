export const CONTENT_PLATFORM_OPTIONS = Object.freeze([
  'LinkedIn', 'Facebook', 'Instagram', 'TikTok', 'YouTube Shorts', '官网 / Blog',
  'Email', 'WhatsApp', '微信视频号', '抖音', 'B2B 平台'
]);

export const CONTENT_AUDIENCE_OPTIONS = Object.freeze([
  '不锈钢进口商 / 经销商', '钢材服务中心', '金属加工厂 / OEM', '商用厨房设备采购',
  '家电 / 厨具制造商', '汽车排气 / 零部件企业', 'HVAC / 换热器 / 热水器企业',
  '电梯 / 建筑装饰企业', '项目采购 / 工程承包商', '现有客户 / 沉默线索'
]);

export const CONTENT_GOALS = Object.freeze([
  { value: '获得包含完整规格的有效询盘', label: '获取有效询盘', scene: '希望潜在客户提交牌号、标准、厚宽、数量、目的地和贸易条款。' },
  { value: '建立400系不锈钢专业供应商信任', label: '建立专业信任', scene: '账号刚起步，先证明你懂材料选择、用途边界和采购风险。' },
  { value: '帮助采购方完成材料选型', label: '推动材料选型', scene: '解释 430、409L、439、441 等材料的差异、适用场景和限制。' },
  { value: '证明钢厂代理、质量控制与材料追溯能力', label: '证明供应能力', scene: '展示代理钢厂、MTC、炉号、检验、加工和出口文件能力。' },
  { value: '推动现有客户回复并补充采购信息', label: '唤醒客户跟进', scene: '用于邮件、WhatsApp 或私域内容，推动沉默客户补充需求。' },
  { value: '引导目标客户访问官网或产品页面', label: '引导官网访问', scene: '适合产品页、案例页或 RFQ 页面已经准备好的内容。' },
  { value: '通过市场与应用洞察吸引目标买家关注', label: '扩大精准触达', scene: '用市场变化、行业问题和应用趋势获得目标行业关注。' }
]);

export const VIDEO_CONTENT_LANES = Object.freeze([
  {
    id: 'application-decision', index: '01', label: '应用选材', kicker: 'BUYER USE CASE / 30–40 SEC',
    buyer: '设备厂采购 / 产品工程师', audiences: ['家电 / 厨具制造商'], title: '商用厨房设备：哪些部件适合 430，哪些情况应考虑 304',
    pillar: '应用案例', objective: '帮助采购方完成材料选型', decision: '根据零件用途、清洗环境和加工方式确定候选牌号',
    body: '从商用厨房设备的具体部件出发，对比清洗环境、腐蚀介质、成形深度和焊接要求；不把 430 与 304 简化为低配和高配，最终按图纸、标准和实际工况确认。',
    format: '案例复盘', duration: '35 秒', tone: '专业、克制',
    hook: '采购商用厨房设备用钢，先看部件和清洗环境，再谈 430 还是 304。',
    proofPoints: ['接触盐分、清洁剂和潮气的程度', '零件的拉伸深度、折弯与焊接方式', '表面、尺寸、年用量和目的地'],
    cta: '把零件用途、尺寸、表面、年用量和目的地发给我们，先做候选牌号清单。',
    hashtags: '#商用厨房设备 #不锈钢采购 #材料选型 #设备制造'
  },
  {
    id: 'quote-comparison', index: '02', label: '报价比较', kicker: 'QUOTE DECISION / 25–35 SEC',
    buyer: '采购经理 / 进口商采购', audiences: ['不锈钢进口商 / 经销商', '项目采购 / 工程承包商'], title: '同样写着 2mm，为什么三份不锈钢报价不能直接比',
    pillar: '采购指南', objective: '获得包含完整规格的有效询盘', decision: '确认三份报价是否建立在相同规格、交付和贸易条件上',
    body: '帮助采购核对厚度公差、宽度、表面、边部、卷重、包装、贸易条款和目的地，解释参数不同为什么会造成价格不可比；不评价未提供原始条件的具体报价。',
    format: '避坑清单', duration: '30 秒', tone: '直接、实用',
    hook: '三份报价都写着 2mm，价格却不能直接比较，问题通常藏在规格和交付条件里。',
    proofPoints: ['厚度公差、宽度、表面与边部是否一致', '卷重、包装、税费与贸易条款是否一致', '目的地、交期和付款条件是否一致'],
    cta: '把三份报价的规格页隐去公司名称后发来，我们按同一条件帮你列出差异。',
    hashtags: '#采购管理 #不锈钢报价 #供应商比较 #工业采购'
  },
  {
    id: 'rfq-ready', index: '03', label: '询价准备', kicker: 'RFQ CHECK / 30–40 SEC',
    buyer: '汽车零部件采购 / 制管厂', audiences: ['汽车排气 / 零部件企业'], title: '询价 409L 前，采购需要准备哪 6 项信息',
    pillar: '采购指南', objective: '获得包含完整规格的有效询盘', decision: '判断当前 RFQ 是否足以获得可执行、可比较的报价',
    body: '围绕标准与精确牌号、厚宽和公差、表面与边部、卷重与内径、性能或钢厂准入、数量与交期，形成采购可直接使用的询价检查表。',
    format: '避坑清单', duration: '35 秒', tone: '直接、实用',
    hook: '409L 询价只有牌号、厚度和吨位，供应商给出的价格往往并不可执行。',
    proofPoints: ['标准、精确牌号、厚宽与公差', '表面、边部、卷重、内径和包装', '性能或钢厂准入、数量、目的地与交期'],
    cta: '发送图纸、现有规格和年用量，我们先检查 RFQ 是否具备报价条件。',
    hashtags: '#409L #汽车排气系统 #RFQ #不锈钢采购'
  },
  {
    id: 'delivery-risk', index: '04', label: '交期控制', kicker: 'DELIVERY RISK / 25–35 SEC',
    buyer: '计划采购 / 供应链经理', audiences: ['金属加工厂 / OEM', '项目采购 / 工程承包商'], title: '确认不锈钢订单前，采购要问清哪 4 个交付节点',
    pillar: '采购指南', objective: '建立400系不锈钢专业供应商信任', decision: '识别钢厂排产、加工、检验和出运之间的交期风险',
    body: '用采购视角拆解钢厂排产、分条或开平、检验包装、订舱出运四个节点，区分生产时间与总交付时间；不承诺未经确认的具体交期。',
    format: '流程纪录', duration: '30 秒', tone: '自然、可信',
    hook: '供应商说 20 天交货时，采购需要确认他说的是生产完成，还是货物真正可以出运。',
    proofPoints: ['钢厂排产完成时间', '分条或开平、检验与包装时间', '订舱、报关和实际出运时间'],
    cta: '把产品形态、加工要求、数量和目的港发来，我们按节点拆出可核对的交付计划。',
    hashtags: '#交期管理 #供应链 #不锈钢订单 #工业采购'
  },
  {
    id: 'receiving-check', index: '05', label: '收货验材', kicker: 'RECEIVING CHECK / 20–35 SEC',
    buyer: '质量工程师 / 仓库验收', audiences: ['金属加工厂 / OEM'], title: '不锈钢到货后，为什么不能只靠磁铁判断材质',
    pillar: '质量证明', objective: '建立400系不锈钢专业供应商信任', decision: '确定收货时需要核对的标签、证书和检测依据',
    body: '说明磁性只能作为有限观察，不能替代牌号证明；采购和质量人员应核对卷标、炉批号、MTC 与订单规格，必要时按约定方法检测。',
    format: '实验演示', duration: '30 秒', tone: '自然、可信',
    hook: '磁铁吸住了，不等于材料一定不是 304；收货判断不能只靠这一项。',
    proofPoints: ['先核对卷标、牌号、规格和订单', '再核对炉批号与 MTC 的对应关系', '有争议时按合同约定的方法检测'],
    cta: '需要收货检查表，可以把产品形态和证书要求发给我们。',
    hashtags: '#来料检验 #不锈钢验收 #MTC #质量管理'
  },
  {
    id: 'traceability-check', index: '06', label: '追溯核对', kicker: 'DOCUMENT CHECK / 25–35 SEC',
    buyer: '工业采购 / 质量负责人', audiences: ['不锈钢进口商 / 经销商', '金属加工厂 / OEM'], title: '收到 MTC 后，采购应该核对哪 3 个编号',
    pillar: '质量证明', objective: '证明钢厂代理、质量控制与材料追溯能力', decision: '确认订单、卷标或加工批次与 MTC 是否能够对应',
    body: '从订单规格、炉号或卷号、加工批次和包装标识之间的对应关系讲解追溯；展示样例时遮盖客户、价格、银行信息和敏感证书编号。',
    format: '人物口播', duration: '30 秒', tone: '专业、克制',
    hook: '收到 MTC 不等于完成追溯，采购还要确认它能对应到你收到的那一卷或那一包材料。',
    proofPoints: ['订单上的牌号、规格与标准', 'MTC 上的炉号或卷号', '加工批次、包装标签与出货文件'],
    cta: '发送你的证书和标签要求，我们可以先整理一份订单追溯核对清单。',
    hashtags: '#MTC #材料追溯 #质量文件 #不锈钢采购'
  }
]);

export const VIDEO_FORMAT_OPTIONS = Object.freeze(['人物口播', '产品实拍 + 配音', '行情播报', '案例复盘', '流程纪录', '实验演示', '避坑清单']);
export const VIDEO_DURATION_OPTIONS = Object.freeze(['25 秒', '35 秒', '45 秒', '60 秒']);
export const VIDEO_TONE_OPTIONS = Object.freeze(['专业、克制', '直接、实用', '冷静、数据化', '自然、可信', '快速、可视化']);

export function normalizeChoiceValues(values = []) {
  const source = Array.isArray(values) ? values : String(values || '').split(',');
  return [...new Set(source.map(value => String(value).trim()).filter(Boolean))];
}

export function mergeChoiceOptions(defaults, custom = []) {
  return normalizeChoiceValues([...defaults, ...custom]);
}

export function resolveContentObjective(preset, custom = '') {
  return preset === '__custom__' ? String(custom).trim() : String(preset || '').trim();
}

export function storedChoiceOptions(storageKey, defaults = []) {
  const readCustom = () => {
    if (typeof localStorage === 'undefined') return [];
    try {
      const value = JSON.parse(localStorage.getItem(`steeldesk:choice-${storageKey}`) || '[]');
      return Array.isArray(value) ? normalizeChoiceValues(value) : [];
    } catch {
      return [];
    }
  };
  const custom = readCustom();
  if (defaults.some(option => typeof option === 'object')) {
    const existing = new Set(defaults.map(option => option.value));
    return [...defaults, ...custom.filter(value => !existing.has(value)).map(value => ({ value, label: value, keywords: '自定义 custom' }))];
  }
  try {
    return mergeChoiceOptions(defaults, custom);
  } catch {
    return mergeChoiceOptions(defaults);
  }
}
