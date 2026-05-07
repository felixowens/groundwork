import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/tokens/',
  '/flows/',
  '/flows/contact-details/',
  '/components/button/',
  '/components/field/',
  '/components/error-summary/',
];

for (const path of pages) {
  test(`${path} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
