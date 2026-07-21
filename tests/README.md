# E2E test suite (Playwright)

This is the local/CI suite. See [`TESTING_STRATEGY.md`](../TESTING_STRATEGY.md)
for how this relates to the separate prod smoke suite (`tests/smoke/`,
`npm run test:smoke`) and the reasoning behind the split.

These tests drive the real client against the real Express/MongoDB backend —
no mocked API responses. Each test registers its own throwaway user via a
direct API call (see `tests/support/api-client.ts`), so tests are isolated
from each other and can run in parallel.

## Prerequisites

1. A MongoDB instance the server can reach. `server/src/config/db.js` reads
   `MONGO_URI` — note that `server/.env.example` documents `MONGODB_URI`
   instead; see the mismatch called out in `TESTING_STRATEGY.md`. Set
   whichever name the code actually reads (`MONGO_URI`).
2. `server/.env` configured per the root README (`JWT_SECRET`,
   `JWT_REFRESH_SECRET`, `CORS_ORIGINS` including `http://localhost:5173`).
   `GOOGLE_AI_API_KEY` is not required — AI endpoints are out of scope for
   this suite and the app already fails soft when they're unavailable.

## Running

```bash
npm run test:e2e          # headless run
npm run test:e2e:ui       # interactive UI mode
npm run test:e2e:report   # open the last HTML report
```

`playwright.config.ts` starts the client (`client: npm run dev`) and server
(`server: node src/server.js`) for you if they aren't already running. If you
already have both running in separate terminals (the normal dev workflow),
Playwright reuses them instead of starting new ones.

Override the target with env vars if needed:
`PLAYWRIGHT_BASE_URL` (default `http://localhost:5173`),
`PLAYWRIGHT_API_URL` (default `http://localhost:3000/api`).

## Known constraint: auth rate limiting

The backend rate-limits `/api/auth/*` to a fixed **5 failed requests per 15
minutes per IP** (successful requests don't count —
`server/src/config/rateLimitConfig.js`), and `/api/auth/forgot-password` to
**3 requests per hour per IP regardless of success/failure**, on top of that.
Since all local/CI test runs share one IP, this budget is shared across the
*entire* suite, not per test file:

- `tests/auth/register.spec.ts` + `tests/auth/login.spec.ts` together spend 2
  of the 5 failed-auth budget (duplicate email, wrong password).
- `tests/auth/forgot-password.spec.ts` spends 1 of the 3 password-reset
  budget (the mismatched-confirmation case never reaches the API).

Re-running the full suite repeatedly within the same window can make these
specific tests flaky/fail with 429s — that's the server's real production
rate limiter, not a test bug. If you add new negative-path auth tests, keep
the total failed-attempt count in mind, and prefer client-side-validation
cases (which never hit the API) over server-rejected ones.

## Layout

- `tests/support/` — API client, fixtures (`registered`, `authedPage`,
  `seededAccount`, `seededCategory`), and test-data generators.
- `tests/auth/` — register, login, protected routes/logout, forgot password.
- `tests/dashboard/` — financial metrics, empty states, month filter.
- `tests/transactions/` — CRUD via the UI, search/filter/sort.

## Not yet covered

Budgets, Accounts, Categories, Profile/Settings, and AI Insights pages don't
have specs yet — the initial suite focused on Auth, Dashboard, and
Transactions. Follow the same fixture pattern in `tests/support/fixtures.ts`
to extend coverage.
