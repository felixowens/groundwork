import type { ComponentMeta } from './component-meta';

export interface DocsLink {
  href: string;
  label: string;
}

export interface DocsNavSection {
  heading: string;
  links: readonly DocsLink[];
}

export interface ComponentDoc extends DocsLink {
  description: string;
}

interface ComponentMetaModule {
  meta: ComponentMeta;
}

const componentMetaModules = import.meta.glob<ComponentMetaModule>('./pages/components/_meta/*.ts', { eager: true });

function hrefFromMetaPath(metaPath: string): string {
  const slug = metaPath.replace('./pages/components/_meta/', '').replace('.ts', '');
  return `/components/${slug}/`;
}

export const componentDocs: readonly ComponentDoc[] = Object.entries(componentMetaModules)
  .sort(([, a], [, b]) => a.meta.order - b.meta.order)
  .map(([path, mod]) => ({
    label: mod.meta.label,
    description: mod.meta.description,
    href: hrefFromMetaPath(path),
  }));

export const docsNavSections = [
  {
    heading: 'Start',
    links: [
      { href: '/', label: 'Overview' },
      { href: '/tokens/', label: 'Tokens' },
    ],
  },
  {
    heading: 'Components',
    links: [{ href: '/components/', label: 'All components' }, ...componentDocs],
  },
  {
    heading: 'Guides',
    links: [
      { href: '/flows/', label: 'Flows' },
      { href: '/wiki/', label: 'Wiki' },
    ],
  },
] satisfies readonly DocsNavSection[];
