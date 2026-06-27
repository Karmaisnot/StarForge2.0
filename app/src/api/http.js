// Real HTTP client. A thin, framework-free wrapper over fetch that the resource
// layer uses when the mock server is off. Handles base URL, JSON, bearer auth,
// query params, timeouts and a typed error — everything the pages would
// otherwise have to repeat.

import { API_CONFIG } from './config.js';

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// A runtime token (set after login) wins over the build-time env token.
function authToken() {
  try {
    const t = localStorage.getItem(API_CONFIG.tokenKey);
    if (t) return t;
  } catch {
    /* localStorage unavailable — fall back to env token */
  }
  return API_CONFIG.token || '';
}

function buildUrl(path, params) {
  let url = API_CONFIG.baseUrl + path;
  if (params && typeof params === 'object') {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (entries.length) {
      const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }
  return url;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function httpRequest(method, path, { params, body, signal, timeout = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = authToken();
  try {
    const res = await fetch(buildUrl(path, params), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body != null ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      const message = data && typeof data === 'object' ? data.message || data.error : undefined;
      throw new ApiError(res.status, message || res.statusText, data);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError(0, 'Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
