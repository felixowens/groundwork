import { describe, expect, test } from 'vitest';
import { Button, type ButtonVariant } from '../Button';

describe('Button', () => {
  test('throws when an unexpected variant reaches the runtime guard', () => {
    expect(() =>
      Button({
        children: 'Save and continue',
        variant: 'tertiary' as ButtonVariant,
      }),
    ).toThrow('Unexpected unreachable value: tertiary');
  });
});
