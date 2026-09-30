# EcoWatch Intelligence — React Project

A satellite-integrated environmental intelligence platform, built with React,
React Router, and Tailwind CSS v4. This covers all 13 pages and demonstrates
all 7 core React hooks with real, working purposes (not decorative examples).

## Setup

```bash
npm install
npm run dev
```

Then open the printed localhost URL. The app opens on the Home page.

## Complete Modular MVC Backend

The backend is built with Express.js in a clean, production-grade Modular MVC architecture:
- `server/config/` — Environment and database configurations
- `server/db/` — MySQL connection pool (`mysql2/promise`), auto-schema migration, and persistent JSON store fallback (`store.json`)
- `server/middleware/` — JWT authentication, role verification, request logging, and centralized error handling
- `server/services/` — Orbital telemetry calculations, Environmental Risk Index (ERI), and AI specialist reasoning
- `server/controllers/` — Modular controllers for Auth, Profile, Alerts, Reports, Satellite, Environment, Analytics, and Settings
- `server/routes/` — Express route modules mounted under `/api` with interactive API docs (`/api/docs`) and system health (`/api/health`)
- `server/__tests__/` — Vitest integration test suite (43+ tests covering all controllers and routes)

### Database Configuration & Run Options

1. **MySQL Setup**:
   - Provide MySQL credentials in `.env`:
     ```env
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=root
     MYSQL_PASSWORD=your_password
     MYSQL_DATABASE=ecowatch
     ```
   - Schema and seed tables are defined in [schema.sql](file:///e:/backup%20DoC/ecowatch-app/ecowatch-app/server/schema.sql) and automatically verified on startup.
2. **Resilient Local Fallback**:
   - If MySQL is not running locally, the backend automatically logs an informative notice and uses the persistent file-backed store ([store.json](file:///e:/backup%20DoC/ecowatch-app/ecowatch-app/server/data/store.json)), ensuring 100% functionality and testability without local database installation.

### Running Backend & Tests

```bash
# Run backend server directly (port 3001)
npm run server

# Run both frontend and backend concurrently
npm run dev:full

# Run comprehensive test suite
npm run test
```

### Core API Endpoints

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/microsoft`, `GET /api/auth/me`, `POST /api/auth/change-password`, `POST /api/auth/logout`
- **Profile**: `GET /api/profile`, `PUT /api/profile`
- **Disaster Alerts**: `GET /api/alerts`, `POST /api/alerts`, `POST /api/alerts/broadcast`, `GET /api/alerts/:id`, `PUT /api/alerts/:id`, `DELETE /api/alerts/:id`
- **Community Reports**: `GET /api/community-reports`, `GET /api/community-reports/stats`, `POST /api/community-reports`, `GET /api/community-reports/:id`, `PUT /api/community-reports/:id`, `DELETE /api/community-reports/:id`, `POST /api/community-reports/:id/vote`
- **Satellite & Telemetry**: `GET /api/satellite/telemetry`, `GET /api/satellite/eri`, `GET /api/satellite/orbits`, `POST /api/satellite/telemetry/log`, `GET /api/satellite/telemetry/history`
- **Environment & Weather**: `GET /api/environment`, `GET /api/weather`, `GET /api/air-quality`
- **Analytics & AI**: `GET /api/analytics/historical`, `POST /api/analytics/ai-insight`, `GET /api/analytics/export`
- **Settings & Webhooks**: `GET /api/settings`, `PUT /api/settings`, `POST /api/settings/api-keys`, `DELETE /api/settings/api-keys/:id`, `POST /api/settings/webhooks`, `DELETE /api/settings/webhooks/:id`, `POST /api/settings/webhooks/test`

## Google OAuth setup

Copy `.env.example` to `.env.local` and set `VITE_GOOGLE_CLIENT_ID` to a
Google Cloud Web OAuth client ID. Add the exact local and deployed origins to
the client configuration, then restart Vite. The Google button uses Google
Identity Services and creates the same frontend session as email sign-in.

## Microsoft OAuth setup

In Microsoft Entra admin center, create an App Registration for a single-page
application and add the exact Vite origin as a redirect URI, for example
`http://localhost:5173` or `http://localhost:5174`. Set its Application
(client) ID as `VITE_MICROSOFT_CLIENT_ID` in `.env.local`, then restart Vite.
The Microsoft button uses the browser OAuth popup and creates the same session
as email sign-in.

## Pages (13)

1. **Sign In** — `/signin`
2. **Register** — `/register`
3. **Home** — `/home`
4. **Dashboard** — `/dashboard`
5. **Interactive Map** — `/map`
6. **Disaster Alerts** — `/disaster-alerts`
7. **Community Reports** — `/community-reports`
8. **Analytics** — `/analytics`
9. **Weather** — `/weather`
10. **Air Quality** — `/air-quality`
11. **Profile** — `/profile`
12. **Settings** — `/settings`
13. **Logout** — `/logout`

## Where each hook is used, and why

| Hook | Where | Why |
|---|---|---|
| `useState` | Forms (Sign In, Register, Profile), filters (Community Reports), tabs (Settings), map layer toggles | Local component state that changes on user interaction |
| `useEffect` | `SatelliteDataContext` — starts a simulated live satellite feed on mount, cleans up the interval on unmount. `RegisterPage` — drives the parallax effect on the background. `ThemeContext` — syncs the theme to `<html class="dark">` and `localStorage` every time it changes | Side effects: starting/stopping a timer, attaching/removing a DOM event listener, syncing React state to the DOM/storage |
| `useContext` | `AuthContext` (login state), `SatelliteDataContext` (live readings), `ThemeContext` (light/dark mode, used in `DashboardLayout` and `HomePage`) | Shares state across many components without prop drilling |
| `useReducer` | Disaster Alerts page — alert list with explicit actions (`RESOLVE`, `BROADCAST`, `ADD_ALERT`) | Better fit than `useState` when updates depend on both "which item" and "what action" |
| `useRef` | Search input focus in the layout's top bar, background image parallax on Register, interval id storage in `SatelliteDataContext` | Holds a value or DOM node that shouldn't trigger a re-render when it changes |
| `useMemo` | AQI/heat status + color derived from live readings (`SatelliteDataContext`), filtered report list (Community Reports), active layer count (Interactive Map) | Recomputes a derived value only when its actual dependencies change |
| `useCallback` | `handleChange`/`login` function identities in the shared hooks, category filter handler (Community Reports), sidebar handlers (Layout) | Keeps function references stable across re-renders |

## The "live color-changing" behavior

`SatelliteDataContext` simulates a live satellite feed: every 6 seconds, an
interval (started in `useEffect`, cleaned up on unmount) nudges the AQI,
temperature, humidity, and wind readings up or down slightly. `useMemo`
derives a status label + CSS class (`status-good` / `status-moderate` /
`status-poor`) from those numbers. Every page that shows an AQI or
temperature badge (Dashboard, Weather, Air Quality, Analytics) reads from
this same context — so as the simulated satellite data drifts, badges
across the whole app recolor themselves automatically, all from one shared
mechanism.

## Theme (light/dark) toggle

`ThemeContext` holds `theme` state ("light" | "dark"). Its `useEffect` runs
every time `theme` changes: it adds/removes the `dark` class on `<html>`
(which is what flips every `dark:` Tailwind color token defined in
`index.css`) and saves the choice to `localStorage` so it persists across
refreshes. It also reads that saved value back on first load via
`useState`'s lazy initializer. Click the sun/moon icon in the top bar
(Dashboard layout) or on the Home page to try it.

## Notes

- Weather and air-quality readings are fetched server-side from Open-Meteo and
  CAMS for the selected coordinates. Responses identify their data source and
  clearly mark simulated fallback readings when those providers are unavailable.
- Community observations and disaster alerts use the backend's persisted API
  contracts. Some dashboard charts and analytics cards still use presentation
  fixtures.
- Satellite constellation/orbit/anomaly data and historical analytics/AI
  insights are currently simulated. Do not use those
  outputs for operational decisions until their data providers are integrated.
- Google and Microsoft OAuth routes still require server-side identity-token
  verification before the application is exposed as a public production service.
- Some repeated card patterns (e.g. community report cards, pollutant
  cards) were kept to 2–4 examples instead of the full original count to
  keep the codebase manageable — duplicate the pattern for more.
- All pages share one `DashboardLayout` (top bar + sidebar) except Sign In,
  Register, Home, and Logout, which have their own full-page layouts.
