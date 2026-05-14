import { expect, test } from '@playwright/test';

test('banner docs exercise every variant and message structure', async ({ page }) => {
  await page.goto('/components/banner/');

  const bodylessBanner = page.getByText('System maintenance scheduled').locator('..');
  await expect(page.getByText('New terms of service')).toHaveClass('gw-banner__title');
  await expect(page.getByText('Review the updated terms before 1 July 2026.')).toHaveClass('gw-banner__body');
  await expect(bodylessBanner.locator('.gw-banner__body')).toHaveCount(0);
  await expect(page.getByText('New terms of service').locator('..')).toHaveClass('gw-banner');
  await expect(page.getByText('Address saved').locator('..')).toHaveClass(/gw-banner--success/);
  await expect(page.getByText('Session expires in 5 minutes').locator('..')).toHaveClass(/gw-banner--warning/);
  await expect(page.getByText('Payment failed').locator('..')).toHaveClass(/gw-banner--error/);
});

test('banner announcement mode controls live region semantics', async ({ page }) => {
  await page.goto('/components/banner/');

  const staticBanner = page.getByText('New terms of service').locator('..');
  await expect(staticBanner).not.toHaveAttribute('role');
  await expect(staticBanner).not.toHaveAttribute('aria-live');

  const politeBanner = page.getByText('Autosaved').locator('..');
  await expect(politeBanner).toHaveAttribute('role', 'status');
  await expect(politeBanner).toHaveAttribute('aria-live', 'polite');

  const assertiveBanner = page.getByText('Connection lost').locator('..');
  await expect(assertiveBanner).toHaveAttribute('role', 'alert');
  await expect(assertiveBanner).toHaveAttribute('aria-live', 'assertive');
});
