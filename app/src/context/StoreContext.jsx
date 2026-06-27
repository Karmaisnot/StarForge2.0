import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, idKeyOf, mockSnapshot, resetData, RESOURCE_NAMES, API_CONFIG } from '../api/index.js';

const StoreContext = createContext(null);

// Stable empty fallback so a not-yet-loaded collection doesn't hand out a fresh
// array each render (which would churn every consumer's memo).
const EMPTY = [];

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

  // Names whose load has already been kicked off (mock mode pre-seeds them all).
  const started = useRef(new Set(API_CONFIG.useMock ? RESOURCE_NAMES : []));

  const load = useCallback(async (name) => {
    setStatus((s) => ({ ...s, [name]: 'loading' }));
    try {
      const items = await api(name).list();
      setCollections((c) => ({ ...c, [name]: Array.isArray(items) ? items : [] }));
      setStatus((s) => ({ ...s, [name]: 'ready' }));
    } catch (err) {
      console.error(`[store] failed to load "${name}"`, err);
      setStatus((s) => ({ ...s, [name]: 'error' }));
      started.current.delete(name); // allow a later retry
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
  useEffect(() => {
    if (!API_CONFIG.useMock) RESOURCE_NAMES.forEach(ensure);
  }, [ensure]);

  // ---- optimistic mutations ----------------------------------------------
  const add = useCallback((name, item, where = 'start') => {
    setCollections((c) => {
      const list = c[name] || [];
      return { ...c, [name]: where === 'end' ? [...list, item] : [item, ...list] };
    });
    api(name)
      .create(item)
      .then((saved) => {
        if (!saved || typeof saved !== 'object') return;
        // Reconcile the optimistic row with the server's canonical one.
        setCollections((c) => ({ ...c, [name]: (c[name] || []).map((it) => (it === item ? saved : it)) }));
      })
      .catch((err) => {
        console.error(`[store] create "${name}" failed`, err);
        setCollections((c) => ({ ...c, [name]: (c[name] || []).filter((it) => it !== item) }));
      });
  }, []);

  const update = useCallback((name, predicate, patch) => {
    const idKey = idKeyOf(name);
    let targets = [];
    setCollections((c) => {
      const list = c[name] || [];
      targets = list.filter(predicate); // pre-patch snapshots, for rollback
      return { ...c, [name]: list.map((it) => (predicate(it) ? { ...it, ...patch } : it)) };
    });
    Promise.all(targets.map((it) => api(name).update(it[idKey], patch))).catch((err) => {
      console.error(`[store] update "${name}" failed`, err);
      setCollections((c) => ({
        ...c,
        [name]: (c[name] || []).map((it) => targets.find((o) => o[idKey] === it[idKey]) || it),
      }));
    });
  }, []);

  const remove = useCallback((name, predicate) => {
    const idKey = idKeyOf(name);
    let removed = [];
    setCollections((c) => {
      const list = c[name] || [];
      removed = list.filter(predicate);
      return { ...c, [name]: list.filter((it) => !predicate(it)) };
    });
    Promise.all(removed.map((it) => api(name).remove(it[idKey]))).catch((err) => {
      console.error(`[store] delete "${name}" failed`, err);
      setCollections((c) => ({ ...c, [name]: [...removed, ...(c[name] || [])] }));
    });
  }, []);

  // Reset demo data: re-seed the mock DB (or clear, against the real backend)
  // and re-hydrate. Settings follows this with a reload.
  const reset = useCallback(() => {
    const fresh = resetData();
    started.current = new Set(API_CONFIG.useMock ? RESOURCE_NAMES : []);
    setCollections(API_CONFIG.useMock ? fresh : {});
    setStatus(API_CONFIG.useMock ? readyStatus() : {});
  }, []);

  const value = useMemo(
    () => ({ collections, status, ensure, add, update, remove, reset }),
    [collections, status, ensure, add, update, remove, reset],
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
      update: (idValue, patch) => update(name, (it) => it[idKey] === idValue, patch),
      updateWhere: (predicate, patch) => update(name, predicate, patch),
      remove: (idValue) => remove(name, (it) => it[idKey] === idValue),
      removeWhere: (predicate) => remove(name, predicate),
    }),
    [items, st, name, idKey, add, update, remove],
  );
}

export { useStore };
