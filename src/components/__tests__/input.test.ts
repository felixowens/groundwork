import { describe, expect, test } from 'vitest';
import { Input, type InputWidth } from '../Input';

describe('Input', () => {
  test('throws when an unexpected width reaches the runtime guard', () => {
    expect(() =>
      Input({
        'aria-label': 'Reference number',
        width: 'compact' as InputWidth,
      }),
    ).toThrow('Unexpected unreachable value: compact');
  });
});
