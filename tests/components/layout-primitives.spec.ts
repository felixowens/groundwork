import { expect, test } from '@playwright/test';

const stackCases = [
  { className: 'gw-stack', token: '--space-4' },
  { className: 'gw-stack--sm', token: '--space-2' },
  { className: 'gw-stack--lg', token: '--space-8' },
  { className: 'gw-stack--xl', token: '--space-12' },
] as const;

// Keep this ledger aligned with public component root classes in src/styles/components.css.
// The stack invariant protects component roots from resetting margins and overriding layout primitives.
const componentRootClasses = [
  'gw-banner',
  'gw-card',
  'gw-error-summary',
  'gw-field',
  'gw-fieldset',
  'gw-summary-list',
  'gw-table',
] as const;

function elementForClass(className: string, testId: string): string {
  if (className === 'gw-fieldset') {
    return `<fieldset class="${className}" data-testid="${testId}"><legend>Question</legend></fieldset>`;
  }

  if (className === 'gw-table') {
    return `<table class="${className}" data-testid="${testId}"><tbody><tr><td>Cell</td></tr></tbody></table>`;
  }

  if (className === 'gw-summary-list') {
    return `<dl class="${className}" data-testid="${testId}"><div><dt>Key</dt><dd>Value</dd></div></dl>`;
  }

  return `<div class="${className}" data-testid="${testId}">Content</div>`;
}

for (const { className: stackClass, token } of stackCases) {
  test(`${stackClass} owns vertical spacing for component root children`, async ({ page }) => {
    await page.setContent(`
      <main>
        ${componentRootClasses
          .map(
            (componentClass) => `
              <section class="${stackClass}" data-component-class="${componentClass}">
                ${elementForClass(componentClass, 'first')}
                ${elementForClass(componentClass, 'second')}
              </section>
            `,
          )
          .join('')}
      </main>
    `);
    await page.addStyleTag({ path: 'css/groundwork.css' });

    const spacings = await Promise.all(
      componentRootClasses.map(async (componentClass) => {
        const section = page.locator(`[data-component-class="${componentClass}"]`);
        const spacing = await section.locator('[data-testid="second"]').evaluate((element, expectedToken) => {
          const probe = document.createElement('div');
          probe.style.width = getComputedStyle(document.documentElement).getPropertyValue(expectedToken).trim();
          document.body.append(probe);
          const expectedPixels = getComputedStyle(probe).width;
          probe.remove();

          return {
            actual: getComputedStyle(element).marginTop,
            expected: expectedPixels,
          };
        }, token);

        return { componentClass, spacing };
      }),
    );

    for (const { componentClass, spacing } of spacings) {
      expect(spacing, `${componentClass} should preserve ${stackClass} spacing`).toEqual({
        actual: spacing.expected,
        expected: spacing.expected,
      });
    }
  });
}
