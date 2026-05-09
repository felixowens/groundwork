import { describe, expect, test } from 'vitest';
import { formatFieldError } from '../field-error';

describe('formatFieldError', () => {
  test('joins the problem and fix with a single space', () => {
    expect(
      formatFieldError({
        problem: 'Enter your email address.',
        fix: 'Use the format name@example.com.',
      }),
    ).toBe('Enter your email address. Use the format name@example.com.');
  });

  test('preserves authored punctuation and copy', () => {
    expect(
      formatFieldError({
        problem: 'Choose a contact reason:',
        fix: 'select Billing question or Technical support.',
      }),
    ).toBe('Choose a contact reason: select Billing question or Technical support.');
  });

  test('formats copy for field display and error summary links consistently', () => {
    const error = {
      problem: 'Name is required.',
      fix: 'Enter the name as it appears on the account.',
    };

    expect(formatFieldError(error)).toBe('Name is required. Enter the name as it appears on the account.');
    expect(`Full name: ${formatFieldError(error)}`).toBe(
      'Full name: Name is required. Enter the name as it appears on the account.',
    );
  });
});
