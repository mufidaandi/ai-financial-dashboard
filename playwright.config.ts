import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite runs against the real Express/MongoDB backend (see tests/README.md).
 * Start both dev servers yourself (as in the README's "Getting Started" section)
 * and Playwright will reuse them; otherwise it tries to start them itself, which
 * only works if server/.env is already configured.
 */
const CLIENT_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const API_HEALTH_URL = process.env.PLAYWRIGHT_API_HEALTH_URL || 'http://localhost:3000/health';

export default defineConfig({
  testDir: './tests',
  // The prod smoke suite has its own config/runner (playwright.smoke.config.ts)
  // and must never run as part of the local/CI destructive suite.
  testIgnore: '**/smoke/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* Auth negative-path tests share a fixed, IP-based rate limit (5 failed attempts / 15 min)
   * on the real backend, so retries there don't help and can make things worse. */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    // Enable once the core suite is green; kept off by default to avoid
    // tripling requests against the shared auth rate limit during local runs.
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: './client',
      url: CLIENT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'node src/server.js',
      cwd: './server',
      url: API_HEALTH_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
