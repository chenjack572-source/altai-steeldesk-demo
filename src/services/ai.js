export class DisabledAiProvider {
  id = 'disabled';
  label = 'AI 未启用';

  async generate() {
    throw new Error('AI 功能默认关闭。配置 AI 提供商后才会产生模型调用和费用。');
  }
}

export class AiService {
  #provider;

  constructor(provider = new DisabledAiProvider()) {
    this.#provider = provider;
  }

  get status() {
    return { id: this.#provider.id, label: this.#provider.label, enabled: this.#provider.id !== 'disabled' };
  }

  setProvider(provider) {
    if (!provider || typeof provider.generate !== 'function') throw new Error('AI provider is invalid.');
    this.#provider = provider;
  }

  generate(input, context) {
    return this.#provider.generate(input, context);
  }
}

export const aiService = new AiService();
