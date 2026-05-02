# k6 performance testing (backend)

These tests measure **API latency + error rate under load** using [k6](https://k6.io/).

## 1) Install k6 (Windows)

- **winget**:
  - `winget install k6 --source winget`
- **chocolatey**:
  - `choco install k6`

Verify:
- `k6 version`

## 2) Start your app server

From the project root:
- `npm run dev`

This should expose the API at:
- `http://localhost:3000/api`

## 3) Run performance tests

From the project root:
- `npm run perf:smoke`
- `npm run perf:load`

## Configuration (optional)

All configs are environment variables:

- `K6_BASE_URL` (default: `http://localhost:3000/api`)
- `K6_DURATION` (smoke duration, default: `15s`)
- `K6_VUS` (load target VUs, default: `20`)
- `K6_RAMP_UP`, `K6_STEADY`, `K6_RAMP_DOWN`
- `K6_SLEEP` (think time, default: `0.2`)

Example (PowerShell):

- `$env:K6_BASE_URL="http://localhost:3000/api"; npm run perf:smoke`

## Optional authenticated check (smoke only)

If you set:
- `PERF_EMAIL`
- `PERF_PASSWORD`

Then the smoke test will attempt `POST /api/auth/login` and use the token to call a citizen endpoint.

