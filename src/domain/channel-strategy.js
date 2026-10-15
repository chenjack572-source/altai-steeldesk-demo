export const channelStrategy = {
  website: {
    rank: 5, priority: 1, role: '承接询盘', cost: 2, costLabel: '中', quality: 5, qualityLabel: '高', cycle: '中长期',
    bestFor: '官网询价、案例与资质背书',
    strength: '自有阵地，信息完整，长期积累搜索与品牌资产。',
    weakness: '不会自动带来流量，需要内容、搜索或其他平台导流。',
    action: '补齐 RFQ 表单与询盘来源追踪。'
  },
  tiktok: {
    rank: 6, priority: 2, role: '扩大触达', cost: 2, costLabel: '低－中', quality: 3, qualityLabel: '中', cycle: '快曝光、慢成交',
    bestFor: '库存实拍、加工能力、采购避坑',
    strength: '自然流量空间大，工厂与库存画面容易建立第一印象。',
    weakness: '泛流量较多，必须用规格、交期和应用问题筛选买家。',
    action: '每周稳定发布 3 条买家问题型短视频。'
  },
  linkedin: {
    rank: 2, priority: 1, role: '寻找决策人', cost: 2, costLabel: '低－中', quality: 5, qualityLabel: '高', cycle: '中期',
    bestFor: '采购经理、工程师、进口商',
    strength: '能按职位和公司找人，适合专业内容与定向开发。',
    weakness: '需要持续互动和主动触达，单靠公司页自然曝光有限。',
    action: '围绕应用选材与交付风险建立专业可信度。'
  },
  facebook: {
    rank: 7, priority: 2, role: '区域触达', cost: 3, costLabel: '中', quality: 3, qualityLabel: '中', cycle: '中期',
    bestFor: '东南亚、中东的经销商与中小买家',
    strength: '区域社群、Reels 与私信组合适合建立本地可见度。',
    weakness: '无效询价与价格试探较多，审核和跟进成本偏高。',
    action: '优先进入垂直行业社群，不急于做广泛广告。'
  },
  youtube: {
    rank: 8, priority: 2, role: '长期背书', cost: 4, costLabel: '中－高', quality: 4, qualityLabel: '中－高', cycle: '长期',
    bestFor: '工厂参观、加工流程、材质对比',
    strength: '内容寿命长，适合解释复杂采购问题并沉淀搜索流量。',
    weakness: '制作成本高，更新慢，不适合作为最先启动的渠道。',
    action: '先复用短视频素材，每月制作 1 条深度内容。'
  },
  whatsapp: {
    rank: 4, priority: 1, role: '询盘转化', cost: 1, costLabel: '低', quality: 5, qualityLabel: '高', cycle: '快速',
    bestFor: '接收规格、快速报价、持续跟进',
    strength: '沟通直接，买家回复门槛低，适合从内容转入具体询价。',
    weakness: '本身不是主要流量入口，过早推销容易被忽略或拉黑。',
    action: '统一欢迎语和规格收集模板，承接所有外部线索。'
  },
  email: {
    rank: 3, priority: 1, role: '主动开发', cost: 1, costLabel: '低', quality: 4, qualityLabel: '中－高', cycle: '中期',
    bestFor: '目标客户开发、正式报价与跟进',
    strength: '成本低、可追踪，适合针对具体公司和采购角色沟通。',
    weakness: '名单质量决定结果，群发和泛化文案回复率很低。',
    action: '建立目标公司清单，按应用场景发送个性化邮件。'
  },
  douyin: {
    rank: 10, priority: 3, role: '国内曝光', cost: 3, costLabel: '中', quality: 2, qualityLabel: '低－中', cycle: '不稳定',
    bestFor: '国内现货与加工服务曝光',
    strength: '短视频传播快，适合本地化库存和加工内容。',
    weakness: '与当前外贸买家目标重合度较低，容易吸引同行。',
    action: '低频复用内容，不作为当前主要投入。'
  },
  wechat: {
    rank: 9, priority: 3, role: '关系维护', cost: 1, costLabel: '低', quality: 4, qualityLabel: '中－高', cycle: '长期',
    bestFor: '国内客户、熟客复购与私域维护',
    strength: '适合长期关系、资料发送和成交后的持续服务。',
    weakness: '新增外贸客户能力有限，内容公开传播范围较窄。',
    action: '用于熟客维护，暂不单独建立重内容团队。'
  },
  marketplaces: {
    rank: 1, priority: 1, role: '获取现成询盘', cost: 4, costLabel: '中－高', quality: 4, qualityLabel: '中－高', cycle: '快速',
    bestFor: 'Alibaba、Made-in-China 的采购 RFQ',
    strength: '买家采购意图最明确，规格和数量通常更接近真实询盘。',
    weakness: '会员与竞价成本较高，同质报价多，价格竞争明显。',
    action: '先验证一个平台，以 RFQ 回复速度和合格率判断续投。'
  }
};

export const acquisitionStages = [
  { label: '发现买家', channels: ['B2B 平台', 'LinkedIn', '企业邮箱'] },
  { label: '建立信任', channels: ['TikTok', '官网', 'YouTube'] },
  { label: '接住询盘', channels: ['WhatsApp', '官网 RFQ', '企业邮箱'] },
  { label: '跟进成交', channels: ['WhatsApp', '企业邮箱', '微信'] }
];

export const priorityLabels = {
  1: { short: 'P1', label: '现在重点做', tone: 'core' },
  2: { short: 'P2', label: '稳定经营', tone: 'support' },
  3: { short: 'P3', label: '按需投入', tone: 'later' }
};

export function getChannelStrategy(id) {
  return channelStrategy[id] || {
    rank: 99, priority: 3, role: '待评估', cost: 3, costLabel: '待验证', quality: 3, qualityLabel: '待验证', cycle: '待验证',
    bestFor: '待补充', strength: '连接后根据实际数据评估。', weakness: '目前没有足够信息。', action: '先明确目标客户和使用方式。'
  };
}
