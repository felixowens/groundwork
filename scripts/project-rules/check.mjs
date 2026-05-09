import { createProjectContext } from './context.mjs';
import { compareDiagnostics, formatDiagnostic } from './diagnostics.mjs';
import { rules } from './rules/index.mjs';

const context = createProjectContext();
const diagnostics = rules.flatMap((rule) => rule.check(context)).sort(compareDiagnostics);

if (diagnostics.length > 0) {
  const output = diagnostics.map((diagnostic) => formatDiagnostic(context, diagnostic)).join('\n');
  process.stderr.write(`${output}\n`);
  process.exitCode = 1;
}
