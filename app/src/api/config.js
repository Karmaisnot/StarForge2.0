// Runtime API configuration, read once from Vite env vars.
//
// The whole point of this layer: pages and the store never know whether data
// comes from the mock server or the real backend. They call `api(name)`; this
// config decides where those calls actually go. Tomorrow, connecting the real
// API is a `.env` change (VITE_USE_MOCK=false + VITE_API_URL=...), not a code
// change. See `.env.example`.

const env = import.meta.env ?? {};

const flag = (v, dflt) => {
  if (v === undefined || v === null || v === '') return dflt;
  return String(v).toLowerCase() !== 'false';
};

export const API_CONFIG = {
  // Trailing slash trimmed so `${baseUrl}/students` is always well-formed.
  baseUrl: String(env.VITE_API_URL || '').replace(/\/+$/, ''),
  // Defaults to the mock server until the backend is explicitly switched on.
  useMock: flag(env.VITE_USE_MOCK, true),
  // Static fallback token; a localStorage token (tokenKey) overrides it.
  token: String(env.VITE_API_TOKEN || ''),
  tokenKey: 'sf-auth-token',
  // Mock-only network simulation.
  mockLatency: Number.isFinite(Number(env.VITE_MOCK_LATENCY)) ? Number(env.VITE_MOCK_LATENCY) : 140,
};
