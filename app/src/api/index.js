// Public API surface. Everything outside this folder imports from here.
//
// `api(name)` returns the CRUD bundle for a collection. Whether those calls go
// to the mock server or the real backend is decided once, here, by config — the
// store and pages are identical either way. Tomorrow's "connect the API" is a
// `.env` flip, not a code change.

import { API_CONFIG } from './config.js';
import { httpRequest, ApiError } from './http.js';
import { mockRequest } from './mock/server.js';
import { snapshotAll, resetDb } from './mock/db.js';
import { idKeyOf, RESOURCE_NAMES } from './resources.js';

// The one branch point in the whole data layer.
const request = API_CONFIG.useMock ? mockRequest : httpRequest;

export function api(name) {
  const base = `/${name}`;
  return {
    list: (params) => request('GET', base, { params }),
    get: (id) => request('GET', `${base}/${encodeURIComponent(id)}`),
    create: (item) => request('POST', base, { body: item }),
    update: (id, patch) => request('PATCH', `${base}/${encodeURIComponent(id)}`, { body: patch }),
    replace: (id, item) => request('PUT', `${base}/${encodeURIComponent(id)}`, { body: item }),
    remove: (id) => request('DELETE', `${base}/${encodeURIComponent(id)}`),
  };
}

// Synchronous full snapshot for first-paint hydration. Only meaningful in mock
// mode; against the real backend the store loads asynchronously instead.
export function mockSnapshot() {
  return API_CONFIG.useMock ? snapshotAll() : {};
}

// Reset to seed data (Settings → reset demo). No-op identifier for real mode,
// where the server owns the data.
export function resetData() {
  return API_CONFIG.useMock ? resetDb() : {};
}

export { API_CONFIG, ApiError, idKeyOf, RESOURCE_NAMES };
