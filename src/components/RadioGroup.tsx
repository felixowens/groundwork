import type { ChangeEventHandler, FieldsetHTMLAttributes, Ref } from 'react';
import type { FieldError } from '../form/field-error';
import { ChoiceGroup, type ChoiceGroupOption } from './_internal/ChoiceGroup';
import type { WithoutStyleOverrides } from './types';

/**
 * A single option in a Groundwork radio group.
 *
 * @public
 */
export type RadioGroupOption = ChoiceGroupOption;

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
export function RadioGroup({ value, defaultValue, ...rest }: RadioGroupProps) {
  return (
    <ChoiceGroup
      {...rest}
      mode="single"
      selected={value}
      defaultSelected={defaultValue}
      inputType="radio"
      groupClass="gw-radios"
      itemClass="gw-radio-item"
    />
  );
}
