import { expect, test } from '@playwright/test';

test('tag docs exercise every variant with a visible label', async ({ page }) => {
  await page.goto('/components/tag/');

  await expect(page.locator('.gw-tag', { hasText: 'Draft' })).toHaveClass('gw-tag');
  await expect(page.locator('.gw-tag', { hasText: 'New' })).toHaveClass(/gw-tag--action/);
  await expect(page.locator('.gw-tag', { hasText: 'Paid' })).toHaveClass(/gw-tag--success/);
  await expect(page.locator('.gw-tag', { hasText: 'Pending' })).toHaveClass(/gw-tag--warning/);
  await expect(page.locator('.gw-tag', { hasText: 'Overdue' })).toHaveClass(/gw-tag--error/);
});

test('neutral tag carries no variant modifier class', async ({ page }) => {
  await page.goto('/components/tag/');

  const neutralTag = page.locator('.gw-tag', { hasText: 'Draft' });
  await expect(neutralTag).toHaveClass('gw-tag');
  await expect(neutralTag).not.toHaveClass(/gw-tag--/);
});
