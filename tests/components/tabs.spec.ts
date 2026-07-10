import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components/tabs/');
  // Wait for the demo island to hydrate before driving keyboard and click
  // interaction — Astro drops the `ssr` marker once a client:load island is live.
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
});

test('the tab list exposes its accessible name', async ({ page }) => {
  await expect(page.getByRole('tablist', { name: 'Server details' })).toBeVisible();
});

test('the first tab is selected and its panel is the only one shown', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'Config' })).toBeHidden();
});

test('clicking a tab selects it and reveals its panel', async ({ page }) => {
  await page.getByRole('tab', { name: 'Config' }).click();

  await expect(page.getByRole('tab', { name: 'Config' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel', { name: 'Config' })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeHidden();
});

test('arrow keys move between tabs and selection follows focus', async ({ page }) => {
  await page.getByRole('tab', { name: 'Overview' }).focus();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Config' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Config' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Config' })).toBeVisible();
});

test('arrow keys wrap at the ends of the tab list', async ({ page }) => {
  await page.getByRole('tab', { name: 'Overview' }).focus();

  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Logs' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Logs' })).toHaveAttribute('aria-selected', 'true');
});

test('Home and End jump to the first and last tabs', async ({ page }) => {
  await page.getByRole('tab', { name: 'Overview' }).focus();

  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Logs' })).toBeFocused();

  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeFocused();
});

test('only the selected tab is in the tab order (roving tabindex)', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
  await expect(page.getByRole('tab', { name: 'Config' })).toHaveAttribute('tabindex', '-1');
});
