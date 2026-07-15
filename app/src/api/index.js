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
import { idKeyOf, RESOURCE_NAMES, RESOURCES } from './resources.js';
import { mapFromApi } from './adapters.js';

// The one branch point in the whole data layer.
const request = API_CONFIG.useMock ? mockRequest : httpRequest;
const MAX_PAGE_SIZE = 200;

function listPage(response) {
  // The deployed API uses { success, data: [], pagination }, while this also
  // tolerates a conventional { results: [] } list during staged migrations.
  const payload = response && typeof response === 'object' && 'data' in response ? response.data : response;
  const pagination = response?.pagination || payload?.pagination;
  if (Array.isArray(payload)) return { items: payload, pagination };
  if (Array.isArray(payload?.results)) return { items: payload.results, pagination };
  return { items: [], pagination };
}

function hasExplicitPage(params) {
  return Boolean(params && (Object.hasOwn(params, 'page') || Object.hasOwn(params, 'cursor')));
}

export function api(name) {
  const resource = RESOURCES[name];
  const isLive = !API_CONFIG.useMock;
  const base = isLive ? resource?.path || `/${name}` : `/${name}`;
  const unavailable = isLive && !resource?.path;
  const detail = (id) => `${base}${encodeURIComponent(id)}/`;
  const map = (value) => (isLive ? mapFromApi(name, value) : value);
  const unsupported = () => Promise.reject(new ApiError(501, `The live API has no endpoint for "${name}" yet.`));
  // Legacy forms use presentation-only fields (for example `n`, `mgr`, and
  // display labels). Sending those straight to a live endpoint could delete
  // or corrupt real data, so writes stay explicitly blocked until each screen
  // gets an endpoint-specific input adapter.
  const unsupportedWrite = () => Promise.reject(new ApiError(501, `The live "${name}" screen is read-only until its write adapter is implemented.`));

  const list = async (params) => {
    const pageRequested = hasExplicitPage(params);
    const firstParams = isLive && !pageRequested
      ? { ...(params || {}), page_size: params?.page_size || MAX_PAGE_SIZE }
      : params;
    const firstResponse = await request('GET', base, { params: firstParams, withMeta: isLive });
    const first = listPage(firstResponse);
    const pagination = first.pagination;

    // Existing screens calculate their metrics and client-side search from one
    // collection. Pull the remaining server pages in parallel so those figures
    // are complete instead of silently reflecting only the first 25/200 rows.
    if (!isLive || pageRequested || !pagination?.has_next || !Number.isFinite(Number(pagination?.pages))) {
      return map(first.items);
    }

    const currentPage = Number(pagination.page) || 1;
    const totalPages = Number(pagination.pages);
    const remainingPages = Array.from({ length: Math.max(0, totalPages - currentPage) }, (_, index) => currentPage + index + 1);
    if (!remainingPages.length) return map(first.items);

    const rest = await Promise.all(
      remainingPages.map((page) => request('GET', base, { params: { ...firstParams, page }, withMeta: true })),
    );
    return map([...first.items, ...rest.flatMap((response) => listPage(response).items)]);
  };

  if (unavailable) {
    return {
      list: () => Promise.resolve([]),
      get: unsupported,
      create: unsupported,
      update: unsupported,
      replace: unsupported,
      remove: unsupported,
    };
  }

  return {
    list,
    get: (id) => request('GET', detail(id)).then(map),
    create: isLive ? unsupportedWrite : (item) => request('POST', base, { body: item }).then(map),
    update: isLive ? unsupportedWrite : (id, patch) => request('PATCH', detail(id), { body: patch }).then(map),
    replace: isLive ? unsupportedWrite : (id, item) => request('PUT', detail(id), { body: item }).then(map),
    remove: isLive ? unsupportedWrite : (id) => request('DELETE', detail(id)),
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
