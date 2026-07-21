import { test, expect, primeSession, dismissWelcomeModal } from '../support/fixtures';
import { createTransaction } from '../support/api-client';
import { uniqueName } from '../support/test-data';

const DESCRIPTION_PLACEHOLDER = 'e.g., Grocery shopping, Gas station, Salary deposit';

test.describe('Transaction CRUD', () => {
  test.beforeEach(async ({ page, registered }) => {
    await primeSession(page, registered);
    await page.goto('/transactions');
    await dismissWelcomeModal(page);
  });

  test('adds an expense transaction through the modal', async ({ page, seededAccount, seededCategory }) => {
    const description = uniqueName('Groceries run');

    await page.getByRole('button', { name: 'Add Transaction' }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByPlaceholder(DESCRIPTION_PLACEHOLDER).fill(description);
    await dialog.getByPlaceholder('0.00').fill('42.50');

    await dialog.getByRole('button', { name: 'Select account' }).click();
    await page.getByRole('option', { name: new RegExp(seededAccount.name) }).click();

    // Selected last: overrides anything the description-blur AI auto-suggestion may have set.
    await dialog.getByRole('button', { name: 'Select category (optional)' }).click();
    await page.getByRole('option', { name: seededCategory.name, exact: true }).click();

    await dialog.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByRole('alert')).toContainText('Transaction added successfully');
    const row = page.getByRole('row', { name: new RegExp(description) });
    await expect(row).toBeVisible();
    await expect(row).toContainText('-$42.50');
    await expect(row).toContainText(seededCategory.name);
  });

  test('requires an account before an expense can be submitted', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Transaction' }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByPlaceholder(DESCRIPTION_PLACEHOLDER).fill(uniqueName('No account expense'));
    await dialog.getByPlaceholder('0.00').fill('10');
    await dialog.getByRole('button', { name: 'Add Transaction' }).click();

    await expect(page.getByRole('alert')).toContainText('Please select an account');
    await expect(dialog).toBeVisible();
  });

  test('edits a transaction description inline', async ({ page, request, registered, seededAccount }) => {
    const original = uniqueName('Coffee shop');
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 12,
      description: original,
      date: new Date().toISOString().slice(0, 10),
      account: seededAccount.id,
    });
    await page.reload();

    const row = page.getByRole('row', { name: new RegExp(original) });
    await row.getByRole('button', { name: 'Edit' }).click();

    const updated = uniqueName('Coffee shop updated');
    await row.locator('input[name="description"]').fill(updated);
    await row.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('alert')).toContainText('Transaction updated successfully');
    await expect(page.getByRole('row', { name: new RegExp(updated) })).toBeVisible();
  });

  test('deletes a transaction after confirmation', async ({ page, request, registered, seededAccount }) => {
    const description = uniqueName('One-off purchase');
    await createTransaction(request, registered.data.accessToken, {
      type: 'expense',
      amount: 30,
      description,
      date: new Date().toISOString().slice(0, 10),
      account: seededAccount.id,
    });
    await page.reload();

    const row = page.getByRole('row', { name: new RegExp(description) });
    await row.getByRole('button', { name: 'Delete' }).click();

    const confirmDialog = page.getByRole('dialog');
    await expect(confirmDialog).toContainText('Delete Transaction');
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByRole('alert')).toContainText('Transaction deleted successfully');
    await expect(page.getByRole('row', { name: new RegExp(description) })).toHaveCount(0);
  });
});
