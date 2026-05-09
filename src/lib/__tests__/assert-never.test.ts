import { describe, expect, test } from 'vitest';
import { assertNever } from '../assert-never';

const unexpectedValues = [
  ['a string value', 'archived', 'archived'],
  ['a number value', 404, '404'],
  ['a boolean value', false, 'false'],
  ['an object value', { status: 'archived' }, '[object Object]'],
] as const;

describe('assertNever', () => {
  test.each(unexpectedValues)('throws an Error that includes %s', (_label, value, formattedValue) => {
    const throwAssertNever = () => assertNever(value as never);

    expect(throwAssertNever).toThrow(Error);
    expect(throwAssertNever).toThrow(`Unexpected unreachable value: ${formattedValue}`);
  });
});
