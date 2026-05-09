/**
 * Error copy that names both the problem and the fix.
 *
 * `problem` should explain what is wrong. `fix` should tell the user how to
 * correct it. Field and ErrorSummary format this structure consistently for
 * inline errors and summary links.
 */
export interface FieldError {
  problem: string;
  fix: string;
}

/** Formats structured field error copy for display and summary links. */
export function formatFieldError(error: FieldError): string {
  return [error.problem.trim(), error.fix.trim()].filter((copy) => copy.length > 0).join(' ');
}
