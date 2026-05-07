import { expect, test } from '@playwright/test';

test('flow card body is not a link — only the heading link navigates', async ({ page }) => {
  await page.goto('/flows/');

  const card = page.getByRole('article').filter({ hasText: 'Contact details' });
  await expect(card).not.toHaveCSS('cursor', 'pointer');

  const link = card.getByRole('link', { name: 'Contact details' });
  await link.click();
  await expect(page).toHaveURL(/\/flows\/contact-details\/$/);
});
