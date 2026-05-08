import { expect, test } from '@playwright/test';
import { docsPages } from '../docs-pages';

for (const { path, snapshot } of docsPages) {
  test(`${path} matches the visual baseline`, async ({ page }) => {
    await page.goto(path);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await expect(page).toHaveScreenshot(snapshot, { fullPage: true });
  });
}
