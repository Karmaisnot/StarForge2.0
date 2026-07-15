// Real HTTP client. A thin, framework-free wrapper over fetch that the resource
// layer uses when the mock server is off. Handles base URL, JSON, bearer auth,
// query params, timeouts and a typed error — everything the pages would
// otherwise have to repeat.

import { API_CONFIG } from './config.js';

export class ApiError extends Error {
  constructor(status, message, data, requestId, retryAfter) {
    super(message || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = data && typeof data === 'object' ? data.code : undefined;
    this.errors = data && typeof data === 'object' ? data.errors : undefined;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
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

function currentLanguage() {
  try {
    return localStorage.getItem('sf-lang') || navigator.language?.slice(0, 2) || 'uz';
  } catch {
    return 'uz';
  }
}

function requestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `sf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function unwrapEnvelope(data, status, id, withMeta) {
  if (!data || typeof data !== 'object' || !('success' in data)) {
    return withMeta ? { data, pagination: undefined } : data;
  }
  if (data.success === false) throw new ApiError(status, data.message, data, id);
  return withMeta ? { data: data.data, pagination: data.pagination } : data.data;
}

export async function httpRequest(method, path, { params, body, signal, timeout = 15000, withMeta = false, auth = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = authToken();
  const id = requestId();
  let abortedByCaller = Boolean(signal?.aborted);
  const markCallerAbort = () => {
    abortedByCaller = true;
  };
  signal?.addEventListener('abort', markCallerAbort, { once: true });

  // Supplying a caller signal used to disable the timeout entirely. Combine both
  // cancellation sources so navigation cancellation and the safety timeout work
  // together on every request.
  let requestSignal = controller.signal;
  if (signal) {
    if (typeof AbortSignal.any === 'function') {
      requestSignal = AbortSignal.any([controller.signal, signal]);
    } else {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const res = await fetch(buildUrl(path, params), {
      method,
      headers: {
        Accept: 'application/json',
        'Accept-Language': currentLanguage(),
        'X-Request-ID': id,
        ...(body != null ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: requestSignal,
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    const responseId = res.headers.get('X-Request-ID') || id;
    if (!res.ok) {
      const message = data && typeof data === 'object' ? data.message || data.error : undefined;
      throw new ApiError(res.status, message || res.statusText, data, responseId, res.headers.get('Retry-After'));
    }
    return unwrapEnvelope(data, res.status, responseId, withMeta);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError(0, abortedByCaller ? 'Request aborted' : 'Request timed out', undefined, id);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', markCallerAbort);
  }
}
