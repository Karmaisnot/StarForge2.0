// Mock REST server. Implements the exact contract the real backend will expose,
// so the resource layer can route to it transparently:
//
//   GET    /<resource>          → list
//   POST   /<resource>          → create
//   PATCH  /<resource>/<id>     → update (partial)
//   DELETE /<resource>/<id>     → remove
//
// It reads/writes the in-memory DB and simulates network latency so loading
// states are real. Swap VITE_USE_MOCK=false and the identical calls hit
// httpRequest instead — no caller changes.

import { API_CONFIG } from '../config.js';
import { idKeyOf } from '../resources.js';
import { getCollection, setCollection } from './db.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const delay = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve());

let seq = 0;
const genId = () => `id-${Date.now().toString(36)}-${(seq++).toString(36)}`;

class MockError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'MockError';
    this.status = status;
  }
}

// "/students/00042" → { name: 'students', id: '00042' }
function parsePath(path) {
  const clean = String(path).split('?')[0].replace(/^\/+|\/+$/g, '');
  const [name, ...rest] = clean.split('/');
  return { name, id: rest.length ? decodeURIComponent(rest.join('/')) : undefined };
}

export async function mockRequest(method, path, { body } = {}) {
  await delay(API_CONFIG.mockLatency);
  const { name, id } = parsePath(path);
  if (!name) throw new MockError(400, 'Missing resource');
  const idKey = idKeyOf(name);
  const list = getCollection(name);

  switch (method) {
    case 'GET': {
      if (id === undefined) return clone(list);
      const found = list.find((it) => String(it[idKey]) === String(id));
      if (!found) throw new MockError(404, `${name}/${id} not found`);
      return clone(found);
    }
    case 'POST': {
      const item = { ...(body || {}) };
      if (item[idKey] === undefined || item[idKey] === null || item[idKey] === '') item[idKey] = genId();
      // New rows go to the front, matching the previous store's default.
      setCollection(name, [item, ...list]);
      return clone(item);
    }
    case 'PUT':
    case 'PATCH': {
      let updated = null;
      const next = list.map((it) => {
        if (String(it[idKey]) !== String(id)) return it;
        updated = method === 'PUT' ? { ...(body || {}), [idKey]: it[idKey] } : { ...it, ...(body || {}) };
        return updated;
      });
      if (!updated) throw new MockError(404, `${name}/${id} not found`);
      setCollection(name, next);
      return clone(updated);
    }
    case 'DELETE': {
      const next = list.filter((it) => String(it[idKey]) !== String(id));
      setCollection(name, next);
      return { ok: true, id };
    }
    default:
      throw new MockError(405, `Unsupported method ${method}`);
  }
}
