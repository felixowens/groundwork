/**
 * Throws when a supposedly exhaustive branch receives an unhandled value.
 *
 * Use this in `default` branches for switches over closed unions. TypeScript
 * should require the value to be `never`; if a new union member is added without
 * updating the switch, the call site becomes a type error.
 *
 * @example
 * ```ts
 * type Status = 'idle' | 'loading';
 *
 * function statusLabel(status: Status): string {
 *   switch (status) {
 *     case 'idle':
 *       return 'Idle';
 *     case 'loading':
 *       return 'Loading';
 *     default:
 *       return assertNever(status);
 *   }
 * }
 * ```
 *
 * @throws Throws {@link Error} when called at runtime with a value that should be unreachable.
 *
 * @internal
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected unreachable value: ${String(value)}`);
}
