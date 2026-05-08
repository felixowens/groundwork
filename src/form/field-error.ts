/** Error copy that names both the problem and the fix. */
export type FieldError = {
  problem: string;
  fix: string;
};

/** Formats structured field error copy for display and summary links. */
export function formatFieldError(error: FieldError): string {
  return `${error.problem} ${error.fix}`;
}
