export function assertNever(value: never): never {
  throw new Error(`Unexpected unreachable value: ${String(value)}`);
}
