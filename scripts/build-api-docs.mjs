#!/usr/bin/env node
/**
 * Generates the API reference at docs/src/pages/reference/api/.
 *
 * Walks src/index.ts, groups re-exports by their source file, and emits one
 * Astro page per group containing the @public declarations' signatures and
 * TSDoc commentary. Re-evaluate this script vs. typedoc if the prose budget
 * required to fit Groundwork's tone grows beyond ~300 lines (see ADR-0004).
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const indexFile = join(repoRoot, 'src/index.ts');
const outDir = join(repoRoot, 'docs/src/pages/reference/api');

const tsconfigPath = ts.findConfigFile(repoRoot, ts.sys.fileExists, 'tsconfig.json');
if (!tsconfigPath) {
  throw new Error('tsconfig.json not found');
}
const tsconfigRead = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(tsconfigRead.config, ts.sys, repoRoot);

const program = ts.createProgram({ rootNames: [indexFile], options: parsedConfig.options });
const checker = program.getTypeChecker();
const indexSource = program.getSourceFile(indexFile);
if (!indexSource) {
  throw new Error(`Could not load ${indexFile}`);
}

const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });

const PASCAL_RE = /^[A-Z]/u;
const EXPORT_PREFIX_RE = /^export\s+/u;
const KEBAB_SPLIT_RE = /[-_]/u;
const CAMEL_BOUNDARY_RE = /([a-z])([A-Z])/gu;
const LEADING_FENCE_RE = /^```\w*\n?/u;
const TRAILING_FENCE_RE = /\n?```\s*$/u;
const TRIPLE_NEWLINE_RE = /\n{3,}/gu;
const AMP_RE = /&/gu;
const LT_RE = /</gu;
const GT_RE = />/gu;
const OPEN_CURLY_RE = /\{/gu;
const CLOSE_CURLY_RE = /\}/gu;

const exportGroups = collectExportGroups(indexSource);
const indexExports = collectIndexExports(indexSource);

const pages = [];
for (const group of exportGroups.values()) {
  const decls = [];
  for (const name of group.exportNames) {
    const sym = indexExports.get(name);
    if (!sym) {
      continue;
    }
    const aliased = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    const declaration = aliased.declarations?.[0];
    if (!declaration) {
      continue;
    }
    const docs = parseDocs(aliased);
    if (!docs.isPublic) {
      continue;
    }
    decls.push({
      name,
      kind: classifyKind(declaration, name),
      signature: formatSignature(declaration, aliased),
      docs,
    });
  }
  if (decls.length === 0) {
    continue;
  }
  decls.sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind));
  pages.push({
    pageName: group.pageName,
    title: group.title,
    decls,
  });
}

pages.sort((a, b) => a.title.localeCompare(b.title));

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true });
}
mkdirSync(outDir, { recursive: true });

for (const page of pages) {
  writeFileSync(join(outDir, `${page.pageName}.astro`), renderPage(page), 'utf8');
}
writeFileSync(join(outDir, 'index.astro'), renderIndex(pages), 'utf8');

// --- helpers --------------------------------------------------------------

function collectExportGroups(sourceFile) {
  const groups = new Map();
  for (const stmt of sourceFile.statements) {
    if (!ts.isExportDeclaration(stmt)) {
      continue;
    }
    if (!stmt.moduleSpecifier || !ts.isStringLiteral(stmt.moduleSpecifier)) {
      continue;
    }
    if (!stmt.exportClause || !ts.isNamedExports(stmt.exportClause)) {
      continue;
    }
    const fromPath = stmt.moduleSpecifier.text;
    if (!groups.has(fromPath)) {
      const base = basename(fromPath);
      groups.set(fromPath, {
        fromPath,
        pageName: base,
        title: humanise(base),
        exportNames: new Set(),
      });
    }
    for (const el of stmt.exportClause.elements) {
      groups.get(fromPath).exportNames.add(el.name.text);
    }
  }
  return groups;
}

function collectIndexExports(sourceFile) {
  const indexSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!indexSymbol) {
    return new Map();
  }
  const exports = checker.getExportsOfModule(indexSymbol);
  return new Map(exports.map((sym) => [sym.getName(), sym]));
}

function parseDocs(symbol) {
  const description = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const tags = symbol.getJsDocTags(checker);
  const isPublic = tags.some((t) => t.name === 'public');
  const isAlpha = tags.some((t) => t.name === 'alpha');
  const example = tags.find((t) => t.name === 'example');
  const exampleText = example?.text ? ts.displayPartsToString(example.text).trim() : null;
  return { description, isPublic, isAlpha, exampleText };
}

function classifyKind(declaration, name) {
  if (ts.isFunctionDeclaration(declaration) || ts.isFunctionExpression(declaration)) {
    return PASCAL_RE.test(name) ? 'component' : 'function';
  }
  if (ts.isVariableDeclaration(declaration)) {
    return 'function';
  }
  if (ts.isInterfaceDeclaration(declaration)) {
    return 'interface';
  }
  if (ts.isTypeAliasDeclaration(declaration)) {
    return 'type';
  }
  if (ts.isClassDeclaration(declaration)) {
    return 'class';
  }
  return 'other';
}

function kindOrder(kind) {
  switch (kind) {
    case 'component':
      return 0;
    case 'function':
      return 1;
    case 'class':
      return 2;
    case 'interface':
      return 3;
    case 'type':
      return 4;
    default:
      return 9;
  }
}

function formatSignature(declaration, symbol) {
  if (ts.isFunctionDeclaration(declaration)) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const callSig = type.getCallSignatures()[0];
    if (callSig) {
      const sigText = checker.signatureToString(
        callSig,
        declaration,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature,
      );
      return `function ${symbol.getName()}${sigText}`;
    }
  }
  return printer
    .printNode(ts.EmitHint.Unspecified, declaration, declaration.getSourceFile())
    .replace(EXPORT_PREFIX_RE, '');
}

function humanise(base) {
  if (PASCAL_RE.test(base)) {
    return base;
  }
  return base
    .split(KEBAB_SPLIT_RE)
    .map((s, i) => (i === 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

function renderPage(page) {
  return `---
import DocsLayout from '../../../layouts/DocsLayout.astro';
---

<DocsLayout title="${escapeHtml(page.title)} — API reference" description="Generated TypeScript reference for ${escapeHtml(page.title)}.">
  <section class="gw-section">
    <div class="gw-width gw-prose">
      <p class="gw-caption">API reference</p>
      <h1 class="gw-heading-l">${escapeHtml(page.title)}</h1>
      <p>Generated from TSDoc <code class="gw-mono">@public</code> declarations. The TypeScript types are the source of truth (see <a class="gw-link" href="/reference/adr/0004-api-reference-as-typedoc/">ADR-0004</a>).</p>
${page.decls.map(renderDeclaration).join('\n')}
    </div>
  </section>
</DocsLayout>
`;
}

function renderDeclaration(decl) {
  const tagLine = decl.docs.isAlpha
    ? `      <p class="gw-caption">${decl.kind} · alpha</p>`
    : `      <p class="gw-caption">${decl.kind}</p>`;
  const description = decl.docs.description ? `      <p>${escapeHtml(decl.docs.description)}</p>` : '';
  const example = decl.docs.exampleText
    ? `      <pre><code>${escapeHtml(stripCodeFence(decl.docs.exampleText))}</code></pre>`
    : '';
  return `      <h2 class="gw-heading-m" id="${slugify(decl.name)}">${escapeHtml(decl.name)}</h2>
${tagLine}
      <pre><code>${escapeHtml(decl.signature)}</code></pre>
${description}
${example}`.replace(TRIPLE_NEWLINE_RE, '\n\n');
}

function renderIndex(allPages) {
  return `---
import DocsLayout from '../../../layouts/DocsLayout.astro';
---

<DocsLayout title="API reference" description="Generated TypeScript reference for the Groundwork public API">
  <section class="gw-section">
    <div class="gw-width gw-stack--lg">
      <div class="gw-prose">
        <h1 class="gw-heading-l">API reference</h1>
        <p>Generated from TSDoc <code class="gw-mono">@public</code> declarations in <code class="gw-mono">src/index.ts</code>. The TypeScript types are the source of truth (see <a class="gw-link" href="/reference/adr/0004-api-reference-as-typedoc/">ADR-0004</a>).</p>
      </div>

      <div class="gw-grid">
${allPages
  .map(
    (page) => `        <article class="gw-card gw-stack--sm">
          <h2 class="gw-heading-s"><a class="gw-link" href="/reference/api/${page.pageName}/">${escapeHtml(page.title)}</a></h2>
          <p class="gw-body--sm">${page.decls.length} ${page.decls.length === 1 ? 'export' : 'exports'}.</p>
        </article>`,
  )
  .join('\n')}
      </div>
    </div>
  </section>
</DocsLayout>
`;
}

function escapeHtml(s) {
  return String(s)
    .replace(AMP_RE, '&amp;')
    .replace(LT_RE, '&lt;')
    .replace(GT_RE, '&gt;')
    .replace(OPEN_CURLY_RE, '&#123;')
    .replace(CLOSE_CURLY_RE, '&#125;');
}

function stripCodeFence(s) {
  return s.replace(LEADING_FENCE_RE, '').replace(TRAILING_FENCE_RE, '');
}

function slugify(s) {
  return s.replace(CAMEL_BOUNDARY_RE, '$1-$2').toLowerCase();
}
