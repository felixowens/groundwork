import { expect, test } from '@playwright/test';

test('pattern card body is not a link — only the heading link navigates', async ({ page }) => {
  await page.goto('/patterns/');

  const card = page.getByRole('article').filter({ hasText: 'Help users submit information correctly' });
  await expect(card).not.toHaveCSS('cursor', 'pointer');

  const link = card.getByRole('link', { name: 'Help users submit information correctly' });
  await link.click();
  await expect(page).toHaveURL(/\/patterns\/submit-information\/$/);
});
