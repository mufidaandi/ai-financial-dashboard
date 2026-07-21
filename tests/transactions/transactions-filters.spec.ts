import { test, expect, primeSession, dismissWelcomeModal } from '../support/fixtures';
import { createTransaction } from '../support/api-client';
import { uniqueName } from '../support/test-data';

const today = () => new Date().toISOString().slice(0, 10);

test.describe('Transaction filtering, search, and sort', () => {
  let salary: string;
  let coffee: string;
  let rent: string;

  test.beforeEach(async ({ page, request, registered, seededAccount, seededCategory }) => {
    salary = uniqueName('Salary payment');
    coffee = uniqueName('Coffee run');
    rent = uniqueName('Rent payment');

    await createTransaction(request, registered.data.accessToken, {
      type: 'income',
      amount: 1000,
      description: salary,
      date: today(),
      account: seededAccount.id,
    });
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 25,
      description: coffee,
      date: today(),
      account: seededAccount.id,
      category: seededCategory.id,
    });
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 300,
      description: rent,
      date: today(),
      account: seededAccount.id,
    });

    await primeSession(page, registered);
    await page.goto('/transactions');
    await dismissWelcomeModal(page);
  });

  test('search narrows the table to matching rows', async ({ page }) => {
    await page.getByPlaceholder('Search transactions').fill('Coffee');

    await expect(page.getByRole('row', { name: new RegExp(coffee) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(salary) })).toHaveCount(0);
    await expect(page.getByRole('row', { name: new RegExp(rent) })).toHaveCount(0);
  });

  test('type filter shows only income rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Filters' }).click();
    await page.getByRole('button', { name: 'All Types' }).click();
    await page.getByRole('option', { name: 'Income', exact: true }).click();

    await expect(page.getByRole('row', { name: new RegExp(salary) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(coffee) })).toHaveCount(0);
    await expect(page.getByRole('row', { name: new RegExp(rent) })).toHaveCount(0);
  });

  test('category filter shows only transactions in that category', async ({ page, seededCategory }) => {
    await page.getByRole('button', { name: 'Show Filters' }).click();
    await page.getByRole('button', { name: 'All Categories' }).click();
    await page.getByRole('option', { name: seededCategory.name, exact: true }).click();

    await expect(page.getByRole('row', { name: new RegExp(coffee) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(rent) })).toHaveCount(0);
  });

  test('clear filters restores the full list', async ({ page }) => {
    await page.getByPlaceholder('Search transactions').fill('Coffee');
    await expect(page.getByRole('row', { name: new RegExp(salary) })).toHaveCount(0);

    await page.getByRole('button', { name: 'Show Filters' }).click();
    await page.getByRole('button', { name: 'Clear Filters' }).click();

    await expect(page.getByRole('row', { name: new RegExp(salary) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(coffee) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(rent) })).toBeVisible();
  });

  test('sorting by amount toggles ascending and descending order', async ({ page }) => {
    const amountHeader = page.getByRole('columnheader', { name: 'Amount' });

    await amountHeader.getByRole('button').click(); // ascending
    let rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText(rent); // -$300.00 sorts before -$25.00 and +$1,000.00

    await amountHeader.getByRole('button').click(); // descending
    rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText(salary); // +$1,000.00 sorts first
  });
});
