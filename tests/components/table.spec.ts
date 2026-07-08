import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components/table/');
});

test('table exposes its caption as the accessible name', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Recent invoices' });

  await expect(table).toBeVisible();
  await expect(table.locator('caption')).toHaveText('Recent invoices');
});

test('column headers expose the columnheader role', async ({ page }) => {
  const head = page.locator('.gw-table thead');

  await expect(head.getByRole('columnheader')).toHaveText(['Reference', 'Client', 'Status', 'Amount']);
  await expect(head.getByRole('rowheader')).toHaveCount(0);
});

test('the row-header column exposes the rowheader role', async ({ page }) => {
  const body = page.locator('.gw-table tbody');

  await expect(body.getByRole('rowheader')).toHaveText(['INV-001', 'INV-002', 'INV-003']);
  await expect(body.locator('th.gw-table__row-header')).toHaveCount(3);
});

test('numeric columns carry the alignment modifier on head and body cells', async ({ page }) => {
  await expect(page.locator('.gw-table thead th.gw-table__numeric')).toHaveText('Amount');
  await expect(page.locator('.gw-table tbody td.gw-table__numeric')).toHaveText(['£240.00', '£1,180.50', '£96.00']);
});

test('status is carried by a labelled tag, not colour alone', async ({ page }) => {
  const firstRow = page.locator('.gw-table tbody tr').first();

  await expect(firstRow.locator('.gw-tag')).toHaveText('Paid');
});
