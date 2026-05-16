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
    heading: 'Get started',
    links: [
      { href: '/', label: 'Overview' },
      { href: '/get-started/architecture/', label: 'Architecture overview' },
    ],
  },
  {
    heading: 'Styles',
    links: [{ href: '/styles/', label: 'All styles' }],
  },
  {
    heading: 'Components',
    links: [{ href: '/components/', label: 'All components' }, ...componentDocs],
  },
  {
    heading: 'Patterns',
    links: [
      { href: '/patterns/', label: 'All patterns' },
      { href: '/patterns/submit-information/', label: 'Submit information' },
      { href: '/patterns/check-answers/', label: 'Check answers' },
    ],
  },
  {
    heading: 'Reference',
    links: [
      { href: '/reference/', label: 'Overview' },
      { href: '/reference/adr/', label: 'Architecture decisions' },
      { href: '/reference/api/', label: 'API reference' },
      { href: '/reference/conventions/flows-as-tests/', label: 'Flows as tests' },
      { href: '/reference/conventions/ui-review/', label: 'UI review workflow' },
      { href: '/reference/design-tokens-format/', label: 'Design tokens format' },
    ],
  },
] satisfies readonly DocsNavSection[];
