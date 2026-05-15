import { existsSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { componentDocs, docsNavSections } from '../docs/src/docs-registry';

function candidatePagePathsForHref(href: string): string[] {
  if (href === '/') {
    return ['docs/src/pages/index.astro'];
  }

  const routePath = href.replace(/^\//u, '').replace(/\/$/u, '');

  return [join('docs/src/pages', `${routePath}.astro`), join('docs/src/pages', routePath, 'index.astro')];
}

function hrefResolvesToPage(href: string): boolean {
  return candidatePagePathsForHref(href).some((path) => existsSync(path));
}

function componentPageHrefs(): string[] {
  return readdirSync('docs/src/pages/components', { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.isFile() && extname(entry.name) === '.astro' && entry.name !== 'index.astro') {
        return [`/components/${basename(entry.name, '.astro')}/`];
      }

      if (entry.isDirectory() && existsSync(join('docs/src/pages/components', entry.name, 'index.astro'))) {
        return [`/components/${entry.name}/`];
      }

      return [];
    })
    .sort();
}

describe('docs registry', () => {
  test('all navigation links resolve to docs pages', () => {
    const links = docsNavSections.flatMap((section) => section.links);

    expect(links.map((link) => link.href)).toHaveLength(new Set(links.map((link) => link.href)).size);

    for (const link of links) {
      expect.soft(hrefResolvesToPage(link.href), `${link.href} should resolve to a docs page`).toBe(true);
    }
  });

  test('all component pages are registered in componentDocs', () => {
    expect(componentDocs.map((component) => component.href).sort()).toEqual(componentPageHrefs());
  });

  test('component labels are human-readable', () => {
    for (const component of componentDocs) {
      expect.soft(component.label, component.href).not.toMatch(/[a-z][A-Z]/u);
    }
  });

  test('component overview uses the same component list as navigation', () => {
    const componentNavLinks = docsNavSections.find((section) => section.heading === 'Components')?.links.slice(1);

    expect(componentNavLinks).toEqual(componentDocs);
  });
});
