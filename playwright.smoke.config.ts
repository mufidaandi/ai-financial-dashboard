import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke suite for the live Vercel deployment. Deliberately separate from
 * playwright.config.ts: no local webServer, single worker, and only
 * safe/non-destructive checks (see tests/smoke/smoke.spec.ts) — this hits
 * the real production database, so it must never run the full CRUD suite.
 */
const CLIENT_URL = process.env.SMOKE_BASE_URL || 'https://expensure.vercel.app';
const API_BASE_URL = process.env.SMOKE_API_BASE_URL || 'https://ai-financial-dashboard-api.vercel.app';

// tests/support/config.ts and tests/support/fixtures.ts are shared with the
// local suite and read PLAYWRIGHT_API_URL; set it here rather than forking them.
process.env.PLAYWRIGHT_API_URL = `${API_BASE_URL}/api`;
process.env.SMOKE_API_BASE_URL = API_BASE_URL;

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: CLIENT_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
