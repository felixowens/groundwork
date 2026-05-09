import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createProjectContext } from '../context.mjs';
import { rules } from '../rules/index.mjs';

function writeFixtureFile(cwd, relativePath, content) {
  const path = join(cwd, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function diagnosticsForFixture(files) {
  const cwd = mkdtempSync(join(tmpdir(), 'groundwork-project-rules-'));

  try {
    const fixtureFiles = {
      'tsconfig.build.json': JSON.stringify({
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          target: 'ES2022',
        },
        include: ['src/**/*.ts'],
      }),
      ...files,
    };

    for (const [relativePath, content] of Object.entries(fixtureFiles)) {
      writeFixtureFile(cwd, relativePath, content);
    }

    const context = createProjectContext({ cwd });
    return rules.flatMap((rule) => rule.check(context));
  } finally {
    rmSync(cwd, { force: true, recursive: true });
  }
}

function diagnosticsForRule(diagnostics, ruleName) {
  return diagnostics.filter((diagnostic) => diagnostic.ruleName === ruleName);
}

describe('TSDoc project rules', () => {
  test('accept fully-documented public API declarations', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts':
        "export type { WidgetProps } from './public-api';\nexport { formatWidget, Widget } from './public-api';\n",
      'src/public-api.ts': `
/**
 * Props for the widget component.
 *
 * @public
 */
export interface WidgetProps {
  label: string;
}

/**
 * Renders a widget.
 *
 * @example
 * \`\`\`ts
 * Widget();
 * \`\`\`
 *
 * @public
 */
export function Widget(): string {
  return 'widget';
}

/**
 * Formats widget copy.
 *
 * @example
 * \`\`\`ts
 * formatWidget('Save');
 * \`\`\`
 *
 * @public
 */
export function formatWidget(label: string): string {
  return label;
}
`,
    });

    expect(diagnostics).toEqual([]);
  });

  test('ignores private helpers that are not exported from the package entrypoint', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { publicHelper } from './public-api';\n",
      'src/public-api.ts': `
/**
 * @internal
 */
function privateHelper(): string {
  return 'private';
}

/**
 * Formats public copy.
 *
 * @example
 * \`\`\`ts
 * publicHelper();
 * \`\`\`
 *
 * @public
 */
export function publicHelper(): string {
  return privateHelper();
}
`,
    });

    expect(diagnostics).toEqual([]);
  });

  test('requires a summary for every public API declaration', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { MissingDocs } from './public-api';\n",
      'src/public-api.ts': 'export interface MissingDocs { value: string; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/required-public-summary')).toHaveLength(1);
  });

  test('reports TSDoc syntax errors', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { BrokenDocs } from './public-api';\n",
      'src/public-api.ts': '/** Broken {@link }. */\nexport interface BrokenDocs { value: string; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/syntax')).toHaveLength(1);
  });

  test('requires summary punctuation', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { LooseSummary } from './public-api';\n",
      'src/public-api.ts': '/** Summary without punctuation */\nexport interface LooseSummary { value: string; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/summary-style')).toHaveLength(1);
  });

  test('accepts summaries ending with exclamation points and question marks', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { ExcitedSummary, QuestionSummary } from './public-api';\n",
      'src/public-api.ts': `
/**
 * Save now!
 *
 * @public
 */
export interface ExcitedSummary { value: string; }

/**
 * Save later?
 *
 * @public
 */
export interface QuestionSummary { value: string; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/summary-style')).toHaveLength(0);
  });

  test('does not treat @deprecated text outside a block tag as deprecation', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { CurrentApi } from './public-api';\n",
      'src/public-api.ts':
        '/** Mentions `@deprecated` without deprecating the API. */\nexport interface CurrentApi { value: string; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/deprecated-reason')).toHaveLength(0);
  });

  test('requires @deprecated to explain the reason or replacement', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { OldApi } from './public-api';\n",
      'src/public-api.ts': `
/**
 * Old API shape.
 *
 * @deprecated
 */
export interface OldApi {
  value: string;
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/deprecated-reason')).toHaveLength(1);
  });

  test('does not treat @example text outside a block tag as an example block', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { formatValue } from './public-api';\n",
      'src/public-api.ts': `
/** Mentions \`@example\` without documenting an example. */
export function formatValue(value: string): string {
  return value;
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-function-example')).toHaveLength(1);
  });

  test('requires public functions to include an example', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { formatValue } from './public-api';\n",
      'src/public-api.ts': `
/** Formats a value. */
export function formatValue(value: string): string {
  return value;
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-function-example')).toHaveLength(1);
  });
});

describe('tsdoc/block-format', () => {
  test('accepts TSDoc blocks that start with a bare opening line', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { Opts } from './lib';\n",
      'src/lib.ts': `
/**
 * Options.
 *
 * @public
 */
export interface Opts { verbose: boolean; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/block-format')).toHaveLength(0);
  });

  test('reports summary text on the opening TSDoc line', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { Opts } from './lib';\n",
      'src/lib.ts': '/** Options.\n *\n * @public\n */\nexport interface Opts { verbose: boolean; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/block-format')).toHaveLength(1);
  });

  test('reports single-line TSDoc blocks', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': '/** @internal */\nexport type InternalOptions = { verbose: boolean };\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/block-format')).toHaveLength(1);
  });
});

describe('tsdoc/release-tag', () => {
  test('reports a definition with no TSDoc block', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': 'export function helper(): string { return ""; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(1);
    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')[0].message).toContain('helper');
  });

  test('reports a definition with TSDoc but no release tag', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': '/** Adds two numbers. */\nexport function add(a: number, b: number): number { return a + b; }\n',
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(1);
  });

  test('reports multiple release tags on the same definition', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { add } from './lib';\n",
      'src/lib.ts': `
/**
 * Adds two numbers.
 *
 * @public
 * @internal
 */
export function add(a: number, b: number): number { return a + b; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(1);
    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')[0].message).toContain('multiple');
  });

  test('accepts @public definitions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { Opts } from './lib';\n",
      'src/lib.ts': `
/**
 * Configuration options.
 *
 * @public
 */
export interface Opts { verbose: boolean; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(0);
  });

  test('accepts @alpha definitions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { ExperimentalOpts } from './lib';\n",
      'src/lib.ts': `
/**
 * Experimental options.
 *
 * @alpha
 */
export interface ExperimentalOpts { debug: boolean; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(0);
  });

  test('accepts @internal definitions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * @internal
 */
function privateHelper(): string { return 'private'; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(0);
  });

  test('checks type aliases and interfaces', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/types.ts': `
export type Width = 'full' | 'half';
export interface Config { width: Width; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(2);
  });

  test('does not require a release tag on non-exported definitions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
function privateHelper(): string { return ''; }
interface InternalShape { value: string; }
type InternalAlias = string;
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/release-tag')).toHaveLength(0);
  });
});

describe('tsdoc/public-api-export', () => {
  test('reports @public definition not exported from entrypoint', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Should be exported but is not.
 *
 * @public
 */
export function orphanedPublic(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')).toHaveLength(1);
    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')[0].message).toContain('@public');
    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')[0].message).toContain('src/index.ts');
  });

  test('reports @alpha definition not exported from entrypoint', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Experimental but not exported.
 *
 * @alpha
 */
export function orphanedAlpha(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')).toHaveLength(1);
    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')[0].message).toContain('@alpha');
  });

  test('accepts @public definition exported from entrypoint', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { helper } from './lib';\n",
      'src/lib.ts': `
/**
 * A public helper.
 *
 * @example
 * \`\`\`ts
 * helper();
 * \`\`\`
 *
 * @public
 */
export function helper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')).toHaveLength(0);
  });

  test('accepts @public definition exported through export star', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export * from './lib';\n",
      'src/lib.ts': `
/**
 * A public helper.
 *
 * @example
 * \`\`\`ts
 * helper();
 * \`\`\`
 *
 * @public
 */
export function helper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')).toHaveLength(0);
  });

  test('accepts @internal definition not exported from entrypoint', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * @internal
 */
function internalHelper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/public-api-export')).toHaveLength(0);
  });
});

describe('tsdoc/throws', () => {
  test('reports a function with a direct throw and no @throws', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Throws unconditionally.
 *
 * @internal
 */
function thrower(): never {
  throw new Error('boom');
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(1);
  });

  test('reports @throws without a {@link} target', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Throws unconditionally.
 *
 * @throws An error when called.
 *
 * @internal
 */
export function thrower(): never {
  throw new Error('boom');
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(1);
  });

  test('reports @throws with {@link} not preceded by descriptive text', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Throws unconditionally.
 *
 * @throws {@link Error} Always.
 *
 * @internal
 */
export function thrower(): never {
  throw new Error('boom');
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(1);
    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')[0].message).toContain('descriptive text');
  });

  test('accepts @throws with descriptive text before {@link}', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Throws unconditionally.
 *
 * @throws Throws {@link Error} when called.
 *
 * @internal
 */
export function thrower(): never {
  throw new Error('boom');
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(0);
  });

  test('does not require @throws for nested throws inside arrow functions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Creates a thrower.
 *
 * @internal
 */
function createThrower(): () => never {
  return () => { throw new Error('inner'); };
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(0);
  });

  test('does not require @throws for nested throws inside function expressions', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Creates a thrower.
 *
 * @internal
 */
function createThrower(): () => never {
  return function() { throw new Error('inner'); };
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(0);
  });

  test('does not flag functions without throw statements', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': '',
      'src/lib.ts': `
/**
 * Returns a value.
 *
 * @internal
 */
function safe(): string {
  return 'ok';
}
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/throws')).toHaveLength(0);
  });
});

describe('tsdoc/modifier-tag-last-line', () => {
  test('accepts modifier tag on the last line', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { helper } from './lib';\n",
      'src/lib.ts': `
/**
 * A helper.
 *
 * @example
 * \`\`\`ts
 * helper();
 * \`\`\`
 *
 * @public
 */
export function helper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/modifier-tag-last-line')).toHaveLength(0);
  });

  test('reports modifier tag before other block tags', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { helper } from './lib';\n",
      'src/lib.ts': `
/**
 * A helper.
 *
 * @public
 * @example
 * \`\`\`ts
 * helper();
 * \`\`\`
 */
export function helper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/modifier-tag-last-line')).toHaveLength(1);
  });

  test('reports modifier tag before summary content', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { Opts } from './lib';\n",
      'src/lib.ts': `
/**
 * @public
 * A misplaced summary.
 */
export interface Opts { verbose: boolean; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/modifier-tag-last-line')).toHaveLength(1);
  });

  test('allows multiple modifier tags together at the end', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export type { Opts } from './lib';\n",
      'src/lib.ts': `
/**
 * Options.
 *
 * @readonly
 * @public
 */
export interface Opts { verbose: boolean; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/modifier-tag-last-line')).toHaveLength(0);
  });

  test('reports modifier tag before fenced code content', () => {
    const diagnostics = diagnosticsForFixture({
      'src/index.ts': "export { helper } from './lib';\n",
      'src/lib.ts': `
/**
 * A helper.
 *
 * @public
 * \`\`\`ts
 * helper();
 * \`\`\`
 */
export function helper(): string { return ''; }
`,
    });

    expect(diagnosticsForRule(diagnostics, 'tsdoc/modifier-tag-last-line')).toHaveLength(1);
  });
});
