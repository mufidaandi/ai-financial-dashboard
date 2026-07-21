import { test, expect } from '../support/fixtures';
import { registerUser } from '../support/api-client';
import { makeUser } from '../support/test-data';

test.describe('Registration', () => {
  test('creates an account and lands on the dashboard', async ({ page }) => {
    const user = makeUser();

    await page.goto('/register');
    await page.getByPlaceholder('Name').fill(user.name);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // Counts as one failed /api/auth request against the shared 5-per-15min
  // rate limit — keep additional duplicate-email cases out of this suite.
  test('rejects an email that is already registered', async ({ page, request }) => {
    const user = makeUser();
    await registerUser(request, user);

    await page.goto('/register');
    await page.getByPlaceholder('Name').fill(user.name);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('alert')).toContainText('Registration failed');
    await expect(page).toHaveURL(/\/register$/);
  });

  test('keeps the submit button inert until required fields are filled', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Register' }).click();

    // Native HTML5 required-field validation blocks submission client-side.
    await expect(page).toHaveURL(/\/register$/);
  });
});
