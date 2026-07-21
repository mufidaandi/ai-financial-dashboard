import { test, expect, dismissWelcomeModal } from '../support/fixtures';
import { makeUser } from '../support/test-data';

/**
 * Runs against the live Vercel deployment (see playwright.smoke.config.ts).
 * Keep this suite non-destructive: read-only checks, plus at most one
 * throwaway account per run to prove the deployed frontend, API, and
 * production database actually work together end to end. Never add
 * transaction/account/budget CRUD here — that belongs in the local suite.
 */
test.describe('Production smoke checks', () => {
  test('login page is reachable and renders the login form', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('login page links to register and forgot password', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toHaveAttribute('href', '/forgot-password');
  });

  test('register page is reachable', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('unauthenticated visitors are redirected away from protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/$/);
  });

  test('API health endpoint responds', async ({ request }) => {
    const res = await request.get(`${process.env.SMOKE_API_BASE_URL}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('OK');
  });

  test('register -> dashboard -> logout -> login round trip works end to end', async ({ page }) => {
    const user = makeUser('smoke');

    await page.goto('/register');
    await page.getByPlaceholder('Name').fill(user.name);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await dismissWelcomeModal(page);

    await page.getByRole('button', { name: user.email }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
