import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'generated') {
        continue;
      }

      files.push(...(await cssFiles(path)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push(path);
    }
  }

  return files;
}

const violations = [];

for (const file of await cssFiles('src/styles')) {
  const content = await readFile(file, 'utf8');
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
