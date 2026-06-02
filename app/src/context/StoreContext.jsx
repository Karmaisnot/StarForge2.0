import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const StoreContext = createContext(null);
const STORAGE_KEY = 'sf-store-v1';

function loadInitial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// Single source of truth for every editable collection in the app. Holds named
// arrays, exposes pure add/update/remove operations, and persists to
// localStorage so changes survive a reload. Pages never mutate data directly —
// they go through `useCollection`, which keeps the read and write paths
// consistent everywhere (SRP + DRY).
export function StoreProvider({ children }) {
  const [collections, setCollections] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch {
      /* storage full / unavailable — non-fatal for a demo console */
    }
  }, [collections]);

  const ensure = useCallback((name, seed) => {
    setCollections((c) => (name in c ? c : { ...c, [name]: seed }));
  }, []);

  const add = useCallback((name, item, where = 'start') => {
    setCollections((c) => {
      const list = c[name] || [];
      return { ...c, [name]: where === 'end' ? [...list, item] : [item, ...list] };
    });
  }, []);

  const update = useCallback((name, predicate, patch) => {
    setCollections((c) => ({
      ...c,
      [name]: (c[name] || []).map((it) => (predicate(it) ? { ...it, ...patch } : it)),
    }));
  }, []);

  const remove = useCallback((name, predicate) => {
    setCollections((c) => ({ ...c, [name]: (c[name] || []).filter((it) => !predicate(it)) }));
  }, []);

  const reset = useCallback(() => {
    setCollections({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ collections, ensure, add, update, remove, reset }),
    [collections, ensure, add, update, remove, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Page-facing hook. Seeds the collection once from `seed`, then returns the live
// list plus bound mutators. `id` (default 'id') is the identity field used by
// the convenience predicates so callers pass a value, not a function.
export function useCollection(name, seed = [], id = 'id') {
  const { collections, ensure, add, update, remove } = useStore();

  useEffect(() => {
    ensure(name, seed);
    // Seed is intentionally read only on first mount for this collection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const items = collections[name] ?? seed;

  return useMemo(
    () => ({
      items,
      add: (item, where) => add(name, item, where),
      update: (idValue, patch) => update(name, (it) => it[id] === idValue, patch),
      updateWhere: (predicate, patch) => update(name, predicate, patch),
      remove: (idValue) => remove(name, (it) => it[id] === idValue),
      removeWhere: (predicate) => remove(name, predicate),
    }),
    [items, name, id, add, update, remove],
  );
}

export { useStore };
