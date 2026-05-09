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

if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
}
