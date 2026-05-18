import { expect, test } from '@playwright/test';

test('code block copy button writes the snippet to the clipboard and announces the result', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/code-block/');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

  const heroFigure = page.locator('.gw-code-block-figure').first();
  const copyButton = heroFigure.getByRole('button', { name: 'Copy' });

  await expect(copyButton).toBeVisible();
  await copyButton.click();

  await expect(heroFigure.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(heroFigure.getByText('Code copied to clipboard.')).toBeAttached();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain('<Field id="email"');
});
