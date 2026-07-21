# Testing Strategy

This project uses two separate Playwright suites, run differently and for
different reasons. The split matters more than the test count: it's the
difference between "wrote some tests" and thinking about blast radius,
environments, and what's safe to automate where.

| | Local / CI suite | Prod smoke suite |
|---|---|---|
| Config | `playwright.config.ts` | `playwright.smoke.config.ts` |
| Tests | `tests/{auth,dashboard,transactions}/` | `tests/smoke/` |
| Target | Local dev servers / CI, ephemeral MongoDB | Live deploy (`expensure.vercel.app` + its API) |
| Command | `npm run test:e2e` | `npm run test:smoke` |
| Style | Full CRUD, negative paths, edge cases | Read-only, plus one throwaway account round trip |
| Runs on | Every push/PR (GitHub Actions) | Manually / post-deploy |
| Safe to be destructive? | Yes — disposable DB | No — real production database |

## Why not just one suite everywhere

The full suite creates and deletes accounts, transactions, and categories,
and deliberately exercises failure paths (wrong password, duplicate email,
missing required fields). That's exactly what you want against a disposable
database, and exactly what you don't want against `ai-financial-dashboard-api.vercel.app`'s
real MongoDB — it would leave junk data behind and burn a rate limit shared
with real users. So the prod suite only ever *reads*, checks routing/auth
guards, and creates at most one clearly-tagged throwaway account per run to
prove the deployed frontend, API, and database actually talk to each other
(the class of bug — bad env var, CORS misconfig, cold-start timeout — that
passes locally and breaks only in production).

## Local / CI suite

- **Isolation**: every test registers its own user via a direct API call
  (`tests/support/api-client.ts`), not through shared fixtures/seed data, so
  tests can run in parallel without colliding.
- **Fixtures over Page Objects**: `tests/support/fixtures.ts` extends
  Playwright's `test` with `registered`, `authedPage`, `seededAccount`,
  `seededCategory` — composable per-test setup rather than a classic POM
  layer, which keeps specs declarative without hiding assertions in helper
  classes.
- **Rate-limit awareness**: the backend limits `/api/auth/*` to 5 failed
  requests per 15 minutes per IP (successes don't count) and
  `/api/auth/forgot-password` to 3 requests/hour regardless of outcome
  (`server/src/config/rateLimitConfig.js`). Negative-path auth tests are
  deliberately kept few and documented in `tests/README.md` so the whole
  suite doesn't intermittently 429 itself.
- **CI**: `.github/workflows/playwright.yml` spins up a `mongo:7` service
  container per run, so CI needs no external database or secrets.

## Prod smoke suite (`tests/smoke/`)

Six tests, all safe to run repeatedly against the real deployment:
login/register pages render, protected routes redirect unauthenticated
visitors, the API health check responds, and one full
register → dashboard → logout → login round trip using a tagged throwaway
account (`smoke.<timestamp>@example.test`) to verify the deployed stack
actually works end to end.

## What I'd add with more time

- **A staging environment** (separate Vercel deployment + separate MongoDB)
  so the full destructive suite could run post-deploy, before promoting to
  prod — right now there's a real gap between "passes locally" and "works
  on Vercel" that only the thin smoke suite covers.
- **Coverage for Budgets, Accounts, Categories, Profile/Settings, and AI
  Insights** — the initial suite focused on Auth, Dashboard, and
  Transactions; the same fixture pattern extends directly to the rest.
- **Visual regression** for the dashboard's charts/cards, and basic
  cross-browser coverage (currently chromium-only, see
  `playwright.config.ts` for why).

## A bug this work surfaced

`server/src/config/db.js` reads `process.env.MONGO_URI`, but
`server/.env.example` (and the README) documents `MONGODB_URI`. Following
the documented local setup exactly would leave the server unable to connect
to Mongo. The CI workflow above sets `MONGO_URI` to match the actual code;
worth fixing the naming mismatch in one file or the other.
