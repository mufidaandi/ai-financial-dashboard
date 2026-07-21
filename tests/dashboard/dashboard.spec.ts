import { test, expect, primeSession } from '../support/fixtures';
import { createTransaction } from '../support/api-client';

function today() {
  return new Date().toISOString().slice(0, 10);
}

test.describe('Dashboard', () => {
  test('shows empty states for a brand-new user with no data', async ({ authedPage }) => {
    await expect(authedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(authedPage.getByText('No transactions found for selected month.')).toBeVisible();
    await expect(authedPage.getByText('No spending data yet.')).toBeVisible();
    await expect(authedPage.getByText('No budgets created yet')).toBeVisible();
  });

  test('reflects seeded income/expense transactions in the period metrics', async ({
    page,
    request,
    registered,
    seededAccount,
    seededCategory,
  }) => {
    await createTransaction(request, registered.data.accessToken, {
      type: 'income',
      amount: 500,
      description: 'Paycheck',
      date: today(),
      account: seededAccount.id,
    });
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 200,
      description: 'Groceries run',
      date: today(),
      account: seededAccount.id,
      category: seededCategory.id,
    });

    await primeSession(page, registered);
    await page.goto('/dashboard');

    await expect(page.locator('[aria-label="Period income: $500.00"]')).toBeVisible();
    await expect(page.locator('[aria-label="Period expenses: $200.00"]')).toBeVisible();
    await expect(page.locator('[aria-label="Net change: positive $300.00"]')).toBeVisible();

    await expect(page.getByRole('cell', { name: 'Paycheck' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Groceries run' })).toBeVisible();
    await expect(page.getByText(seededCategory.name)).toBeVisible();
  });

  test('month filter narrows the recent transactions list', async ({
    page,
    request,
    registered,
    seededAccount,
  }) => {
    const lastMonthDate = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 2); // stay clear of the "fall back to previous month" behavior
      return d.toISOString().slice(0, 10);
    })();

    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 50,
      description: 'Old expense',
      date: lastMonthDate,
      account: seededAccount.id,
    });
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 75,
      description: 'Current expense',
      date: today(),
      account: seededAccount.id,
    });

    await primeSession(page, registered);
    await page.goto('/dashboard');

    await expect(page.getByRole('cell', { name: 'Current expense' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Old expense' })).not.toBeVisible();
  });
});
