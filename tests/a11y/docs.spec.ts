import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { docsPages } from '../docs-pages';

for (const { path } of docsPages) {
  test(`${path} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
