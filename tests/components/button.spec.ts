import { expect, test } from '@playwright/test';

test('button docs exercise every variant and disabled semantics', async ({ page }) => {
  await page.goto('/components/button/');

  const hero = page.locator('.gw-button-group').first();

  await expect(hero.getByRole('button', { name: 'Save and continue' })).toHaveClass('gw-button');
  await expect(hero.getByRole('button', { name: 'Save as draft' })).toHaveClass(/gw-button--secondary/);
  await expect(hero.getByRole('button', { name: 'Cancel' })).toHaveClass(/gw-button--ghost/);
  await expect(hero.getByRole('button', { name: 'Delete account' })).toHaveClass(/gw-button--destructive/);
  const disabledButton = hero.getByRole('button', { name: 'Processing…' });
  await expect(disabledButton).toBeDisabled();
  await expect(disabledButton).toHaveCSS('cursor', 'not-allowed');
  await expect(disabledButton).toHaveCSS('pointer-events', 'auto');
});
