import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { describeField } from '../field-description';

describe('describeField', () => {
  test('derives the canonical label and input ARIA attributes', () => {
    const description = describeField('email');

    expect(description.labelId).toBe('email-label');
    expect(description.inputAriaProps.id).toBe('email');
    expect(description.inputAriaProps['aria-labelledby']).toBe('email-label');
  });

  test('omits aria-describedby and renders no nodes when there is no hint or error', () => {
    const description = describeField('email');

    expect(description.inputAriaProps).not.toHaveProperty('aria-describedby');
    expect(description.fieldsetAriaProps).not.toHaveProperty('aria-describedby');
    expect(description.hintNode).toBeNull();
    expect(description.errorNode).toBeNull();
    expect(description.hasError).toBe(false);
  });

  test('points aria-describedby at the hint id when only a hint is present', () => {
    const description = describeField('email', { hint: 'You can find this on your card.' });

    expect(description.inputAriaProps['aria-describedby']).toBe('email-hint');
    expect(description.fieldsetAriaProps['aria-describedby']).toBe('email-hint');
    expect(description.hasError).toBe(false);
  });

  test('points aria-describedby at the error id and sets aria-invalid when only an error is present', () => {
    const description = describeField('email', {
      error: { problem: 'Enter an email.', fix: 'Use the format name@example.com.' },
    });

    expect(description.inputAriaProps['aria-describedby']).toBe('email-error');
    expect(description.fieldsetAriaProps['aria-describedby']).toBe('email-error');
    expect(description.inputAriaProps['aria-invalid']).toBe(true);
    expect(description.fieldsetAriaProps['aria-invalid']).toBe(true);
    expect(description.hasError).toBe(true);
  });

  test('composes aria-describedby as hint then error when both are present', () => {
    const description = describeField('email', {
      hint: 'You can find this on your card.',
      error: { problem: 'Enter an email.', fix: 'Use the format name@example.com.' },
    });

    expect(description.inputAriaProps['aria-describedby']).toBe('email-hint email-error');
    expect(description.fieldsetAriaProps['aria-describedby']).toBe('email-hint email-error');
  });

  test('omits aria-invalid when there is no error, even if a hint is present', () => {
    const description = describeField('email', { hint: 'You can find this on your card.' });

    expect(description.inputAriaProps).not.toHaveProperty('aria-invalid');
    expect(description.fieldsetAriaProps).not.toHaveProperty('aria-invalid');
  });

  test('fieldsetAriaProps never includes aria-labelledby (legend serves as the accessible name)', () => {
    const description = describeField('contact-preference', {
      hint: 'We will only use this to confirm your order.',
    });

    expect(description.fieldsetAriaProps).not.toHaveProperty('aria-labelledby');
  });

  test('renders the hint node as a span with the canonical class and id', () => {
    const description = describeField('email', { hint: 'You can find this on your card.' });

    expect(renderToStaticMarkup(description.hintNode)).toBe(
      '<span class="gw-hint" id="email-hint">You can find this on your card.</span>',
    );
  });

  test('renders the error node with formatted problem and fix copy', () => {
    const description = describeField('email', {
      error: { problem: 'Enter an email.', fix: 'Use the format name@example.com.' },
    });

    expect(renderToStaticMarkup(description.errorNode)).toBe(
      '<span class="gw-error-message" id="email-error">Enter an email. Use the format name@example.com.</span>',
    );
  });
});
