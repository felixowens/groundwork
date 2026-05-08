import type { AriaAttributes, ReactNode } from 'react';
import { type FieldError, formatFieldError } from '../form/field-error';

type DescribedInputProps = {
  id: string;
  'aria-labelledby': string;
  'aria-describedby'?: AriaAttributes['aria-describedby'];
  'aria-invalid'?: AriaAttributes['aria-invalid'];
};

export type FieldRenderProps = {
  inputProps: DescribedInputProps;
  hasError: boolean;
};

export type FieldProps = {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: FieldError | undefined;
  children: (field: FieldRenderProps) => ReactNode;
};

function describedBy(hintId: string | undefined, errorId: string | undefined): string | undefined {
  const ids = [hintId, errorId].filter((id): id is string => id !== undefined);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** Renders a labelled form field and supplies ARIA props to the child control. */
export function Field({ id, label, hint, error, children }: FieldProps) {
  const labelId = `${id}-label`;
  const hintId = hint === undefined ? undefined : `${id}-hint`;
  const errorId = error === undefined ? undefined : `${id}-error`;
  const descriptionIds = describedBy(hintId, errorId);
  const hasError = error !== undefined;

  const inputProps: DescribedInputProps = {
    id,
    'aria-labelledby': labelId,
    ...(descriptionIds === undefined ? {} : { 'aria-describedby': descriptionIds }),
    ...(hasError ? { 'aria-invalid': true } : {}),
  };

  return (
    <div className={hasError ? 'gw-field gw-field--error' : 'gw-field'}>
      <label className="gw-label" htmlFor={id} id={labelId}>
        {label}
      </label>
      {hint === undefined ? null : (
        <span className="gw-hint" id={hintId}>
          {hint}
        </span>
      )}
      {hasError ? (
        <span className="gw-error-message" id={errorId}>
          {formatFieldError(error)}
        </span>
      ) : null}
      {children({ inputProps, hasError })}
    </div>
  );
}
