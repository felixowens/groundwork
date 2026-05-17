import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const filesByEntry = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return entry.name === 'generated' ? [] : cssFiles(path);
      }

      return entry.isFile() && entry.name.endsWith('.css') ? [path] : [];
    }),
  );

  return filesByEntry.flat();
}

async function astroFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const filesByEntry = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return astroFiles(path);
      }

      return entry.isFile() && entry.name.endsWith('.astro') ? [path] : [];
    }),
  );

  return filesByEntry.flat();
}

const violations = [];
const sourceCssFiles = await cssFiles('src/styles');
const sourceCssFilesWithContent = await Promise.all(
  sourceCssFiles.map(async (file) => ({
    file,
    content: await readFile(file, 'utf8'),
  })),
);

for (const { file, content } of sourceCssFilesWithContent) {
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes('--_gw-')) {
      violations.push(`${file}:${index + 1}: authored CSS must not reference private primitive tokens`);
    }
  });
}

const libraryGwClasses = new Set();
for (const { content } of sourceCssFilesWithContent) {
  for (const match of content.matchAll(/\.(gw-[a-z0-9-]+)/gi)) {
    libraryGwClasses.add(match[1]);
  }
}

const docsAstroFiles = await astroFiles('docs/src');
const docsAstroFilesWithContent = await Promise.all(
  docsAstroFiles.map(async (file) => ({
    file,
    content: await readFile(file, 'utf8'),
  })),
);

for (const { file, content } of docsAstroFilesWithContent) {
  for (const styleMatch of content.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)) {
    const styleBlock = styleMatch[1];
    const blockStartIndex = styleMatch.index + styleMatch[0].indexOf(styleBlock);
    const seen = new Set();

    for (const classMatch of styleBlock.matchAll(/\.(gw-[a-z0-9-]+)/gi)) {
      const className = classMatch[1];
      if (libraryGwClasses.has(className) || seen.has(className)) {
        continue;
      }
      seen.add(className);

      const absoluteIndex = blockStartIndex + classMatch.index;
      const lineNumber = content.slice(0, absoluteIndex).split('\n').length;
      violations.push(
        `${file}:${lineNumber}: doc-only scoped CSS must not define .${className} — the gw- prefix is reserved for library classes in src/styles/`,
      );
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
}
