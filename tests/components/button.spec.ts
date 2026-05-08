import { expect, test } from '@playwright/test';

test('button docs exercise every variant and disabled semantics', async ({ page }) => {
  await page.goto('/components/button/');

  await expect(page.getByRole('button', { name: 'Save and continue' })).toHaveClass('gw-button');
  await expect(page.getByRole('button', { name: 'Save as draft' })).toHaveClass(/gw-button--secondary/);
  await expect(page.getByRole('button', { name: 'Cancel' })).toHaveClass(/gw-button--ghost/);
  await expect(page.getByRole('button', { name: 'Delete account' })).toHaveClass(/gw-button--destructive/);
  const disabledButton = page.getByRole('button', { name: 'Processing…' });
  await expect(disabledButton).toBeDisabled();
  await expect(disabledButton).toHaveCSS('cursor', 'not-allowed');
  await expect(disabledButton).toHaveCSS('pointer-events', 'auto');
});
