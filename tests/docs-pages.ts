import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export interface DocsPage {
  path: string;
  snapshot: string;
}

function astroPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'test-fixtures' ? [] : astroPages(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.astro') ? [entryPath] : [];
  });
}

function routeFromPage(page: string): string {
  const relativePath = relative('docs/src/pages', page).split(sep).join('/');
  const withoutExtension = relativePath.replace(/\.astro$/, '');
  const withoutIndex = withoutExtension.replace(/(^|\/)index$/, '');

  const normalizedPath = `/${withoutIndex}`.replace(/\/+/g, '/').replace(/\/$/, '');

  return `${normalizedPath}/`;
}

function snapshotNameForRoute(path: string): string {
  if (path === '/') {
    return 'overview.png';
  }

  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments.at(-1);

  if (lastSegment === undefined) {
    throw new Error(`Could not derive snapshot name for docs route: ${path}`);
  }

  if (segments[0] === 'flows' && segments.length > 1) {
    return `${lastSegment}-flow.png`;
  }

  return `${lastSegment}.png`;
}

export const docsPages: readonly DocsPage[] = astroPages('docs/src/pages')
  .map((page) => routeFromPage(page))
  .sort()
  .map((path) => ({ path, snapshot: snapshotNameForRoute(path) }));
