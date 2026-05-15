import type { ChangeEventHandler, FieldsetHTMLAttributes, Ref } from 'react';
import { describeField } from '../../form/field-description';
import type { FieldError } from '../../form/field-error';
import type { WithoutStyleOverrides } from '../types';

/**
 * A single option in a fieldset-backed Choice group (RadioGroup or CheckboxGroup).
 *
 * @internal
 */
export interface ChoiceGroupOption {
  value: string;
  label: string;
  hint?: string | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
}

type ChoiceGroupCommon = WithoutStyleOverrides<
  Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'aria-describedby' | 'aria-invalid' | 'children' | 'onChange'>
> & {
  id: string;
  name: string;
  legend: string;
  hint?: string | undefined;
  error?: FieldError | undefined;
  options: readonly ChoiceGroupOption[];
  inputType: 'radio' | 'checkbox';
  groupClass: 'gw-radios' | 'gw-checkboxes';
  itemClass: 'gw-radio-item' | 'gw-checkbox-item';
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  ref?: Ref<HTMLFieldSetElement>;
};

/**
 * Props for the internal `<ChoiceGroup>` component.
 *
 * `<RadioGroup>` and `<CheckboxGroup>` wrap this component, translating their
 * public `value` / `values` props to the discriminated `selected` prop.
 *
 * @internal
 */
export type ChoiceGroupProps = ChoiceGroupCommon &
  (
    | { mode: 'single'; selected?: string | undefined; defaultSelected?: string | undefined }
    | { mode: 'multi'; selected?: readonly string[] | undefined; defaultSelected?: readonly string[] | undefined }
  );

const SAFE_VALUE_PATTERN = /[^a-zA-Z0-9_-]+/g;
const EDGE_HYPHEN_PATTERN = /^-|-$/g;

function optionId(groupId: string, option: ChoiceGroupOption): string {
  if (option.id !== undefined) {
    return option.id;
  }

  const safeValue = option.value.replace(SAFE_VALUE_PATTERN, '-').replace(EDGE_HYPHEN_PATTERN, '');
  return `${groupId}-${safeValue}`;
}

function isOptionChecked(
  option: ChoiceGroupOption,
  mode: 'single' | 'multi',
  selected: string | readonly string[] | undefined,
): boolean | undefined {
  if (selected === undefined) {
    return;
  }
  return mode === 'single' ? selected === option.value : selected.includes(option.value);
}

function isOptionDefaultChecked(
  option: ChoiceGroupOption,
  mode: 'single' | 'multi',
  selected: string | readonly string[] | undefined,
  defaultSelected: string | readonly string[] | undefined,
): true | undefined {
  if (selected !== undefined || defaultSelected === undefined) {
    return;
  }

  const isDefault = mode === 'single' ? defaultSelected === option.value : defaultSelected.includes(option.value);
  return isDefault ? true : undefined;
}

/**
 * Renders a fieldset-backed group of choice inputs (radios or checkboxes).
 *
 * Shared implementation behind `<RadioGroup>` and `<CheckboxGroup>`. Consumes
 * `describeField` for the fieldset's ARIA wiring and hint/error nodes. See
 * CONTEXT.md for the "Choice group" domain term.
 *
 * @internal
 */
export function ChoiceGroup(props: ChoiceGroupProps) {
  const {
    id,
    name,
    legend,
    hint,
    error,
    options,
    inputType,
    groupClass,
    itemClass,
    onChange,
    ref,
    mode,
    selected,
    defaultSelected,
    ...rest
  } = props;

  const { fieldsetAriaProps, hintNode, errorNode, hasError } = describeField(id, { hint, error });

  return (
    <fieldset
      ref={ref}
      {...rest}
      {...fieldsetAriaProps}
      className={hasError ? 'gw-field gw-fieldset gw-field--error' : 'gw-field gw-fieldset'}
      style={undefined}
      tabIndex={hasError ? -1 : rest.tabIndex}
    >
      <legend className="gw-label">{legend}</legend>
      {hintNode}
      {errorNode}
      <div className={groupClass}>
        {options.map((option) => {
          const idForOption = optionId(id, option);
          const optionHintId = option.hint === undefined ? undefined : `${idForOption}-hint`;
          const checked = isOptionChecked(option, mode, selected);
          const defaultChecked = isOptionDefaultChecked(option, mode, selected, defaultSelected);

          return (
            <label className={itemClass} htmlFor={idForOption} key={option.value}>
              <input
                aria-describedby={optionHintId}
                checked={checked}
                defaultChecked={defaultChecked}
                disabled={option.disabled}
                id={idForOption}
                name={name}
                onChange={onChange}
                type={inputType}
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
