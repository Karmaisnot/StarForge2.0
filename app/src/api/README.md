# Data / API layer

Pages and the store access data only through `api(name)`. The provider is
selected by `.env`: the default mock server keeps the demo usable; live mode
uses the Starforge v1 API without changing the visual components.

## Live setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_USE_MOCK=false`.
3. During local development leave `VITE_API_URL` blank and set
   `VITE_API_PROXY_TARGET` to the tenant API host.
4. Open **Settings → Backend connection** and sign in with a valid tenant
   account. The opaque session key from `POST /api/v1/auth/login/` is stored
   only at runtime in this browser; the password is never persisted.
5. Restart `npm run dev` after changing environment variables.

The supplied deployment is HTTPS-only. The local proxy avoids its current
cross-origin restriction for Vite; in production serve the console from the
same tenant origin as the API:

```env
VITE_API_URL=
VITE_API_PROXY_TARGET=https://starforge.78.111.91.113.nip.io
VITE_USE_MOCK=false
```

Never put a real session key in a production `VITE_API_TOKEN`: every `VITE_*`
value is bundled for the browser. Use a runtime session key instead.

The sample account in the backend repository belongs to its locally seeded
`demo.localhost` tenant. It is not a credential for the public `nip.io`
deployment; sign in with a real account for that tenant.

`http.js` sends `Authorization: Bearer <token>`, `Accept-Language`, and an
`X-Request-ID` on every request. It unwraps the backend's
`{ success, data, pagination? }` envelope, follows the remaining list pages
for the existing client-side dashboards, and exposes server error codes, field
errors, retry timing, and request IDs through `ApiError`.

## Resource mapping

The legacy console names map to real backend endpoints:

| Console collection | API route |
| --- | --- |
| students | `/api/v1/students/` |
| teachers | `/api/v1/teachers/` |
| groups | `/api/v1/cohorts/` |
| parents | `/api/v1/parents/` |
| payments | `/api/v1/payments/` |
| HR | `/api/v1/org/staff/` |
| departments | `/api/v1/org/departments/` |
| branches | `/api/v1/org/branches/` |
| approvals | `/api/v1/approvals/requests/` |
| meetings | `/api/v1/meetings/` |
| messages | `/api/v1/messaging/threads/` |
| schedule | `/api/v1/schedule/lessons/` |

`adapters.js` converts these responses to the existing page view models and
joins branch/cohort labels after related collections load. Leads, payroll, and
the old approval-history UI have no one-to-one CRUD endpoint in the current
schema; their live lists remain empty until the matching screens are designed
against their dedicated backend operations.

### Live write safety

The live console is deliberately read-only for now. Its legacy create/edit/
delete forms use display fields that do not match the backend DTOs, so the API
layer blocks those requests rather than risking a mutation of real data. Each
write flow needs its own request adapter (for example student `branch` and
contact fields, payment `/cash/` operation, approval actions) before it is
enabled.

## Files

- `config.js` — Vite environment and API mode.
- `http.js` — fetch, auth, locale, request ID, timeout, and API envelopes.
- `resources.js` — console-to-v1 endpoint registry and mock IDs.
- `adapters.js` — backend response compatibility mapping for existing pages.
- `mock/` — local mock database and request router.
- `index.js` — public `api(name)` surface.
