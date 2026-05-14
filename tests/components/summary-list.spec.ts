import { expect, test } from '@playwright/test';

test('summary list renders description-list rows with contextual actions', async ({ page }) => {
  await page.goto('/components/summary-list/');

  const summaryList = page.locator('.gw-summary-list').first();
  await expect(summaryList).toBeVisible();
  await expect(summaryList).toHaveJSProperty('tagName', 'DL');
  await expect(summaryList.locator('.gw-summary-list__row')).toHaveCount(4);

  await expect(page.getByRole('link', { name: 'Change name' })).toBeVisible();
  const contactActions = summaryList.locator('.gw-summary-list__actions-list');
  await expect(contactActions).toHaveCount(1);
  await expect(contactActions.getByRole('listitem')).toHaveCount(2);
  await expect(contactActions.getByRole('link', { name: 'Add contact details' })).toBeVisible();
  await expect(contactActions.getByRole('link', { name: 'Change contact details' })).toBeVisible();
});

test('summary list supports rows without actions and button actions', async ({ page }) => {
  await page.goto('/components/summary-list/');

  await expect(page.locator('.gw-summary-list__row--no-actions')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Refresh status' })).toHaveAttribute('type', 'button');
  await expect(page.getByRole('link', { name: 'Enter contact information' })).toBeVisible();
});

test('summary list renders nothing when there are no rows', async ({ page }) => {
  await page.goto('/test-fixtures/summary-list-empty/');

  await expect(page.getByTestId('empty-summary-list')).toBeEmpty();
  await expect(page.locator('.gw-summary-list')).toHaveCount(0);
});

test('summary list protects target blank link actions', async ({ page }) => {
  await page.goto('/test-fixtures/summary-list-link-security/');

  await expect(page.getByRole('link', { name: 'Open external record' })).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.getByRole('link', { name: 'Open existing rel record' })).toHaveAttribute(
    'rel',
    'external noopener noreferrer',
  );
});

test('summary list actions are keyboard reachable in row order', async ({ page }) => {
  await page.goto('/components/summary-list/');

  await page.getByRole('link', { name: 'Change name' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Change date of birth' })).toBeFocused();

  await page.getByRole('button', { name: 'Refresh status' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Enter contact information' })).toBeFocused();
});
