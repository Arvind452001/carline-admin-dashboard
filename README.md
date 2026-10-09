# Carline — Taxi Dispatch Admin

A multi-role admin panel for a multi-company taxi dispatch platform, built with
React, Vite and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with **any email/password** — pick a role
on the login screen to explore that role's dashboard and pages. This is a
frontend-only demo build: all data comes from `src/shared/utils/mockData.js`.

## Roles

The platform ships with 11 roles, each with its own sidebar, dashboard and
page set (matching `src/roles/<role>/pages/...`):

Super Admin · Company Admin · Dispatcher · Driver Manager · Customer Service ·
Billing · Accounting · Manager · Read Only · Report Only

## Project structure

```
src/
├── roles/            One folder per role: pages/, components/, routes.jsx
├── auth/              Login, forgot-password, mock auth API
├── layouts/            AdminLayout, Sidebar, Topbar, Breadcrumbs
├── shared/            Reusable UI components, hooks, services, utils, mock data
├── access/            Roles, permissions, PermissionContext, ProtectedRoute, Can
├── store/             Zustand stores (auth, trips, drivers, customers, ...)
├── context/            Thin React Context wrappers around the stores
└── App.jsx            Top-level router wiring every role's routes.jsx
```

## Connecting a real backend

- `src/shared/services/apiClient.js` — swap the mock data for real `fetch` calls.
  Set `VITE_API_BASE_URL` in `.env`.
- `src/auth/services/authApi.js` — replace `loginRequest` with a real
  `POST /auth/login` call.
- `src/shared/services/socketClient.js` — wire up real-time updates for the
  dispatch board and live driver map.
- `src/shared/services/mapService.js` — plug in Google Maps or Mapbox for
  `LiveDriverMap` and the various `Maps` pages.

## Access control

- `src/access/roles.js` — the 11 role identifiers.
- `src/access/permissions.js` — capability grants per role (e.g. `trips.assign`).
- `src/access/roleConfig.js` — sidebar navigation per role.
- `<Can I="pricing.manage">…</Can>` and `useHasPermission('pricing.manage')` —
  conditionally render UI based on the signed-in user's permissions.
- `ProtectedRoute` guards every `/:roleSlug/*` route so a user can only reach
  the pages for their own role.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
