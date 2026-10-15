export class ConnectorRegistry {
  #connectors = new Map();

  register(connector) {
    const canPublish = typeof connector?.publish === 'function';
    const canSaveDraft = typeof connector?.saveDraft === 'function';
    if (!connector?.id || (!canPublish && !canSaveDraft)) {
      throw new Error('Connector must provide id and at least publish() or saveDraft().');
    }
    this.#connectors.set(connector.id, connector);
  }

  get(id) {
    return this.#connectors.get(id);
  }

  list() {
    return [...this.#connectors.values()].map(connector => ({
      id: connector.id,
      label: connector.label,
      capabilities: connector.capabilities || [
        ...(typeof connector.saveDraft === 'function' ? ['draft'] : []),
        ...(typeof connector.publish === 'function' ? ['publish'] : [])
      ]
    }));
  }

  async saveDraft(id, payload, context = {}) {
    const connector = this.get(id);
    if (!connector) throw new Error(`Connector not found: ${id}`);
    if (typeof connector.saveDraft !== 'function') throw new Error(`Connector does not support drafts: ${id}`);
    return connector.saveDraft(payload, context);
  }
}

export const connectorRegistry = new ConnectorRegistry();
