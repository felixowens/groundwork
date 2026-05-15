import type { ReactNode } from 'react';
import { type FieldError, formatFieldError } from './field-error';

/**
 * ARIA attributes to spread onto the form control inside a `<Field>`.
 *
 * @internal
 */
export interface FieldInputAriaProps {
  id: string;
  'aria-labelledby': string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

/**
 * ARIA attributes to spread onto the `<fieldset>` of a Choice group.
 *
 * The fieldset has no `aria-labelledby` because the `<legend>` serves as the
 * accessible name implicitly.
 *
 * @internal
 */
export interface FieldsetAriaProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

/**
 * Accessibility wiring for a labelled form control: derived IDs, ARIA attribute
 * bundles, and the rendered hint and error nodes.
 *
 * Produced by `describeField()` and consumed by both `<Field>` (which uses
 * `labelId` and `inputAriaProps`) and the Choice group module (which uses
 * `fieldsetAriaProps`). See CONTEXT.md for the "Field description" domain term.
 *
 * @internal
 */
export interface FieldDescription {
  labelId: string;
  hasError: boolean;
  inputAriaProps: FieldInputAriaProps;
  fieldsetAriaProps: FieldsetAriaProps;
  hintNode: ReactNode;
  errorNode: ReactNode;
}

/**
 * Options for `describeField()`.
 *
 * @internal
 */
export interface DescribeFieldOptions {
  hint?: string | undefined;
  error?: FieldError | undefined;
}

/**
 * Derives the accessibility wiring shared by `<Field>` and the Choice group module.
 *
 * Returns derived label/hint/error IDs, two ARIA attribute bundles (one for an
 * input rendered inside `<label>`, one for a `<fieldset>` whose `<legend>` serves
 * as the implicit label), and the rendered hint and error nodes.
 * `aria-describedby` is composed as `hint error` in that order. `aria-invalid`
 * is only set to `true` when an error is present.
 *
 * @example
 * ```tsx
 * const { inputAriaProps, hintNode, errorNode } = describeField('email', {
 *   hint: 'You can find this on your card.',
 * });
 * ```
 *
 * @internal
 */
export function describeField(id: string, options: DescribeFieldOptions = {}): FieldDescription {
  const { hint, error } = options;

  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hasHint = hint !== undefined;
  const hasError = error !== undefined;

  const describedByIds = [hasHint ? hintId : undefined, hasError ? errorId : undefined].filter(
    (value): value is string => value !== undefined,
  );
  const ariaDescribedBy = describedByIds.length === 0 ? undefined : describedByIds.join(' ');

  return {
    labelId,
    hasError,
    inputAriaProps: {
      id,
      'aria-labelledby': labelId,
      ...(ariaDescribedBy === undefined ? {} : { 'aria-describedby': ariaDescribedBy }),
      ...(hasError ? { 'aria-invalid': true as const } : {}),
    },
    fieldsetAriaProps: {
      id,
      ...(ariaDescribedBy === undefined ? {} : { 'aria-describedby': ariaDescribedBy }),
      ...(hasError ? { 'aria-invalid': true as const } : {}),
    },
    hintNode: hasHint ? (
      <span className="gw-hint" id={hintId}>
        {hint}
      </span>
    ) : null,
    errorNode: hasError ? (
      <span className="gw-error-message" id={errorId}>
        {formatFieldError(error)}
      </span>
    ) : null,
  };
}
