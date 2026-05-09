import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { componentDocs, docsNavSections } from '../docs/src/docs-registry';

function pagePathForHref(href: string): string {
  if (href === '/') {
    return 'docs/src/pages/index.astro';
  }

  return join('docs/src/pages', href, 'index.astro');
}

describe('docs registry', () => {
  test('all navigation links resolve to docs pages', () => {
    const links = docsNavSections.flatMap((section) => section.links);

    expect(links.map((link) => link.href)).toHaveLength(new Set(links.map((link) => link.href)).size);

    for (const link of links) {
      expect.soft(existsSync(pagePathForHref(link.href)), `${link.href} should resolve to a docs page`).toBe(true);
    }
  });

  test('component overview uses the same component list as navigation', () => {
    const componentNavLinks = docsNavSections.find((section) => section.heading === 'Components')?.links.slice(1);

    expect(componentNavLinks).toEqual(componentDocs.map(({ href, label }) => ({ href, label })));
  });
});
