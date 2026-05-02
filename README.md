# Digital Municipality System

A full-stack web application for citizens and administrators to manage municipal services: service requests with configurable fees and payments, complaints, announcements, polls, optional AI assistance (Municipality BOT), and an admin console for users, service types, and requests.

**Course context:** COE416 — Software Engineering (LAU).

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Running the app](#running-the-app)
- [Building for production](#building-for-production)
- [API](#api)
- [Testing](#testing)
- [Performance testing (k6)](#performance-testing-k6)
- [Project layout](#project-layout)
- [Documentation](#documentation)
- [Security notes](#security-notes)

---

## Architecture

- **Single dev server** (`server.ts`, port **3000**): Express REST API under `/api`, static uploads, and **Vite middleware** in development so the React SPA is served with HMR.
- **Frontend:** React 19, React Router 7, Tailwind CSS 4, Axios (`baseURL: '/api'`).
- **Backend:** Express, Sequelize ORM, JWT auth (access + refresh cookies where configured).
- **Production:** Build static assets with Vite; Express serves `dist` and the API (set `NODE_ENV=production`).

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| UI | React 19, TypeScript, Tailwind CSS 4, Motion, Lucide icons |
| HTTP client | Axios |
| Server | Express, tsx, cookie-parser, cors, multer |
| Data | Sequelize 6, SQLite (default) or MySQL |
| Auth | JWT (bcrypt password hashing) |
| AI (optional) | Google Gemini (`@google/genai`) for Municipality BOT |
| Tests (frontend) | Vitest, Testing Library, jsdom |
| Tests (backend) | Jest, ts-jest, Supertest |
| Load tests | k6 (optional CLI install) |

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (ships with Node)
- **MySQL** only if you set `DB_DIALECT=mysql` (otherwise SQLite file is enough)
- **k6** only if you run performance scripts ([installation](https://k6.io/docs/get-started/installation/))

---

## Getting started

```bash
git clone <repository-url>
cd digital-municipality-system
npm install
```

Copy your environment file (create `.env` at the repo root if you do not have one). See [Environment variables](#environment-variables).

Start the development server:

```bash
npm run dev
```

Open **http://localhost:3000**.

On first run in non-production, Sequelize **syncs** models (`alter: true`) and **seeders** run (default admin/citizen users and sample data where defined).

---

## Environment variables

Create a `.env` file in the project root. **Do not commit real secrets.** Example shape:

```env
# Optional: Municipality BOT (Gemini). Required only if you use /citizen/bot/ask
GEMINI_API_KEY=

# App URL (e.g. links in emails if you add them)
APP_URL=http://localhost:3000

# Database — omit DB_DIALECT or set sqlite for file DB
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite

# MySQL example (set DB_DIALECT=mysql)
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=your_password
# DB_NAME=digital_municipality

JWT_SECRET=change-me-use-long-random-string
JWT_REFRESH_SECRET=change-me-second-secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Private admin self-registration endpoint
ADMIN_REGISTER_KEY=CHANGE_ME
```

`vite.config.ts` can expose `GEMINI_API_KEY` to the client via `define` for dev-only features; treat keys as sensitive and rotate if exposed.

---

## Database

- **Default:** **SQLite** file (`database.sqlite` in project root unless `DB_STORAGE` overrides).
- **MySQL:** Set `DB_DIALECT=mysql` and provide `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`. Ensure the database exists and users have appropriate permissions.
- **Schema reference:** `backend/src/database/schema.sql`.
- **Dev sync:** `sequelize.sync({ alter: true })` when `NODE_ENV !== 'production'` — suitable for development; use explicit migrations for production teams.

---

## Running the app

| Command | Description |
|---------|-------------|
| `npm run dev` | Express + Vite dev server on **http://localhost:3000** |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run build` | Production build of the SPA to `dist/` |
| `npm run preview` | Preview **only** the Vite-built static site (does not start Express API) |

### Seeded demo accounts (from seeders)

Values match `backend/src/database/seeders.ts` unless you change them:

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@municipality.gov` | `AdminPassword123` |
| Citizen | `citizen@example.com` | `CitizenPassword123` |

---

## Building for production

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Run the unified server with production mode so Express serves `dist/` and skips Vite middleware:

   ```bash
   set NODE_ENV=production
   npx tsx server.ts
   ```

   On macOS/Linux:

   ```bash
   NODE_ENV=production npx tsx server.ts
   ```

Ensure `.env` production database and JWT secrets are set and **not** development defaults.

---

## API

- REST API base path: **`/api`**
- Health check: `GET /api/health`
- Detailed route listing and payloads: **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**

---

## Testing

| Command | Scope |
|---------|--------|
| `npm run test` | Backend Jest + frontend Vitest |
| `npm run test:backend` | Jest — `backend/tests/**/*.test.ts` (unit + integration-style Supertest) |
| `npm run test:frontend` | Vitest — `src/tests` (unit, component, system-style flows) |

Frontend tests use **jsdom** (see `vite.config.ts` `test` section) and `@testing-library/react`.

---

## Performance testing (k6)

Requires [k6](https://k6.io/) installed on your machine. Start the app (`npm run dev`) in another terminal, then:

```bash
npm run perf:smoke
npm run perf:load
```

Scripts live under `backend/perf/`. Override base URL if needed, e.g.:

```bash
set K6_BASE_URL=http://localhost:3000/api
k6 run backend/perf/k6-load.js
```

---

## Project layout

```
digital-municipality-system/
├── server.ts                 # Express entry + Vite dev integration
├── src/                      # React SPA
│   ├── App.tsx
│   ├── pages/                # Citizen, admin, auth, landing
│   ├── layouts/
│   ├── context/
│   ├── api/axios.ts          # API client (/api)
│   └── tests/                # Vitest: unit, component, system
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/db.ts
│   │   └── database/
│   ├── tests/                # Jest
│   └── perf/                 # k6 scripts
├── docs/                     # API, DB design, setup notes
├── uploads/                  # User uploads (e.g. complaints) — ensure writable
└── database.sqlite           # Default SQLite DB (gitignored if listed)
```

---

## Documentation

| Document | Content |
|----------|---------|
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Setup summary |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | API overview |
| [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | Entity and relationship notes |

---

## Security notes

- Keep **`.env` out of version control**; rotate keys if they leak.
- Change **JWT** and **ADMIN_REGISTER_KEY** for any shared or public deployment.
- The **payment card** flow in this project is a **demo** (validation only); integrate a real PSP (e.g. Stripe) for production.
- Configure **CORS**, **rate limiting**, and **HTTPS** for internet-facing deployments.

---

## License

Private / educational use unless otherwise specified by your institution.
