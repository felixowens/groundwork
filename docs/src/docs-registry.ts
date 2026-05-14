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

export const componentDocs = [
  {
    description: 'Page-level messages with required titles and closed statuses.',
    href: '/components/banner/',
    label: 'Banner',
  },
  {
    description: 'Actions with closed visual variants and clear hierarchy.',
    href: '/components/button/',
    label: 'Button',
  },
  {
    description: 'The primary form API for labels, hints, errors, and ARIA wiring.',
    href: '/components/field/',
    label: 'Field',
  },
  {
    description: 'Single-line answers with width hints for expected answer length.',
    href: '/components/input/',
    label: 'Input',
  },
  {
    description: 'One choice from a short, known list.',
    href: '/components/select/',
    label: 'Select',
  },
  {
    description: 'Longer free-text answers that need more than one line.',
    href: '/components/textarea/',
    label: 'Textarea',
  },
  {
    description: 'Page-level validation summary that links back to invalid fields.',
    href: '/components/error-summary/',
    label: 'Error summary',
  },
  {
    description: 'Key/value facts for check-your-answers screens and read-only details.',
    href: '/components/summary-list/',
    label: 'SummaryList',
  },
  {
    description: 'One choice from a short visible list, grouped with fieldset and legend.',
    href: '/components/radio-group/',
    label: 'RadioGroup',
  },
  {
    description: 'Multiple choices from a short visible list, grouped with fieldset and legend.',
    href: '/components/checkbox-group/',
    label: 'CheckboxGroup',
  },
] satisfies readonly ComponentDoc[];

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
