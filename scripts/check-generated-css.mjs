import { spawnSync } from 'node:child_process';

const result = spawnSync('git', ['diff', '--exit-code', '--', 'css/groundwork.css'], {
  encoding: 'utf8',
});

if (result.status === 0) {
  process.exit(0);
}

if (result.error === undefined) {
  process.stderr.write('css/groundwork.css is out of date. Run npm run build:css and commit the result.\n');
  if (result.stdout.trim() !== '') {
    process.stderr.write(result.stdout);
  }
  if (result.stderr.trim() !== '') {
    process.stderr.write(result.stderr);
  }
  process.exit(result.status ?? 1);
}

process.stderr.write(`${result.error.message}\n`);
process.exit(result.status ?? 1);
