# EcoWatch Intelligence — React Project

A satellite-integrated environmental intelligence platform, built with React,
React Router, and Tailwind CSS v4. This covers all 13 pages and demonstrates
all 7 core React hooks with real, working purposes (not decorative examples).

## Setup

```bash
npm install
npm run dev
```

Then open the printed localhost URL. The app opens on the Home page —
navigate to Sign In / Register to log in (any email + a 6+ character
password works, since this is a frontend-only demo with no backend).

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

- This is a frontend-only demo — "login" doesn't hit a real server, it just
  simulates a network delay and stores a user in `AuthContext`.
- Some repeated card patterns (e.g. community report cards, pollutant
  cards) were kept to 2–4 examples instead of the full original count to
  keep the codebase manageable — duplicate the pattern for more.
- All pages share one `DashboardLayout` (top bar + sidebar) except Sign In,
  Register, Home, and Logout, which have their own full-page layouts.
