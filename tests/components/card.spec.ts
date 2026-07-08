import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components/card/');
});

test('a plain card renders as a non-interactive div', async ({ page }) => {
  const card = page.locator('div.gw-card', { hasText: 'Active this week' });

  await expect(card).toBeVisible();
  await expect(card).not.toHaveClass(/gw-card--interactive/);
});

test('the raised variant carries the elevation modifier', async ({ page }) => {
  const card = page.locator('.gw-card--raised', { hasText: 'Revenue' });

  await expect(card).toBeVisible();
});

test('a card with href renders as a real link with the interactive modifier', async ({ page }) => {
  const card = page.getByRole('link', { name: /March breakdown/ });

  await expect(card).toHaveClass(/gw-card/);
  await expect(card).toHaveClass(/gw-card--interactive/);
  await expect(card).toHaveAttribute('href', '#march-report');
});

test('a link card is reachable by keyboard', async ({ page }) => {
  const card = page.getByRole('link', { name: /March breakdown/ });

  await card.focus();
  await expect(card).toBeFocused();
});

test('nested cards render inside a raised card without extra props', async ({ page }) => {
  const parent = page.locator('.gw-card--raised', { hasText: 'Card on a raised surface' });

  await expect(parent.locator('.gw-card', { hasText: 'Nested card' })).toBeVisible();
  await expect(parent.locator('.gw-card', { hasText: 'Also nested' })).toBeVisible();
});
