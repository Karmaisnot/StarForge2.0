// Session helpers for the StarForge backend's opaque bearer credential.
// The backend returns this key from /auth/login/; it is never written to a
// build-time Vite variable or rendered in the UI.

import { API_CONFIG } from './config.js';
import { ApiError, httpRequest } from './http.js';

export const AUTH_SESSION_CHANGED = 'sf-auth-session-changed';

function readStoredToken() {
  try {
    return localStorage.getItem(API_CONFIG.tokenKey) || '';
  } catch {
    return '';
  }
}

function notifySessionChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
}

export function authSessionSource() {
  if (readStoredToken()) return 'storage';
  return API_CONFIG.token ? 'environment' : null;
}

export function hasAuthSession() {
  return Boolean(authSessionSource());
}

export function saveAuthToken(token) {
  const normalized = String(token || '').trim();
  if (!normalized) throw new ApiError(0, 'The server did not return a session key.');

  try {
    localStorage.setItem(API_CONFIG.tokenKey, normalized);
  } catch {
    throw new ApiError(0, 'The browser could not save this session.');
  }
  notifySessionChange();
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(API_CONFIG.tokenKey);
  } catch {
    // The in-memory UI must still reflect the signed-out state.
  }
  notifySessionChange();
}

export async function loginWithPassword({ username, password }) {
  const cleanUsername = String(username || '').trim();
  if (!cleanUsername || !password) throw new ApiError(400, 'Username and password are required.');

  const result = await httpRequest('POST', '/api/v1/auth/login/', {
    body: { username: cleanUsername, password, platform: 'web' },
    // A stale credential must not be sent while replacing a session.
    auth: false,
  });
  saveAuthToken(result?.access);
  return result;
}

export async function logoutCurrentSession() {
  try {
    // The backend invalidates its server-side opaque session here.
    await httpRequest('POST', '/api/v1/auth/logout/');
  } finally {
    // Local data must not stay visible if the network request fails.
    clearAuthToken();
  }
}
