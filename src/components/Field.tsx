import type { ReactNode } from 'react';
import { describeField, type FieldInputAriaProps } from '../form/field-description';
import type { FieldError } from '../form/field-error';

/**
 * Props supplied by Field to the form control render function.
 *
 * @public
 */
export interface FieldRenderProps {
  inputProps: FieldInputAriaProps;
  hasError: boolean;
}

/**
 * Props for the Groundwork Field component.
 *
 * @public
 */
export interface FieldProps {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: FieldError | undefined;
  children: (field: FieldRenderProps) => ReactNode;
}

/**
 * Renders a labelled form field and supplies ARIA props to the child control.
 *
 * @example
 * ```tsx
 * <Field id="email" label="Email address">
 *   {({ inputProps }) => <Input {...inputProps} />}
 * </Field>
 * ```
 *
 * @public
 */
export function Field({ id, label, hint, error, children }: FieldProps) {
  const { labelId, inputAriaProps, hintNode, errorNode, hasError } = describeField(id, { hint, error });

  return (
    <div className={hasError ? 'gw-field gw-field--error' : 'gw-field'}>
      <label className="gw-label" htmlFor={id} id={labelId}>
        {label}
      </label>
      {hintNode}
      {errorNode}
      {children({ inputProps: inputAriaProps, hasError })}
    </div>
  );
}
