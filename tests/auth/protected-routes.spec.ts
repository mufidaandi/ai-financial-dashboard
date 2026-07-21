import { test, expect } from '../support/fixtures';

test.describe('Route protection', () => {
  for (const path of ['/dashboard', '/transactions', '/accounts', '/budgets']) {
    test(`redirects an unauthenticated visitor away from ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('logout clears the session and locks protected routes again', async ({ authedPage, registered }) => {
    await authedPage.getByRole('button', { name: registered.credentials.email }).click();
    await authedPage.getByRole('button', { name: 'Logout' }).click();

    await expect(authedPage).toHaveURL(/\/$/);

    await authedPage.goto('/dashboard');
    await expect(authedPage).toHaveURL(/\/$/);
  });
});
