async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'ChatGPT 账号连接请求失败。');
    error.network = payload.network;
    throw error;
  }
  return payload;
}

export function getChatGptConnectionStatus() {
  return request('./api/ai/chatgpt/status');
}

export function startChatGptAuthorization() {
  return request('./api/ai/chatgpt/start', { method: 'POST' });
}

export function disconnectChatGpt() {
  return request('./api/ai/chatgpt/disconnect', { method: 'POST' });
}

export function getChatGptModels() {
  return request('./api/ai/chatgpt/models');
}

export function generateChatGptVideoPlan(payload) {
  return request('./api/ai/chatgpt/content/video-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
