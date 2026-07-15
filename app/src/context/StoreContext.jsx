import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, idKeyOf, mockSnapshot, resetData, RESOURCE_NAMES, API_CONFIG } from '../api/index.js';
import { hasAuthSession } from '../api/auth.js';
import { enrichCollections } from '../api/adapters.js';

const StoreContext = createContext(null);

// Stable empty fallback so a not-yet-loaded collection doesn't hand out a fresh
// array each render (which would churn every consumer's memo).
const EMPTY = [];

// Some legacy views pass the human-readable label while the real API identifies
// records by an integer id. Matching the canonical id first, then stable legacy
// aliases, keeps existing controls working across both data sources.
const matchesRecord = (item, value, idKey) =>
  String(item?.[idKey]) === String(value) ||
  String(item?.id) === String(value) ||
  String(item?.n) === String(value) ||
  String(item?.key) === String(value);

// Server-backed store for every collection in the app.
//
// Reads come from `api(name).list()` and writes go through `api(name)` too, so
// the whole app talks to a server (the mock one today, the real one tomorrow —
// a `.env` flip). Mutations are optimistic: the UI updates immediately, the
// request runs in the background, and a failure rolls the change back. Pages
// keep the same `useCollection` surface, so none of this leaks into them.
//
// In mock mode the first paint is hydrated synchronously from the mock DB, so
// there is zero loading flash and behaviour matches the previous local store.
// Against the real backend the store starts empty and loads asynchronously.

const readyStatus = () => Object.fromEntries(RESOURCE_NAMES.map((n) => [n, 'ready']));

export function StoreProvider({ children }) {
  const [collections, setCollections] = useState(() => (API_CONFIG.useMock ? mockSnapshot() : {}));
  const [status, setStatus] = useState(() => (API_CONFIG.useMock ? readyStatus() : {}));
  const collectionsRef = useRef(collections);
  const requestEpoch = useRef(0);

  // Names whose load has already been kicked off (mock mode pre-seeds them all).
  const started = useRef(new Set(API_CONFIG.useMock ? RESOURCE_NAMES : []));

  const load = useCallback(async (name, epoch = requestEpoch.current) => {
    if (epoch !== requestEpoch.current) return false;
    setStatus((s) => ({ ...s, [name]: 'loading' }));
    try {
      const items = await api(name).list();
      if (epoch !== requestEpoch.current) return false;
      const next = enrichCollections({ ...collectionsRef.current, [name]: Array.isArray(items) ? items : [] });
      collectionsRef.current = next;
      setCollections(next);
      setStatus((s) => ({ ...s, [name]: 'ready' }));
      return true;
    } catch (err) {
      if (epoch !== requestEpoch.current) return false;
      console.error(`[store] failed to load "${name}"`, err);
      setStatus((s) => ({ ...s, [name]: 'error' }));
      started.current.delete(name); // allow a later retry
      return false;
    }
  }, []);

  // Lazily fetch a collection the first time a page asks for it.
  const ensure = useCallback(
    (name) => {
      if (started.current.has(name)) return;
      started.current.add(name);
      load(name);
    },
    [load],
  );

  // Against the real backend, warm every collection up front so cross-cutting
  // readers (nav badges, global search) have data without mounting each page.
  // A fresh live installation has no credential yet; avoid firing a burst of
  // unauthenticated requests before the user signs in from Settings.
  useEffect(() => {
    if (!API_CONFIG.useMock && hasAuthSession()) RESOURCE_NAMES.forEach(ensure);
  }, [ensure]);

  // Reload the complete live-data set after a session changes. An epoch guards
  // against late 401 responses from a previous user overwriting fresh data.
  const refresh = useCallback(async () => {
    const epoch = ++requestEpoch.current;
    if (API_CONFIG.useMock) {
      const fresh = mockSnapshot();
      collectionsRef.current = fresh;
      setCollections(fresh);
      setStatus(readyStatus());
      return RESOURCE_NAMES.map(() => true);
    }

    started.current = new Set(RESOURCE_NAMES);
    collectionsRef.current = {};
    setCollections({});
    setStatus(Object.fromEntries(RESOURCE_NAMES.map((name) => [name, 'loading'])));
    return Promise.all(RESOURCE_NAMES.map((name) => load(name, epoch)));
  }, [load]);

  // ---- optimistic mutations ----------------------------------------------
  const add = useCallback((name, item, where = 'start') => {
    const current = collectionsRef.current;
    const list = current[name] || [];
    const optimistic = { ...current, [name]: where === 'end' ? [...list, item] : [item, ...list] };
    collectionsRef.current = optimistic;
    setCollections(optimistic);

    return api(name)
      .create(item)
      .then((saved) => {
        if (!saved || typeof saved !== 'object') return;
        // Reconcile the optimistic row with the server's canonical one.
        const next = { ...collectionsRef.current, [name]: (collectionsRef.current[name] || []).map((it) => (it === item ? saved : it)) };
        collectionsRef.current = next;
        setCollections(next);
      })
      .catch((err) => {
        console.error(`[store] create "${name}" failed`, err);
        const next = { ...collectionsRef.current, [name]: (collectionsRef.current[name] || []).filter((it) => it !== item) };
        collectionsRef.current = next;
        setCollections(next);
        throw err;
      });
  }, []);

  const update = useCallback((name, predicate, patch) => {
    const idKey = idKeyOf(name);
    const current = collectionsRef.current;
    const list = current[name] || [];
    const targets = list.filter(predicate); // pre-patch snapshots, for rollback
    const optimistic = { ...current, [name]: list.map((it) => (predicate(it) ? { ...it, ...patch } : it)) };
    collectionsRef.current = optimistic;
    setCollections(optimistic);

    return Promise.all(targets.map((it) => api(name).update(it[idKey], patch))).catch((err) => {
      console.error(`[store] update "${name}" failed`, err);
      const next = {
        ...collectionsRef.current,
        [name]: (collectionsRef.current[name] || []).map((it) => targets.find((o) => o[idKey] === it[idKey]) || it),
      };
      collectionsRef.current = next;
      setCollections(next);
      throw err;
    });
  }, []);

  const remove = useCallback((name, predicate) => {
    const idKey = idKeyOf(name);
    const current = collectionsRef.current;
    const list = current[name] || [];
    const removed = list.filter(predicate);
    const optimistic = { ...current, [name]: list.filter((it) => !predicate(it)) };
    collectionsRef.current = optimistic;
    setCollections(optimistic);

    return Promise.all(removed.map((it) => api(name).remove(it[idKey]))).catch((err) => {
      console.error(`[store] delete "${name}" failed`, err);
      const next = { ...collectionsRef.current, [name]: [...removed, ...(collectionsRef.current[name] || [])] };
      collectionsRef.current = next;
      setCollections(next);
      throw err;
    });
  }, []);

  // Reset demo data: re-seed the mock DB (or clear, against the real backend)
  // and re-hydrate. Settings follows this with a reload.
  const reset = useCallback(() => {
    requestEpoch.current += 1;
    const fresh = resetData();
    started.current = new Set(API_CONFIG.useMock ? RESOURCE_NAMES : []);
    collectionsRef.current = API_CONFIG.useMock ? fresh : {};
    setCollections(collectionsRef.current);
    setStatus(API_CONFIG.useMock ? readyStatus() : {});
  }, []);

  const value = useMemo(
    () => ({ collections, status, ensure, add, update, remove, reset, refresh }),
    [collections, status, ensure, add, update, remove, reset, refresh],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Page-facing hook. Triggers the collection's load on mount and returns the
// live list plus bound mutators. The id field comes from the resource registry,
// so pages no longer pass a seed or an id key — the server owns both.
export function useCollection(name) {
  const { collections, status, ensure, add, update, remove } = useStore();
  const idKey = idKeyOf(name);

  useEffect(() => {
    ensure(name);
  }, [name, ensure]);

  const items = collections[name] ?? EMPTY;
  const st = status[name];

  return useMemo(
    () => ({
      items,
      loading: st === undefined || st === 'loading',
      error: st === 'error',
      add: (item, where) => add(name, item, where),
      update: (idValue, patch) => update(name, (it) => matchesRecord(it, idValue, idKey), patch),
      updateWhere: (predicate, patch) => update(name, predicate, patch),
      remove: (idValue) => remove(name, (it) => matchesRecord(it, idValue, idKey)),
      removeWhere: (predicate) => remove(name, predicate),
    }),
    [items, st, name, idKey, add, update, remove],
  );
}

export { useStore };
