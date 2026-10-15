import { events } from './events.js';

export const routes = {
  dashboard: { label: '今日工作台', group: '工作', shortcut: '01' },
  crm: { label: '客户与线索', group: '销售', shortcut: '02' },
  rfqs: { label: 'RFQ 询盘', group: '销售', shortcut: '03' },
  pricing: { label: '报价与合同', group: '销售', shortcut: '04' },
  content: { label: '内容工作室', group: '增长', shortcut: '05' },
  approvals: { label: '审批中心', group: '增长', shortcut: '06' },
  suppliers: { label: '钢厂与供应商', group: '供应', shortcut: '07' },
  market: { label: '每日行情', group: '供应', shortcut: '08' },
  knowledge: { label: '400 系知识库', group: '供应', shortcut: '09' },
  integrations: { label: '平台连接', group: '系统', shortcut: '10' },
  settings: { label: '设置与数据', group: '系统', shortcut: '11' }
};

export class Router {
  current = 'dashboard';

  start() {
    const update = () => {
      const candidate = location.hash.replace(/^#\/?/, '').split('/')[0];
      this.current = routes[candidate] ? candidate : 'dashboard';
      events.emit('route:changed', this.current);
    };
    addEventListener('hashchange', update);
    update();
  }

  go(route) {
    if (!routes[route]) return;
    location.hash = `#/${route}`;
  }
}

export const router = new Router();
