import { ROLE_CFG } from './roles.js';

// The console ships as one app for CEO and Manager; the active role is fixed
// per deployment (and gated by permissions upstream). Resolution order:
//   1. build-time env  (VITE_ROLE=manager)
//   2. URL query param (?role=manager) — handy for previews
//   3. default 'ceo'
export function resolveRole() {
  const fromEnv = import.meta.env.VITE_ROLE;
  const fromQuery = new URLSearchParams(window.location.search).get('role');
  const role = fromQuery || fromEnv || 'ceo';
  return ROLE_CFG[role] ? role : 'ceo';
}
