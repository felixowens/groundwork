import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface ComponentRoot {
  className: string;
  tagName: string;
}

const stackCases = [
  { className: 'gw-stack', token: '--space-4' },
  { className: 'gw-stack--sm', token: '--space-2' },
  { className: 'gw-stack--lg', token: '--space-8' },
  { className: 'gw-stack--xl', token: '--space-12' },
] as const;

function stackRootsFromComponentsCss(): ComponentRoot[] {
  const css = readFileSync('src/styles/components.css', 'utf8');
  const roots = Array.from(
    css.matchAll(/\/\*\s*@gw-stack-root\s+(?<className>[a-z0-9-]+)\s+(?<tagName>[a-z0-9-]+)\s*\*\//gu),
  ).map((match) => {
    const { className, tagName } = match.groups ?? {};

    if (className === undefined || tagName === undefined) {
      throw new Error(`Invalid @gw-stack-root annotation: ${match[0]}`);
    }

    return { className, tagName };
  });

  if (roots.length === 0) {
    throw new Error('No @gw-stack-root annotations found in src/styles/components.css.');
  }

  return roots;
}

const componentRoots = stackRootsFromComponentsCss();

function elementForRoot({ className, tagName }: ComponentRoot, testId: string): string {
  if (tagName === 'fieldset') {
    return `<fieldset class="${className}" data-testid="${testId}"><legend>Question</legend></fieldset>`;
  }

  if (tagName === 'table') {
    return `<table class="${className}" data-testid="${testId}"><tbody><tr><td>Cell</td></tr></tbody></table>`;
  }

  if (tagName === 'dl') {
    return `<dl class="${className}" data-testid="${testId}"><div><dt>Key</dt><dd>Value</dd></div></dl>`;
  }

  return `<${tagName} class="${className}" data-testid="${testId}">Content</${tagName}>`;
}

for (const { className: stackClass, token } of stackCases) {
  test(`${stackClass} owns vertical spacing for component root children`, async ({ page }) => {
    await page.setContent(`
      <main>
        ${componentRoots
          .map(
            (componentRoot) => `
              <section class="${stackClass}" data-component-class="${componentRoot.className}">
                ${elementForRoot(componentRoot, 'first')}
                ${elementForRoot(componentRoot, 'second')}
              </section>
            `,
          )
          .join('')}
      </main>
    `);
    await page.addStyleTag({ path: 'css/groundwork.css' });

    const spacings = await Promise.all(
      componentRoots.map(async (componentRoot) => {
        const section = page.locator(`[data-component-class="${componentRoot.className}"]`);
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

        return { componentClass: componentRoot.className, spacing };
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
