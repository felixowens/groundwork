import { expect, test } from '@playwright/test';

test('summary list renders description-list rows with contextual actions', async ({ page }) => {
  await page.goto('/components/summary-list/');

  const summaryList = page.locator('.gw-summary-list').first();
  await expect(summaryList).toBeVisible();
  await expect(summaryList).toHaveJSProperty('tagName', 'DL');
  await expect(summaryList.locator('.gw-summary-list__row')).toHaveCount(4);

  await expect(page.getByRole('link', { name: 'Change name' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add contact details' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Change contact details' })).toBeVisible();
});

test('summary list supports rows without actions and button actions', async ({ page }) => {
  await page.goto('/components/summary-list/');

  await expect(page.locator('.gw-summary-list__row--no-actions')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Refresh status' })).toHaveAttribute('type', 'button');
  await expect(page.getByRole('link', { name: 'Enter contact information' })).toBeVisible();
});
