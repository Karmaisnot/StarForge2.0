# Data / API layer

Everything in the app reads and writes data through this folder. Pages and the
store call `api(name)`; they never know whether the response came from the
built-in **mock server** or the **real backend**. Switching between them is a
`.env` change, not a code change.

## Switching to the real backend (tomorrow)

1. Copy `app/.env.example` → `app/.env`
2. Set:
   ```
   VITE_USE_MOCK=false
   VITE_API_URL=https://your-api-host/v1
   ```
3. Restart `npm run dev`. That's it — no page changes.

A bearer token can be provided two ways:
- runtime: `localStorage.setItem('sf-auth-token', '<jwt>')` (wins), or
- build-time: `VITE_API_TOKEN=...` in `.env`.

## The REST contract the backend must implement

For each resource (`students`, `teachers`, `groups`, `parents`, `payments`,
`leads`, `hr`, `departments`, `branches`, `approvals`, `payroll`, `meetings`,
`messages`, `schedule`, `approvalHistory`):

| Method | Path                 | Body            | Returns          |
| ------ | -------------------- | --------------- | ---------------- |
| GET    | `/<resource>`        | —               | array of rows    |
| POST   | `/<resource>`        | new row         | the created row  |
| PATCH  | `/<resource>/<id>`   | partial patch   | the updated row  |
| DELETE | `/<resource>/<id>`   | —               | `{ ok: true }`   |

Each resource's `<id>` field is declared in `resources.js` (`idKey`) — most use
`id`, but some keyed collections use `n` (name) or `key`. The row shapes are
exactly the seed objects in `../data/dataset.js` and `mock/seeds.js`; the real
API should return the same fields.

## Files

- `config.js` — reads env, decides mock vs real (the single branch point).
- `http.js` — fetch wrapper (base URL, JSON, bearer auth, timeout, `ApiError`).
- `resources.js` — the resource registry: REST path, `idKey`, mock seed.
- `mock/` — the mock server: `db.js` (in-memory + localStorage), `server.js`
  (REST router with simulated latency), `seeds.js` (hand-authored collections).
- `index.js` — public surface: `api(name)`, `mockSnapshot()`, `resetData()`.

The store (`context/StoreContext.jsx`) hydrates the first paint from the mock DB
synchronously in mock mode, and loads asynchronously against the real API.
Mutations are optimistic with rollback on failure.
