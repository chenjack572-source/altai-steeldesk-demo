import { dialog, pageHeader, selectField } from '../ui/components.js';
import { escapeHtml } from '../core/format.js';

export function renderSettings(state) {
  const settings = state.settings.find(item => item.id === 'app') || {};
  const aiScopes = new Set(settings.aiFeatureScopes || ['content_drafting', 'translation', 'rfq_review', 'reply_drafting']);
  const aiEnabled = Boolean(settings.aiEnabled);
  const aiConnected = settings.aiConnectionStatus === 'connected';
  const aiProvider = settings.aiProvider || 'none';
  const connectionLabel = {
    connected: '模型已连接', authorizing: '等待账号授权', error: '连接需要处理', signed_out: '账号已断开', not_configured: '已允许 · 未连接'
  }[settings.aiConnectionStatus] || (aiEnabled ? '已允许 · 未连接' : '默认关闭');
  return `${pageHeader({
    eyebrow: 'SYSTEM / LOCAL FIRST', title: '设置与数据',
    description: '数据保存在此浏览器的本地数据库中。建议每周导出一个备份文件。'
  })}
  <section class="settings-grid">
    <article class="panel settings-panel"><header class="panel__header"><div><p class="eyebrow">POLICY</p><h2>执行边界</h2></div><span>已锁定</span></header>
      <div class="policy-list"><label><input type="checkbox" checked disabled /><span>发布内容必须审批</span></label><label><input type="checkbox" checked disabled /><span>客户消息必须审批</span></label><label><input type="checkbox" checked disabled /><span>正式报价必须审批</span></label><label><input type="checkbox" checked disabled /><span>AI 只能由你主动触发</span></label></div>
    </article>
    <article class="panel settings-panel"><header class="panel__header"><div><p class="eyebrow">APPEARANCE</p><h2>界面设置</h2></div></header>
      <form id="appearance-form" class="form-grid form-grid--single">${selectField({ id: 'theme-setting', label: '主题', value: localStorage.getItem('steeldesk:theme') || 'system', options: [{value:'system',label:'跟随系统'},{value:'light',label:'浅色'},{value:'dark',label:'深色'}] })}</form>
    </article>
    <article class="panel settings-panel settings-panel--wide ai-settings-panel"><header class="panel__header"><div><p class="eyebrow">AI / HUMAN CONTROL</p><h2>AI 模型辅助</h2></div><span class="ai-connection-state ${aiConnected ? 'is-connected' : ''}">${escapeHtml(aiEnabled ? connectionLabel : '默认关闭')}</span></header>
      <form id="ai-settings-form" class="ai-settings-form">
        <div class="ai-master-control">
          <label for="ai-enabled"><input id="ai-enabled" name="aiEnabled" type="checkbox" ${aiEnabled ? 'checked' : ''} aria-describedby="ai-enabled-help" /><span><strong>允许工作台使用 AI 辅助</strong><small id="ai-enabled-help">这个开关只代表授权意愿，不会自动获得 API、不会自动调用模型，也不会自动产生费用。</small></span></label>
          <b>${aiEnabled ? 'ON' : 'OFF'}</b>
        </div>
        <div class="ai-config" data-ai-config ${aiEnabled ? '' : 'hidden'}>
          <div class="ai-config__connection">
            ${selectField({ id: 'ai-provider', label: '连接方式', value: aiProvider, options: [{value:'none',label:'尚未连接模型'},{value:'openai_api',label:'OpenAI API · 本机安全连接器'},{value:'chatgpt_signin',label:'使用 ChatGPT 账号授权'}], help: aiProvider === 'chatgpt_signin' ? '授权凭据只保存在这台电脑的受保护运行目录，不进入浏览器数据库或备份。' : 'API 密钥不会保存在浏览器数据库中；需要由本机安全连接器读取。' })}
            <div class="ai-connection-facts"><span>连接状态</span><strong>${escapeHtml(aiConnected ? '可用' : connectionLabel)}</strong><small>${aiConnected ? '使用 ChatGPT 计划 · 仅在手动触发时调用' : '本次会话调用：0 · 当前不会产生模型调用'}</small>${settings.aiNetworkRoute ? `<small>网络路由：${escapeHtml(settings.aiNetworkRoute === 'proxy' ? `代理 ${settings.aiNetworkProxy || settings.aiNetworkSource || ''}` : settings.aiNetworkRoute === 'direct' ? '直连' : '待检测')}</small>` : ''}</div>
          </div>
          ${renderChatGptConnection(settings, aiProvider)}
          <fieldset class="ai-scope-fieldset"><legend>允许 AI 协助的范围</legend><div class="ai-scope-grid">
            ${aiScope('content_drafting', '内容草稿', '根据母稿生成各平台文案、标题和 CTA', aiScopes)}
            ${aiScope('translation', '翻译与本地化', '把已确认内容改写为目标市场语言', aiScopes)}
            ${aiScope('rfq_review', 'RFQ 完整度检查', '识别缺失规格并建议追问项目', aiScopes)}
            ${aiScope('reply_drafting', '客户回复草稿', '生成邮件或消息草稿，发送前仍需审批', aiScopes)}
            ${aiScope('market_summary', '市场信息摘要', '归纳行情、平台动态与公开资料', aiScopes)}
          </div></fieldset>
          <div class="ai-guardrail"><strong>不会交给 AI 的动作</strong><p>模型不能自行发送消息、发布内容、确认报价或修改客户记录。模型输出只会成为待检查草稿。</p></div>
          <div class="button-row"><button class="button button--ghost" type="button" data-action="test-ai-connection">测试模型连接</button><button class="text-button" type="button" data-action="open-ai-setup">连接方式说明</button></div>
        </div>
        <div class="ai-settings-footer"><button class="button button--primary" type="submit">保存 AI 设置</button></div>
      </form>
    </article>
    <article class="panel settings-panel settings-panel--wide"><header class="panel__header"><div><p class="eyebrow">BACKUP</p><h2>备份与迁移</h2></div><span>IndexedDB</span></header>
      <p>备份包含任务、客户、询盘、内容、审批、供应商、报价、平台占位和设置。它不会包含未来平台的密码或密钥。</p>
      <div class="button-row"><button class="button button--primary" data-action="export-data">导出 JSON 备份</button><label class="button button--ghost file-button">导入备份<input id="import-data" type="file" accept="application/json,.json" /></label><button class="button button--ghost" data-action="open-reset-dialog">恢复示例数据</button></div>
    </article>
  </section>
  ${dialog('ai-setup-dialog', 'AI 模型如何连接？', `<div class="ai-setup-explainer"><p>工作台不会继承当前 Codex 会话的模型权限，也不会自动获取 OpenAI API。你需要单独选择一种连接方式：</p><ol><li><strong>使用 ChatGPT 账号授权</strong><span>在浏览器中登录并授权本机 SteelDesk。符合条件的 ChatGPT Plus 或 Pro 账号可以使用计划额度；不会开放你的历史对话。</span></li><li><strong>OpenAI API</strong><span>使用你自己的 OpenAI Platform 项目与用量计费。密钥由本机安全连接器保存，不能写入浏览器或备份文件。</span></li></ol><p class="ai-setup-explainer__note">无论哪种方式，只有在你点击某个明确的“AI 生成 / AI 检查”按钮时才允许调用。</p><a class="button button--ghost" href="https://developers.openai.com/siwc/quickstart" target="_blank" rel="noreferrer">查看 OpenAI 官方说明 ↗</a></div>`, '<button class="button button--primary" value="cancel">我知道了</button>')}
  ${dialog('reset-dialog', '恢复示例数据？', '<p>现有任务、客户、询盘、内容、报价与审批记录都会被示例数据覆盖。建议先导出备份。</p>', '<button class="button button--ghost" value="cancel">取消</button><button class="button button--danger" type="button" data-action="confirm-reset">确认恢复</button>')}`;
}

function renderChatGptConnection(settings, provider) {
  if (provider !== 'chatgpt_signin') return '';
  const connected = settings.aiConnectionStatus === 'connected';
  const email = escapeHtml(settings.aiConnectionAccount || '已授权账号');
  const message = escapeHtml(settings.aiConnectionMessage || '连接后，工作台可在你手动点击时调用模型生成草稿。');
  if (connected) {
    return `<section class="chatgpt-connection is-connected" aria-label="ChatGPT 账号连接">
      <div class="chatgpt-connection__mark" aria-hidden="true">✓</div>
      <div><p class="eyebrow">CONNECTED ACCOUNT</p><h3>${email}</h3><p>ChatGPT 计划使用权限已连接。工作台看不到你的历史对话，也不会在后台自行调用。</p>${settings.aiConnectionModelCount ? `<small>已检测到 ${escapeHtml(settings.aiConnectionModelCount)} 个当前账号可用模型。</small>` : ''}</div>
      <div class="chatgpt-connection__actions"><a class="button button--ghost" href="https://chatgpt.com/settings/usage" target="_blank" rel="noreferrer">管理用量 ↗</a><button class="text-button text-button--danger" type="button" data-action="disconnect-chatgpt">断开账号</button></div>
    </section>`;
  }
  const waiting = settings.aiConnectionStatus === 'authorizing';
  const failed = settings.aiConnectionStatus === 'error';
  return `<section class="chatgpt-connection ${failed ? 'is-error' : ''}" aria-label="ChatGPT 账号连接" ${failed ? 'role="alert"' : ''}>
    <div class="chatgpt-connection__mark" aria-hidden="true">${failed ? '!' : 'AI'}</div>
    <div><p class="eyebrow">${failed ? 'CONNECTION BLOCKED' : 'CHATGPT PLAN'}</p><h3>${waiting ? '请在浏览器完成授权' : failed ? '连接需要处理' : '连接你的 ChatGPT 账号'}</h3><p>${message}</p><small>${failed ? '这不会开启模型调用，也不会产生费用。' : '凭据保存在本机运行目录，不会写入 IndexedDB、JSON 备份或源码。'}</small></div>
    <button class="button button--primary" type="button" data-action="connect-chatgpt" ${waiting ? 'aria-busy="true"' : ''}>${waiting ? '重新打开授权' : failed ? '重新尝试连接' : 'Continue with ChatGPT'}</button>
  </section>`;
}

function aiScope(value, title, description, selected) {
  return `<label><input type="checkbox" name="aiFeatureScopes" value="${value}" ${selected.has(value) ? 'checked' : ''} /><span><strong>${title}</strong><small>${description}</small></span></label>`;
}
