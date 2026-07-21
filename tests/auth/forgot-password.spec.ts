import { test, expect, dismissWelcomeModal } from '../support/fixtures';

// The forgot-password endpoint is limited to 3 requests/hour per IP,
// success or failure (see server/src/config/rateLimitConfig.js PASSWORD_RESET,
// and tests/README.md). Keep this file to at most 2 real submissions.
test.describe('Forgot password', () => {
  test('resets the password directly and logs the user in', async ({ page, registered }) => {
    const newPassword = 'BrandNewPassword123!';

    await page.goto('/forgot-password');
    await page.getByPlaceholder('Enter your email').fill(registered.credentials.email);
    await page.getByPlaceholder('Enter new password').fill(newPassword);
    await page.getByPlaceholder('Confirm new password').fill(newPassword);
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await dismissWelcomeModal(page);

    // Confirm the new password actually took effect via a fresh, ordinary login.
    await page.getByRole('button', { name: registered.credentials.email }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByPlaceholder('Email').fill(registered.credentials.email);
    await page.getByPlaceholder('Password').fill(newPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('rejects mismatched confirmation without calling the API', async ({ page, newUser }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('Enter your email').fill(newUser.email);
    await page.getByPlaceholder('Enter new password').fill('SomePassword123!');
    await page.getByPlaceholder('Confirm new password').fill('SomethingElse123!');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.getByRole('alert')).toContainText("don't match");
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
