import { useMemo } from 'react';
import { Shell } from './layout/Shell.jsx';
import { PAGES } from './pages/registry.js';
import { ROLE_CFG } from './config/roles.js';
import { resolveRole } from './config/resolveRole.js';
import { useHashRoute } from './hooks/useHashRoute.js';

export default function App() {
  const role = useMemo(resolveRole, []);
  const cfg = ROLE_CFG[role];
  const allowed = useMemo(() => new Set(cfg.nav.map((n) => n.id)), [cfg]);
  const fallback = cfg.nav[0].id;

  const [active, navigate] = useHashRoute(fallback);
  const routeId = allowed.has(active) ? active : fallback;
  const Page = PAGES[routeId] || PAGES[fallback];

  return (
    <Shell cfg={cfg} active={routeId} onNav={navigate}>
      <Page role={role} onNav={navigate} />
    </Shell>
  );
}
