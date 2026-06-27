import { useScope } from '../context/ScopeContext.jsx';
import { useStore } from '../context/StoreContext.jsx';

// Live counts for the sidebar nav badges, read straight from the server-backed
// store. Branch-tagged collections are scoped to the active branch, so a CEO
// switching branches sees the badges re-count too. A collection that hasn't
// loaded yet reads as undefined (no badge) rather than a stale number.
const BADGE_SOURCES = ['students', 'groups', 'teachers', 'parents', 'leads', 'hr', 'approvals'];

export function useNavBadges() {
  const { collections } = useStore();
  const { scopeBranch } = useScope();

  const badges = {};
  for (const id of BADGE_SOURCES) {
    const list = collections[id];
    if (!list) {
      badges[id] = undefined;
      continue;
    }
    if (!list.length) {
      badges[id] = 0;
      continue;
    }
    badges[id] = 'b' in list[0] ? scopeBranch(list).length : list.length;
  }
  return badges;
}
