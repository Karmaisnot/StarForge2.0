import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { BRANCH_SWITCHER } from '../data/dataset.js';
import { useCollection } from './StoreContext.jsx';
import { API_CONFIG } from '../api/index.js';

// Owns the active branch scope. The sidebar switcher writes it; pages read it to
// filter their collections, so picking a branch genuinely narrows the data (not
// just a label). A manager is pinned to their one branch; the CEO roams every
// branch plus the aggregate "all" view.
const ScopeContext = createContext(null);

export function ScopeProvider({ role, defaultBranch, children }) {
  const isManager = role === 'manager';
  const { items: liveBranches } = useCollection('branches');
  const options = useMemo(
    () => {
      if (API_CONFIG.useMock) {
        return isManager ? BRANCH_SWITCHER.filter((b) => b.id === defaultBranch) : BRANCH_SWITCHER;
      }

      const apiOptions = liveBranches.map((branch) => ({ id: branch.id, name: branch.n, students: branch.st }));
      if (isManager) return apiOptions;
      return [{ id: 'all', name: '__ALL__', students: apiOptions.reduce((sum, branch) => sum + branch.students, 0), branches: apiOptions.length }, ...apiOptions];
    },
    [isManager, defaultBranch, liveBranches],
  );
  const [branchId, setBranchId] = useState(defaultBranch);

  const setBranch = useCallback(
    (id) => {
      if (!isManager) setBranchId(id);
    },
    [isManager],
  );

  const current = options.find((b) => b.id === branchId) || options[0];
  const isAll = current?.id === 'all';
  const branchName = isAll ? null : current?.name;

  // Filter any branch-tagged collection by the active scope. `key` is the field
  // holding the branch name (defaults to the app-wide `b`).
  const scopeBranch = useCallback(
    (list, key = 'b') => {
      if (isAll || !branchName) return list;
      return list.filter((item) => {
        if (!API_CONFIG.useMock && item._branchId != null) return String(item._branchId) === String(current?.id);
        return item[key] === branchName;
      });
    },
    [isAll, branchName, current],
  );

  const value = useMemo(
    () => ({ role, branchId: current?.id, branchName, isAll, setBranch, options, scopeBranch }),
    [role, current, branchName, isAll, setBranch, options, scopeBranch],
  );

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope() {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error('useScope must be used within ScopeProvider');
  return ctx;
}
