# StarForge EDU — CEO / Manager Console

Production web console for the StarForge EDU education-management platform. CEO and
Manager are the **same application** — they share ~95% of the UI and differ only by
configuration (`src/config/roles.js`). Permissions are enforced upstream, so this
codebase contains no permission-gating logic.

> Scope: this repository is the **CEO/Manager website only**. Mobile apps, the teacher
> web app and the design prototypes are intentionally out of scope.

## Stack

- **React 18** + **Vite 6** — fast SPA, hash-based routing (no router dependency)
- **react-i18next** — full UI in Uzbek / Russian / English, persisted to `localStorage`
- **CSS custom properties** design system — 4 palettes (saroy · marvarid · samarqand ·
  daryo) × light/dark, switched via `data-theme` / `data-palette` on `<html>`
- **Pure SVG charts** — area, bar, donut, sparkline, horizontal bars (zero chart deps)
- **Docker** — multi-stage build served by nginx with SPA fallback

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production bundle → dist/
npm run preview    # serve the built bundle
npm run lint       # ESLint (flat config, react-hooks)
```

### Choosing the role

The active role is fixed per deployment and resolved (in order) from:

1. build-time env — `VITE_ROLE=manager npm run build`
2. URL query — `?role=manager` (handy for previews)
3. default — `ceo`

## Docker

```bash
docker compose up --build       # → http://localhost:8080
```

The image builds the static bundle with Node, then serves it from `nginx:alpine`
(`nginx.conf` rewrites unknown paths to `index.html` for client-side routing).

## Architecture

SOLID, single-responsibility modules; presentational components are decoupled from
state, which lives in contexts and hooks.

```
src/
  main.jsx                 App bootstrap + providers
  App.jsx                  Role resolution + route → page wiring
  config/
    roles.js               ROLE_CFG (nav, branches) — data, not markup
    resolveRole.js         env / query / default role resolution
  context/
    PreferencesContext.jsx currency · theme · palette (persisted)
    ToastContext.jsx       global toast notifications
  hooks/
    useHashRoute.js        dependency-free hash router
    useActions.js          DRY, translated write-action feedback
    useOutsideClick.js     popover open/close behaviour
  i18n/                    i18next init + uz/ru/en resources
  lib/format.js            currency rates + money formatting
  components/              Icons, primitives, charts, common (table/filter/pagination)
  layout/                  Shell, Sidebar, Topbar, PreferencesMenu
  pages/                   one file per route + registry.js
  styles/                  tokens.css (design tokens) + app.css
```

### Adding a page

1. Create `src/pages/Foo.jsx` exporting a `FooPage` component.
2. Register it in `src/pages/registry.js` under its route id.
3. Add a nav entry (with `labelKey`) to the relevant role in `src/config/roles.js`
   and the label to the three locale files.

## Interactivity

Every control is wired: language / currency / branch / theme / palette switchers,
controlled search + filter chips + pagination, segmented controls, kanban/thread
selection, message and AI composers, and approve/reject/save/export actions — all of
which surface feedback through the toast system.
