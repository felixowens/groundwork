import type { ChangeEventHandler, FieldsetHTMLAttributes, Ref } from 'react';
import { type FieldError, formatFieldError } from '../form/field-error';
import type { WithoutStyleOverrides } from './types';

/**
 * A single option in a Groundwork radio group.
 *
 * @public
 */
export interface RadioGroupOption {
  value: string;
  label: string;
  hint?: string | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
}

/**
 * Props for the Groundwork RadioGroup component.
 *
 * @public
 */
export type RadioGroupProps = WithoutStyleOverrides<
  Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'aria-describedby' | 'aria-invalid' | 'children' | 'onChange'>
> & {
  id: string;
  name: string;
  legend: string;
  hint?: string | undefined;
  error?: FieldError | undefined;
  options: readonly RadioGroupOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  ref?: Ref<HTMLFieldSetElement>;
};

function optionId(groupId: string, option: RadioGroupOption): string {
  if (option.id !== undefined) {
    return option.id;
  }

  const safeValue = option.value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '');
  return `${groupId}-${safeValue}`;
}

function describedBy(hintId: string | undefined, errorId: string | undefined): string | undefined {
  const ids = [hintId, errorId].filter((id): id is string => id !== undefined);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Renders a fieldset-backed radio group for choosing one option from a short list.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   id="contact-preference"
 *   name="contactPreference"
 *   legend="How should we contact you?"
 *   options={[{ value: 'email', label: 'Email' }]}
 * />
 * ```
 *
 * @public
 */
export function RadioGroup({
  id,
  name,
  legend,
  hint,
  error,
  options,
  value,
  defaultValue,
  onChange,
  ref,
  ...props
}: RadioGroupProps) {
  const hintId = hint === undefined ? undefined : `${id}-hint`;
  const errorId = error === undefined ? undefined : `${id}-error`;
  const descriptionIds = describedBy(hintId, errorId);
  const hasError = error !== undefined;

  return (
    <fieldset
      ref={ref}
      {...props}
      aria-describedby={descriptionIds}
      aria-invalid={hasError ? true : undefined}
      className={hasError ? 'gw-field gw-fieldset gw-field--error' : 'gw-field gw-fieldset'}
      id={id}
      style={undefined}
      tabIndex={hasError ? -1 : props.tabIndex}
    >
      <legend className="gw-label">{legend}</legend>
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
      <div className="gw-radios">
        {options.map((option) => {
          const idForOption = optionId(id, option);
          const optionHintId = option.hint === undefined ? undefined : `${idForOption}-hint`;

          return (
            <label className="gw-radio-item" htmlFor={idForOption} key={option.value}>
              <input
                aria-describedby={optionHintId}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={value === undefined && defaultValue === option.value ? true : undefined}
                disabled={option.disabled}
                id={idForOption}
                name={name}
                onChange={onChange}
                type="radio"
                value={option.value}
              />
              <span className="gw-choice__content">
                <span>{option.label}</span>
                {option.hint === undefined ? null : (
                  <span className="gw-choice__hint" id={optionHintId}>
                    {option.hint}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
