import { test, expect } from '../support/fixtures';

test.describe('Login', () => {
  test('signs in with valid credentials and reaches the dashboard', async ({ page, registered }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(registered.credentials.email);
    await page.getByPlaceholder('Password').fill(registered.credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // Counts as one failed /api/auth request against the shared 5-per-15min
  // rate limit (see tests/README.md) — avoid adding more negative-login cases here.
  test('shows an error and stays on the login page for a wrong password', async ({ page, registered }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(registered.credentials.email);
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toContainText('Login failed');
    await expect(page).toHaveURL(/\/$/);
  });

  test('links to registration and forgot password', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toHaveAttribute('href', '/forgot-password');
  });
});
