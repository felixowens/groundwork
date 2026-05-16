import { readdirSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';

export interface DocsPage {
  path: string;
  snapshot: string;
}

function docPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'test-fixtures' ? [] : docPages(entryPath);
    }

    if (!entry.isFile()) {
      return [];
    }
    if (entry.name.includes('[')) {
      return [];
    }
    return entry.name.endsWith('.astro') || entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
}

function routeFromPage(page: string): string {
  const relativePath = relative('docs/src/pages', page).split(sep).join('/');
  const withoutExtension = relativePath.replace(/\.(astro|mdx)$/, '');
  const withoutIndex = withoutExtension.replace(/(^|\/)index$/, '');

  const normalizedPath = `/${withoutIndex}`.replace(/\/+/g, '/').replace(/\/$/, '');

  return `${normalizedPath}/`;
}

function snapshotNameForRoute(path: string): string {
  if (path === '/') {
    return 'overview.png';
  }

  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    throw new Error(`Could not derive snapshot name for docs route: ${path}`);
  }

  return `${segments.join('-').toLowerCase()}.png`;
}

function adrRoutes(): string[] {
  return readdirSync('docs/adr', { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `/reference/adr/${basename(entry.name, '.md')}/`);
}

export const docsPages: readonly DocsPage[] = [...docPages('docs/src/pages').map(routeFromPage), ...adrRoutes()]
  .sort()
  .map((path) => ({ path, snapshot: snapshotNameForRoute(path) }));
