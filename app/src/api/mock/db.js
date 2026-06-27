// In-memory mock database with localStorage persistence.
//
// This is the mock server's storage engine — it stands in for the real backend
// until that backend exists. It seeds from the resource registry on first use
// and persists every write, so data added in the UI survives a reload exactly
// like it did before this refactor (just behind the API boundary now).

import { RESOURCES } from '../resources.js';

const STORAGE_KEY = 'sf-mock-db-v1';

// Seeds are plain JSON-safe rows; a structural clone keeps the dataset's
// exported arrays immutable no matter what the UI does to its copy.
const clone = (value) => JSON.parse(JSON.stringify(value));

let cache = null;

function seedAll() {
  const out = {};
  for (const [name, def] of Object.entries(RESOURCES)) {
    out[name] = clone(def.seed() || []);
  }
  return out;
}

function loadDb() {
  if (cache) return cache;
  let persisted = {};
  try {
    persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    persisted = {};
  }
  // Persisted collections win (they carry the user's edits); any collection not
  // yet persisted starts from its seed.
  cache = { ...seedAll(), ...persisted };
  return cache;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full / unavailable — non-fatal for a demo console */
  }
}

export function getCollection(name) {
  const db = loadDb();
  if (!Array.isArray(db[name])) db[name] = [];
  return db[name];
}

export function setCollection(name, list) {
  loadDb()[name] = list;
  persist();
}

// A deep-cloned snapshot of every collection — used to hydrate the store's
// first paint synchronously while in mock mode.
export function snapshotAll() {
  return clone(loadDb());
}

// Wipe persistence and re-seed (the Settings "reset demo data" action).
export function resetDb() {
  cache = seedAll();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return snapshotAll();
}
