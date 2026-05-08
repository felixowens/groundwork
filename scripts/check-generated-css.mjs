import { spawnSync } from 'node:child_process';

const result = spawnSync('git', ['diff', '--exit-code', '--', 'css/groundwork.css'], {
  encoding: 'utf8',
});

if (result.status === 0) {
  process.exit(0);
}

if (result.error !== undefined) {
  console.error(result.error.message);
} else {
  console.error('css/groundwork.css is out of date. Run npm run build:css and commit the result.');
  if (result.stdout.trim() !== '') {
    console.error(result.stdout);
  }
  if (result.stderr.trim() !== '') {
    console.error(result.stderr);
  }
}

process.exit(result.status ?? 1);
