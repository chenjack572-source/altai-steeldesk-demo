export const APPROVAL_TYPES = {
  CONTENT: 'content_publish',
  MESSAGE: 'customer_message',
  QUOTE: 'formal_quote'
};

const PRIORITY_DEFINITIONS = [
  {
    actionType: APPROVAL_TYPES.QUOTE,
    key: 'commercial', rank: 1, code: 'P1', tone: 'critical',
    label: '报价与合同', shortLabel: '报价 / 合同',
    description: '价格、毛利和正式交易条件，优先处理。'
  },
  {
    actionType: APPROVAL_TYPES.MESSAGE,
    key: 'communication', rank: 2, code: 'P2', tone: 'high',
    label: '客户邮件与消息', shortLabel: '邮件 / 消息',
    description: '直接影响客户响应和跟进节奏，其次处理。'
  },
  {
    actionType: APPROVAL_TYPES.CONTENT,
    key: 'content', rank: 3, code: 'P3', tone: 'normal',
    label: '内容发布', shortLabel: '公开内容',
    description: '营销公开动作，在商务沟通之后处理。'
  }
];

const FALLBACK_PRIORITY = {
  actionType: 'other', key: 'other', rank: 4, code: 'P4', tone: 'low',
  label: '其他受控操作', shortLabel: '其他操作',
  description: '未归类的外部动作，按普通优先级处理。'
};

export const APPROVAL_PRIORITIES = Object.freeze(PRIORITY_DEFINITIONS.map(item => Object.freeze({ ...item })));

export function approvalPriority(itemOrType) {
  const actionType = typeof itemOrType === 'string' ? itemOrType : itemOrType?.actionType;
  return APPROVAL_PRIORITIES.find(item => item.actionType === actionType) || FALLBACK_PRIORITY;
}

export function sortApprovalsByPriority(items) {
  return [...items].sort((a, b) => {
    const rankDifference = approvalPriority(a).rank - approvalPriority(b).rank;
    if (rankDifference) return rankDifference;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });
}

export function groupApprovalsByPriority(items, { includeEmpty = false } = {}) {
  const definitions = [...APPROVAL_PRIORITIES];
  if (items.some(item => approvalPriority(item).key === FALLBACK_PRIORITY.key)) definitions.push(FALLBACK_PRIORITY);
  return definitions
    .map(priority => ({
      priority,
      items: sortApprovalsByPriority(items.filter(item => approvalPriority(item).key === priority.key))
    }))
    .filter(group => includeEmpty || group.items.length);
}

export function filterApprovalsByPriority(items, priorityKey = 'all') {
  if (!priorityKey || priorityKey === 'all') return [...items];
  return items.filter(item => approvalPriority(item).key === priorityKey);
}

export function requiresApproval(actionType) {
  return Object.values(APPROVAL_TYPES).includes(actionType);
}

export function createApproval({ id, actionType, entityType, entityId, title, summary, channel, recipient }) {
  if (!requiresApproval(actionType)) throw new Error('This action does not require approval.');
  const now = new Date().toISOString();
  return {
    id,
    actionType,
    entityType,
    entityId,
    title,
    summary,
    channel: channel || '',
    recipient: recipient || '',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    reviewedAt: null,
    rejectionReason: ''
  };
}

export function reviewApproval(approval, decision, reason = '') {
  if (!['approved', 'rejected'].includes(decision)) throw new Error('Invalid approval decision.');
  if (approval.status !== 'pending') throw new Error('Only pending approvals can be reviewed.');
  return {
    ...approval,
    status: decision,
    rejectionReason: decision === 'rejected' ? reason : '',
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
