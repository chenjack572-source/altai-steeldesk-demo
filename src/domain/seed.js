import { daysFromNow, today } from '../core/format.js';

const now = new Date().toISOString();

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
    { id: 'task_content', title: '审核 430 与 304 选材内容草稿', group: '内容', priority: 'medium', dueDate: today(), completed: false, createdAt: now },
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
      website: '', source: '展会名录', nextAction: '索取月度用量和钢厂准入要求', nextActionAt: daysFromNow(1),
      notes: '避免普通大宗 430 价格竞争，强调稳定规格与加工。', createdAt: now
    },
    {
      id: 'company_korea', name: 'Hanul Precision Parts', country: 'South Korea', city: 'Busan',
      segment: '泵阀及精密加工', stage: 'nurture', score: 61, priority: 'B', likelyGrades: '410 / 420',
      website: '', source: '行业协会', nextAction: '准备 JIS 对照资料', nextActionAt: daysFromNow(5),
      notes: '需要较强的证书、硬度和批次一致性证明。', createdAt: now
    }
  ],
  contacts: [],
  rfqs: [
    {
      id: 'rfq_001', reference: 'RFQ-2026-001', companyId: 'company_aurora', companyName: 'Aurora Kitchen Systems',
      country: 'Vietnam', product: 'Cold rolled coil', grade: '430', standard: 'ASTM A240', thickness: '0.6 mm',
      width: '1219 mm', finish: '', quantityMt: 25, incoterm: 'CIF', destination: '',
      status: 'needs_info', completeness: 72, dueAt: daysFromNow(2), notes: '等待表面、卷重和目的港。', createdAt: now
    },
    {
      id: 'rfq_002', reference: 'RFQ-2026-002', companyId: 'company_india', companyName: 'Deccan Exhaust Components',
      country: 'India', product: 'Slit coil', grade: '409L', standard: 'JIS G4305', thickness: '1.2 mm',
      width: '186 / 242 mm', finish: '2D', quantityMt: 48, incoterm: 'FOB', destination: 'Shanghai',
      status: 'mill_inquiry', completeness: 94, dueAt: daysFromNow(1), notes: '需要确认月度重复订单。', createdAt: now
    }
  ],
  content: [
    {
      id: 'content_430', title: '430 不是廉价版 304：如何按使用环境选材', pillar: '选材知识',
      channels: ['LinkedIn', 'TikTok'], language: '中/英', status: 'pending_approval',
      body: '从腐蚀环境、成形、磁性、焊接和成本波动五个维度解释 430 与 304 的区别。',
      scheduledAt: daysFromNow(1), createdAt: now
    },
    {
      id: 'content_409', title: '409L 排气系统材料询价时必须确认的 6 个参数', pillar: '采购指南',
      channels: ['官网', 'LinkedIn'], language: '英文', status: 'draft',
      body: '标准、厚度、宽度、表面、力学性能、钢厂批准和年用量。',
      scheduledAt: daysFromNow(4), createdAt: now
    },
    {
      id: 'content_factory', title: '代理钢厂订单如何保留炉号与 MTC 追溯', pillar: '质量证明',
      channels: ['TikTok'], language: '英文', status: 'idea',
      body: '展示从钢厂报价、材料标签到出口文件的追溯路径。',
      scheduledAt: daysFromNow(7), createdAt: now
    }
  ],
  approvals: [
    {
      id: 'approval_content_430', actionType: 'content_publish', entityType: 'content', entityId: 'content_430',
      title: '发布：430 不是廉价版 304', summary: 'LinkedIn 图文与 TikTok 脚本，中文和英文版本。',
      channel: 'LinkedIn, TikTok', recipient: '公开账号', status: 'pending', createdAt: now, updatedAt: now
    },
    {
      id: 'approval_message_gulf', actionType: 'customer_message', entityType: 'company', entityId: 'company_gulf',
      title: '客户跟进：Gulf Thermal Equipment', summary: '询问热交换器工作温度、介质和月度用量。',
      channel: 'Email', recipient: '采购部门（待确认）', status: 'pending', createdAt: now, updatedAt: now
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
  quotes: [],
  integrations: [
    { id: 'website', name: 'Altai 官网', category: 'owned', status: 'active', mode: 'RFQ 待接入', account: 'altai-stainless.netlify.app', capabilities: ['RFQ', 'UTM', '内容发布'], updatedAt: now },
    { id: 'tiktok', name: 'TikTok', category: 'social', status: 'registered', mode: '待开发者授权', account: '@wuxi.stainless.st', capabilities: ['视频', '草稿', '数据'], updatedAt: now },
    { id: 'linkedin', name: 'LinkedIn', category: 'social', status: 'not_started', mode: '预留', account: '', capabilities: ['图文', '视频', '公司页'], updatedAt: now },
    { id: 'facebook', name: 'Facebook / Instagram', category: 'social', status: 'not_started', mode: '预留', account: '', capabilities: ['Page', 'Reels', '评论'], updatedAt: now },
    { id: 'youtube', name: 'YouTube', category: 'social', status: 'not_started', mode: '预留', account: '', capabilities: ['视频', 'Shorts', '数据'], updatedAt: now },
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'messaging', status: 'not_started', mode: '预留', account: '', capabilities: ['消息', '模板', '线索'], updatedAt: now },
    { id: 'email', name: '企业邮箱', category: 'messaging', status: 'not_started', mode: '预留', account: '', capabilities: ['收件', '草稿', '跟进'], updatedAt: now },
    { id: 'douyin', name: '抖音', category: 'social', status: 'not_started', mode: '预留', account: '', capabilities: ['视频', '企业号'], updatedAt: now },
    { id: 'wechat', name: '微信生态', category: 'social', status: 'not_started', mode: '辅助发布', account: '', capabilities: ['公众号', '视频号', '企业微信'], updatedAt: now },
    { id: 'marketplaces', name: 'B2B 平台', category: 'marketplace', status: 'not_started', mode: '预留', account: '', capabilities: ['Alibaba', 'Made-in-China', 'RFQ'], updatedAt: now }
  ],
  activity: [
    { id: 'activity_seed', type: 'system', title: '本地工作台已初始化', detail: '示例数据已加载，可在设置中导出或恢复。', createdAt: now }
  ]
};
