import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', snapshot: 'overview.png' },
  { path: '/tokens/', snapshot: 'tokens.png' },
  { path: '/flows/', snapshot: 'flows.png' },
  { path: '/flows/contact-details/', snapshot: 'contact-details-flow.png' },
  { path: '/components/button/', snapshot: 'button.png' },
  { path: '/components/field/', snapshot: 'field.png' },
  { path: '/components/error-summary/', snapshot: 'error-summary.png' },
];

for (const { path, snapshot } of pages) {
  test(`${path} matches the visual baseline`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(snapshot, { fullPage: true });
  });
}
