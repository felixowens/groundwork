import { expect, test } from '@playwright/test';

test('renders nothing when there are no errors', async ({ page }) => {
  await page.goto('/test-fixtures/error-summary-empty/');

  await expect(page.getByTestId('empty-error-summary')).toBeEmpty();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('includes field context in the summary link accessible name', async ({ page }) => {
  await page.goto('/components/error-summary/');

  await expect(page.getByRole('link', { name: /Email address: The email address is missing a domain/ })).toBeVisible();
});
