import { daysFromNow, today } from '../core/format.js';
import { contentProductionPack } from './content-library.js';

const now = new Date().toISOString();

const demoMarketDates = [
  '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-12', '2026-10-13',
  '2026-10-14', '2026-10-15', '2026-10-16'
];

const demoMarketSeries = [
  { material: '409L/2D', origin: '太钢', specification: '1.2×1219 mm', values: [7580, 7600, 7600, 7620, 7650, 7650, 7680, 7700] },
  { material: '430/2B', origin: '太钢', specification: '0.6×1219 mm', values: [7900, 7920, 7950, 7950, 7980, 8000, 8020, 8050] },
  { material: '201/2B', origin: '宏旺', specification: '0.8×1219 mm', values: [8420, 8450, 8450, 8480, 8500, 8500, 8520, 8550] },
  { material: '304/2B', origin: '张浦', specification: '1.0×1219 mm', values: [14020, 14050, 14080, 14080, 14100, 14120, 14150, 14180] }
];

const demoMarketSnapshots = [
  ...demoMarketDates.map(date => ({
    id: `market_mysteel_${date.replaceAll('-', '')}`,
    source: 'Mysteel', sourceKey: 'mysteel', sourceType: 'structured-table',
    marketDate: date, session: 'afternoon', sessionLabel: '下午',
    title: `${date} 无锡不锈钢卷板公开价格（演示）`,
    sourceUrl: 'https://www.mysteel.com/',
    publishedAt: `${date}T15:30:00+08:00`, syncedAt: `${date}T16:00:00+08:00`, createdAt: now
  })),
  {
    id: 'market_miniprogram_20261013', source: '小程序报价', sourceKey: 'mini-program', sourceType: 'image',
    marketDate: '2026-10-13', session: 'afternoon', sessionLabel: '下午',
    title: '10月13日无锡不锈钢市场报价原图',
    imageUrl: 'https://wuxibuxiugang.oss-cn-hangzhou.aliyuncs.com/image/20261013/6d36ba7977cc71c40f4e7da791595fc1.png',
    imageLabel: '无锡不锈钢公开报价原图',
    sourceUrl: 'https://wuxibuxiugang.oss-cn-hangzhou.aliyuncs.com/image/20261013/6d36ba7977cc71c40f4e7da791595fc1.png',
    publishedAt: '2026-10-13T15:00:00+08:00', syncedAt: '2026-10-13T16:00:00+08:00', createdAt: now
  }
];

const demoMarketPrices = demoMarketDates.flatMap((date, dateIndex) => demoMarketSeries.map((series, seriesIndex) => {
  const price = series.values[dateIndex];
  const previous = dateIndex ? series.values[dateIndex - 1] : price;
  return {
    id: `price_${date.replaceAll('-', '')}_${seriesIndex + 1}`,
    snapshotId: `market_mysteel_${date.replaceAll('-', '')}`,
    source: 'Mysteel', sourceKey: 'mysteel', sourceType: 'structured-table',
    marketDate: date, session: 'afternoon', sessionLabel: '下午',
    material: series.material, company: series.origin, origin: series.origin,
    thirdColumnRaw: series.origin, productForm: '冷轧卷', quoteBasis: '无锡现货',
    specification: series.specification, unit: 'CNY/MT', currency: 'CNY',
    rawPrice: price, normalizedPrice: price, change: price === previous ? '0' : `${price - previous > 0 ? '+' : ''}${price - previous}`,
    reviewStatus: 'verified', confidence: 1, rawSource: { demo: true, note: '公开行情示例数据' }, createdAt: now
  };
}));

export const gradeKnowledge = [
  {
    family: '汽车排气与耐热',
    grades: '409 / 409L / 439 / 441',
    forms: '卷、带、焊管、冲压件',
    applications: '消声器、排气管、催化器壳体、EGR、热盾',
    buyers: '排气系统厂、汽车零件厂、制管厂、冲压厂',
    regions: '泰国、印度、印尼、越南',
    checkpoints: ['高温氧化', '热疲劳', '焊接性', '成形性', '批次稳定']
  },
  {
    family: '家电与厨房',
    grades: '430 / 430L / 430J1L / 430Ti',
    forms: '冷轧卷、分条、板、冲压件',
    applications: '洗衣机、烤箱、冰箱、灶具、水槽、商厨设备',
    buyers: '家电 OEM、厨具厂、水槽厂、商用厨房设备厂',
    regions: '越南、印度、马来西亚、中东',
    checkpoints: ['表面一致性', '深冲性能', '板形', '覆膜', '边部']
  },
  {
    family: '热设备与换热',
    grades: '441 / 444 / 436 / 430Ti',
    forms: '薄板、卷、焊管、换热部件',
    applications: '热交换器、锅炉、热水器、燃烧器、HVAC',
    buyers: '换热器厂、锅炉厂、热水器厂、HVAC 制造商',
    regions: '阿联酋、沙特、印度、东南亚',
    checkpoints: ['腐蚀环境', '温度范围', '焊接工艺', '泄漏测试']
  },
  {
    family: '交通与工业结构',
    grades: '410L / 1.4003 / 409L',
    forms: '热轧卷板、结构板、加工件',
    applications: '铁路货车、车身、集装箱、输送设备、农业机械',
    buyers: '轨道车辆厂、车身厂、集装箱厂、工程机械厂',
    regions: '印度、东南亚、中东',
    checkpoints: ['焊接性', '冲击韧性', '板厚公差', '结构规范']
  },
  {
    family: '刀具与机械',
    grades: '410 / 420 / 420J2 / 440 系',
    forms: '板、带、棒材',
    applications: '刀具、剪刀、阀件、泵件、轴、耐磨零件',
    buyers: '刀具厂、泵阀厂、五金厂、机械加工厂',
    regions: '印度、越南、日韩',
    checkpoints: ['退火状态', '硬度', '热处理', '脱碳', '平直度']
  }
];

export const seedData = {
  settings: [
    {
      id: 'app',
      businessName: 'Altai Stainless',
      currency: 'USD',
      locale: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      minimumMargin: 5,
      externalActionsRequireApproval: true,
      aiEnabled: false,
      aiProvider: 'none',
      aiConnectionStatus: 'not_configured',
      aiExecutionMode: 'manual',
      aiFeatureScopes: ['content_drafting', 'translation', 'rfq_review', 'reply_drafting'],
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now
    }
  ],
  tasks: [
    { id: 'task_market', title: '确认今日 400 系钢厂报价与交期', group: '行情', priority: 'high', dueDate: today(), completed: false, createdAt: now },
    { id: 'task_targets', title: '审核越南商用厨房设备目标客户名单', group: '开发', priority: 'high', dueDate: today(), completed: false, createdAt: now },
    { id: 'task_content', title: '审核商用厨房设备 430 / 304 选材内容', group: '内容', priority: 'medium', dueDate: today(), completed: false, createdAt: now },
    { id: 'task_rfq', title: '补齐 RFQ-2026-001 的表面与目的港', group: '询盘', priority: 'medium', dueDate: today(), completed: false, createdAt: now },
    { id: 'task_backup', title: '导出本周本地数据备份', group: '系统', priority: 'low', dueDate: daysFromNow(3), completed: false, createdAt: now }
  ],
  companies: [
    {
      id: 'company_aurora', name: 'Aurora Kitchen Systems', country: 'Vietnam', city: 'Ho Chi Minh City',
      segment: '商用厨房设备', stage: 'research', score: 82, priority: 'A', likelyGrades: '430 / 430J1L',
      website: 'https://example.com', source: '目标客户研究', nextAction: '确认采购负责人', nextActionAt: daysFromNow(1),
      notes: '可能采购冷轧卷、板和拉丝加工件。', createdAt: now
    },
    {
      id: 'company_gulf', name: 'Gulf Thermal Equipment', country: 'United Arab Emirates', city: 'Sharjah',
      segment: '热水器与换热设备', stage: 'contacted', score: 76, priority: 'A', likelyGrades: '441 / 444',
      website: 'https://example.org', source: '官网行业目录', nextAction: '审核英文跟进邮件', nextActionAt: daysFromNow(2),
      notes: '需要确认氯离子环境和焊接要求。', createdAt: now
    },
    {
      id: 'company_india', name: 'Deccan Exhaust Components', country: 'India', city: 'Pune',
      segment: '汽车排气系统', stage: 'qualified', score: 88, priority: 'A', likelyGrades: '409L / 439 / 441',
      website: 'https://example.net/deccan', source: '展会名录', nextAction: '索取月度用量和钢厂准入要求', nextActionAt: daysFromNow(1),
      notes: '避免普通大宗 430 价格竞争，强调稳定规格与加工。', createdAt: now
    },
    {
      id: 'company_korea', name: 'Hanul Precision Parts', country: 'South Korea', city: 'Busan',
      segment: '泵阀及精密加工', stage: 'nurture', score: 61, priority: 'B', likelyGrades: '410 / 420',
      website: 'https://example.net/hanul', source: '行业协会', nextAction: '准备 JIS 对照资料', nextActionAt: daysFromNow(5),
      notes: '需要较强的证书、硬度和批次一致性证明。', createdAt: now
    }
  ],
  contacts: [
    { id: 'contact_aurora', companyId: 'company_aurora', name: 'Linh Nguyen', role: '采购经理', email: 'buyer@example.com', phone: '+84 000 000 000', language: 'English', createdAt: now },
    { id: 'contact_gulf', companyId: 'company_gulf', name: 'Omar Rahman', role: '供应链主管', email: 'sourcing@example.com', phone: '+971 00 000 0000', language: 'English', createdAt: now },
    { id: 'contact_india', companyId: 'company_india', name: 'Arjun Mehta', role: '材料采购', email: 'materials@example.com', phone: '+91 00000 00000', language: 'English', createdAt: now }
  ],
  rfqs: [
    {
      id: 'rfq_001', reference: 'RFQ-2026-001', companyId: 'company_aurora', companyName: 'Aurora Kitchen Systems',
      country: 'Vietnam', product: 'Cold rolled coil', grade: '430', standard: 'ASTM A240', thickness: '0.6 mm',
      width: '1219 mm', finish: '待客户确认（2B / BA）', quantityMt: 25, incoterm: 'CIF', destination: '待客户确认（胡志明市港口）',
      status: 'needs_info', completeness: 72, dueAt: daysFromNow(2), notes: '等待表面、卷重和目的港。', createdAt: now
    },
    {
      id: 'rfq_002', reference: 'RFQ-2026-002', companyId: 'company_india', companyName: 'Deccan Exhaust Components',
      country: 'India', product: 'Slit coil', grade: '409L', standard: 'JIS G4305', thickness: '1.2 mm',
      width: '186 / 242 mm', finish: '2D', quantityMt: 48, incoterm: 'FOB', destination: 'Shanghai',
      status: 'mill_inquiry', completeness: 94, dueAt: daysFromNow(1), notes: '需要确认月度重复订单。', createdAt: now
    },
    {
      id: 'rfq_003', reference: 'RFQ-2026-003', companyId: 'company_gulf', companyName: 'Gulf Thermal Equipment',
      country: 'United Arab Emirates', product: 'Cold rolled sheet', grade: '441', standard: 'EN 10088-2', thickness: '1.0 mm',
      width: '1000 × 2000 mm', finish: '2B', quantityMt: 30, incoterm: 'CIF', destination: 'Jebel Ali',
      status: 'quoted', completeness: 100, dueAt: daysFromNow(3), notes: '报价已提交，等待确认工作温度。', createdAt: now
    },
    {
      id: 'rfq_004', reference: 'RFQ-2026-004', companyId: 'company_aurora', companyName: 'Aurora Kitchen Systems',
      country: 'Vietnam', product: 'Cold rolled coil', grade: '430', standard: 'JIS G4305', thickness: '0.8 mm',
      width: '1219 mm', finish: 'BA', quantityMt: 50, incoterm: 'CIF', destination: 'Cat Lai',
      status: 'won', completeness: 100, dueAt: daysFromNow(-2), notes: '示例订单已确认，进入合同执行。', createdAt: now
    }
  ],
  content: contentProductionPack,
  approvals: [
    {
      id: 'approval_content_430', actionType: 'content_publish', entityType: 'content', entityId: 'content_430',
      title: '发布：商用厨房设备 430 / 304 选材', summary: 'LinkedIn、Facebook 图文与 TikTok 短视频版本。',
      channel: 'LinkedIn, Facebook, TikTok', recipient: '公开账号', status: 'pending', createdAt: now, updatedAt: now
    },
    {
      id: 'approval_message_gulf', actionType: 'customer_message', entityType: 'company', entityId: 'company_gulf',
      title: '客户跟进：Gulf Thermal Equipment', summary: '询问热交换器工作温度、介质和月度用量。',
      channel: 'Email', recipient: '采购部门（待确认）', status: 'pending', createdAt: now, updatedAt: now
    },
    {
      id: 'approval_quote_gulf', actionType: 'formal_quote', entityType: 'quote', entityId: 'quote_gulf_441',
      title: '正式报价：Gulf Thermal Equipment', summary: '441/2B 冷轧板 30 MT，CIF Jebel Ali，USD 1,466 / MT。',
      channel: '正式报价', recipient: 'Omar Rahman（示例联系人）', status: 'pending', createdAt: now, updatedAt: now
    },
    {
      id: 'approval_quote_aurora_done', actionType: 'formal_quote', entityType: 'quote', entityId: 'quote_aurora_430',
      title: '正式报价：Aurora Kitchen Systems', summary: '430/2B 冷轧卷 25 MT，报价已批准并转为合同。',
      channel: '正式报价', recipient: 'Linh Nguyen（示例联系人）', status: 'approved', reviewedAt: now, createdAt: now, updatedAt: now
    }
  ],
  suppliers: [
    {
      id: 'supplier_alpha', name: '合作钢厂 A', type: '钢厂', region: '华东',
      grades: '409L / 430 / 439 / 441', forms: '热轧、冷轧卷', moq: '20 MT', leadTime: '25–35 天',
      strengths: '汽车排气钢与稳定化铁素体', status: 'active', rating: 4, createdAt: now
    },
    {
      id: 'supplier_beta', name: '服务中心 B', type: '服务中心', region: '无锡',
      grades: '430 / 410S / 420J2', forms: '分条、开平、覆膜', moq: '3 MT', leadTime: '5–10 天',
      strengths: '小批量、混装、表面加工', status: 'active', rating: 4, createdAt: now
    },
    {
      id: 'supplier_gamma', name: '合作钢厂 C', type: '钢厂', region: '华南',
      grades: '410L / 1.4003 / 409L', forms: '热轧卷板', moq: '25 MT', leadTime: '30–45 天',
      strengths: '交通与结构用途', status: 'review', rating: 3, createdAt: now
    }
  ],
  quotes: [
    {
      id: 'quote_aurora_430', recordType: 'quotation', reference: 'QT-2026-101', quoteDate: '2026-10-15',
      customer: 'Aurora Kitchen Systems', supplier: 'Altai Stainless（演示）', currency: 'USD', total: 28750,
      taxIncluded: false, delivery: 'CIF Cat Lai, Vietnam', payment: '30% T/T deposit, 70% before shipment',
      leadTime: '25–30 days', validity: '7 days', status: 'approved',
      lineItems: [
        { product: 'Cold rolled coil', grade: '430/2B', specification: '0.6 × 1219 mm', quantity: 25, unit: 'MT', weightKg: 25000, unitPrice: 1150, priceBasis: 'USD/MT', amount: 28750, remarks: 'Paper interleaved, export packing' }
      ],
      notes: ['公开演示报价，不对应真实客户交易。'], createdAt: now
    },
    {
      id: 'contract_aurora_430', recordType: 'contract', reference: 'SC-2026-018', quoteDate: '2026-10-16',
      customer: 'Aurora Kitchen Systems', supplier: 'Altai Stainless（演示）', currency: 'USD', total: 57500,
      taxIncluded: false, delivery: 'CIF Cat Lai, Vietnam', payment: '30% T/T deposit, balance against copy documents',
      leadTime: '30 days after deposit', validity: 'Contract confirmed', status: 'executing',
      lineItems: [
        { product: 'Cold rolled coil', grade: '430/BA', specification: '0.8 × 1219 mm', quantity: 50, unit: 'MT', weightKg: 50000, unitPrice: 1150, priceBasis: 'USD/MT', amount: 57500, remarks: 'PVC film + seaworthy packing' }
      ],
      notes: ['示例合同，用于演示合同归档与交易条款。'], createdAt: now
    },
    {
      id: 'quote_deccan_409l', recordType: 'quotation', reference: 'QT-2026-102', quoteDate: '2026-10-14',
      customer: 'Deccan Exhaust Components', supplier: 'Altai Stainless（演示）', currency: 'USD', total: 54240,
      taxIncluded: false, delivery: 'FOB Shanghai', payment: '20% deposit, 80% before shipment',
      leadTime: '28–35 days', validity: '10 days', status: 'sent',
      lineItems: [
        { product: 'Slit coil', grade: '409L/2D', specification: '1.2 × 186 / 242 mm', quantity: 48, unit: 'MT', weightKg: 48000, unitPrice: 1130, priceBasis: 'USD/MT', amount: 54240, remarks: 'Slit edge, ID 508 mm' }
      ],
      notes: ['示例公开报价结构，不含真实商业条件。'], createdAt: now
    },
    {
      id: 'quote_gulf_441', reference: 'Q-2026-103', customer: 'Gulf Thermal Equipment', status: 'pending_approval',
      quoteDate: '2026-10-16', input: { currency: 'USD', weightMt: 30, materialPerMt: 1210, processingPerMt: 35, freightPerMt: 58, packagingTotal: 420, fixedFees: 520, financeRate: 1.2, riskRate: 1, marginRate: 7, fxRate: 7.08, fxDate: '2026-10-16', fxSource: 'demo' },
      result: { material: 36300, processing: 1050, freight: 1740, finance: 480.36, risk: 400.3, costBeforeMargin: 40910.66, quoteTotal: 43990, quotePerMt: 1466.33, grossProfit: 3079.34, grossMargin: 0.07, localCurrencyTotal: 311449.2 },
      createdAt: now
    },
    {
      id: 'contract_deccan_trial', recordType: 'contract', reference: 'SC-2026-016', quoteDate: '2026-10-10',
      customer: 'Deccan Exhaust Components', supplier: 'Altai Stainless（演示）', currency: 'USD', total: 11300,
      taxIncluded: false, delivery: 'FOB Shanghai', payment: '100% T/T before shipment',
      leadTime: '20–25 days', validity: 'Trial order confirmed', status: 'completed',
      lineItems: [
        { product: 'Slit coil trial lot', grade: '409L/2D', specification: '1.2 × 186 mm', quantity: 10, unit: 'MT', weightKg: 10000, unitPrice: 1130, priceBasis: 'USD/MT', amount: 11300, remarks: 'Trial production lot' }
      ],
      notes: ['演示用试单合同。'], createdAt: now
    }
  ],
  integrations: [
    { id: 'website', name: 'Altai 官网', category: 'owned', status: 'active', mode: 'RFQ 待接入', account: 'altai-stainless.netlify.app', capabilities: ['RFQ', 'UTM', '内容发布'], updatedAt: now },
    { id: 'tiktok', name: 'TikTok', category: 'social', status: 'registered', mode: '待开发者授权', account: '@wuxi.stainless.st', capabilities: ['视频', '草稿', '数据'], updatedAt: now },
    { id: 'linkedin', name: 'LinkedIn', category: 'social', status: 'not_started', mode: '预留', account: '演示账号（未连接）', capabilities: ['图文', '视频', '公司页'], updatedAt: now },
    { id: 'facebook', name: 'Facebook / Instagram', category: 'social', status: 'not_started', mode: '预留', account: '演示主页（未连接）', capabilities: ['Page', 'Reels', '评论'], updatedAt: now },
    { id: 'youtube', name: 'YouTube', category: 'social', status: 'not_started', mode: '预留', account: '演示频道（未连接）', capabilities: ['视频', 'Shorts', '数据'], updatedAt: now },
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'messaging', status: 'not_started', mode: '预留', account: '演示号码（未连接）', capabilities: ['消息', '模板', '线索'], updatedAt: now },
    { id: 'email', name: '企业邮箱', category: 'messaging', status: 'not_started', mode: '预留', account: 'sales@example.com（演示）', capabilities: ['收件', '草稿', '跟进'], updatedAt: now },
    { id: 'douyin', name: '抖音', category: 'social', status: 'not_started', mode: '预留', account: '演示企业号（未连接）', capabilities: ['视频', '企业号'], updatedAt: now },
    { id: 'wechat', name: '微信生态', category: 'social', status: 'not_started', mode: '辅助发布', account: '演示账号（未连接）', capabilities: ['公众号', '视频号', '企业微信'], updatedAt: now },
    { id: 'marketplaces', name: 'B2B 平台', category: 'marketplace', status: 'not_started', mode: '预留', account: '演示店铺（未连接）', capabilities: ['Alibaba', 'Made-in-China', 'RFQ'], updatedAt: now },
    { id: 'mysteel', name: 'Mysteel 行情', category: 'market_data', status: 'active', mode: '公开行情示例已归档', account: '公开网页', capabilities: ['公开报价', '历史曲线', '人工复核'], updatedAt: now },
    { id: 'mini_program', name: '小程序报价', category: 'market_data', status: 'active', mode: '公开报价原图已归档', account: '公开图片源', capabilities: ['原图归档', '日期排序', '来源追溯'], updatedAt: now }
  ],
  activity: [
    { id: 'activity_seed', type: 'system', title: '公开演示工作台已初始化', detail: '客户、RFQ、报价、合同、行情和内容示例均已加载。', createdAt: now },
    { id: 'activity_quote', type: 'quote', title: 'QT-2026-101 已批准', detail: 'Aurora Kitchen Systems · 430/2B · 25 MT。', createdAt: now },
    { id: 'activity_contract', type: 'contract', title: 'SC-2026-018 已进入执行', detail: '示例合同已关联报价与 RFQ。', createdAt: now },
    { id: 'activity_market', type: 'market', title: '10月16日公开行情已确认', detail: '4 条示例价格已进入折线图。', createdAt: now }
  ],
  marketSnapshots: demoMarketSnapshots,
  marketPrices: demoMarketPrices
};

