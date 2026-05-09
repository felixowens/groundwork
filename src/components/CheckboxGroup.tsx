import type { ChangeEventHandler, FieldsetHTMLAttributes, Ref } from 'react';
import { type FieldError, formatFieldError } from '../form/field-error';
import type { WithoutStyleOverrides } from './types';

/**
 * A single option in a Groundwork checkbox group.
 *
 * @public
 */
export interface CheckboxGroupOption {
  value: string;
  label: string;
  hint?: string | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
}

/**
 * Props for the Groundwork CheckboxGroup component.
 *
 * @public
 */
export type CheckboxGroupProps = WithoutStyleOverrides<
  Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'aria-describedby' | 'aria-invalid' | 'children' | 'onChange'>
> & {
  id: string;
  name: string;
  legend: string;
  hint?: string | undefined;
  error?: FieldError | undefined;
  options: readonly CheckboxGroupOption[];
  values?: readonly string[] | undefined;
  defaultValues?: readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  ref?: Ref<HTMLFieldSetElement>;
};

function optionId(groupId: string, option: CheckboxGroupOption): string {
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
 * Renders a fieldset-backed checkbox group for choosing one or more options.
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   id="services-used"
 *   name="servicesUsed"
 *   legend="Which services do you use?"
 *   options={[{ value: 'web', label: 'Web application' }]}
 * />
 * ```
 *
 * @public
 */
export function CheckboxGroup({
  id,
  name,
  legend,
  hint,
  error,
  options,
  values,
  defaultValues,
  onChange,
  ref,
  ...props
}: CheckboxGroupProps) {
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
      <div className="gw-checkboxes">
        {options.map((option) => {
          const idForOption = optionId(id, option);
          const optionHintId = option.hint === undefined ? undefined : `${idForOption}-hint`;

          return (
            <label className="gw-checkbox-item" htmlFor={idForOption} key={option.value}>
              <input
                aria-describedby={optionHintId}
                checked={values === undefined ? undefined : values.includes(option.value)}
                defaultChecked={values === undefined && defaultValues?.includes(option.value) ? true : undefined}
                disabled={option.disabled}
                id={idForOption}
                name={name}
                onChange={onChange}
                type="checkbox"
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
