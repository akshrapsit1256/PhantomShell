const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status = 500, errorType = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorType = errorType;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutMs = options.timeout || 120000; // 120 seconds timeout for 2B local AI generation
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      let message = 'An unexpected error occurred.';
      let errorType = 'HTTP_ERROR';

      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (data.detail && typeof data.detail === 'object') {
          message = data.detail.message || message;
          errorType = data.detail.error_type || errorType;
        } else if (data.message) {
          message = data.message;
          errorType = data.error_type || errorType;
        }
      }

      throw new ApiError(message, res.status, errorType, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out waiting for the ghost to respond. The local model might be under load.',
        504,
        'TIMEOUT'
      );
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Network error connecting to PhantomShell backend.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const api = {
  // System Health
  getHealth: () => request('/api/health', { timeout: 10000 }),

  // Haunted Terminal Chat
  sendChat: (payload) => request('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Error Exorcist
  analyzeError: (payload) => request('/api/errors/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Command Oracle
  explainCommand: (payload) => request('/api/commands/explain', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Code Crypt
  analyzeCode: (payload) => request('/api/code/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Session Journal
  listJournal: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.entry_type) qs.set('entry_type', params.entry_type);
    if (params.limit) qs.set('limit', params.limit);
    if (params.offset) qs.set('offset', params.offset);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/api/journal${query}`, { timeout: 10000 });
  },
  getJournalEntry: (id) => request(`/api/journal/${id}`, { timeout: 10000 }),
  createJournalEntry: (payload) => request('/api/journal', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteJournalEntry: (id) => request(`/api/journal/${id}`, {
    method: 'DELETE'
  }),
  checkSecrets: (text) => request('/api/journal/check-secrets', {
    method: 'POST',
    body: JSON.stringify({ text })
  }),

  // Settings
  getSettings: () => request('/api/settings', { timeout: 10000 }),
  updateSettings: (payload) => request('/api/settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  testOllamaConnection: (payload) => request('/api/settings/test-connection', {
    method: 'POST',
    body: JSON.stringify(payload),
    timeout: 15000
  })
};

export { ApiError };
