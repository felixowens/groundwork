import type { ChangeEventHandler, FieldsetHTMLAttributes, Ref } from 'react';
import type { FieldError } from '../form/field-error';
import { ChoiceGroup, type ChoiceGroupOption } from './_internal/ChoiceGroup';
import type { WithoutStyleOverrides } from './types';

/**
 * A single option in a Groundwork checkbox group.
 *
 * @public
 */
export type CheckboxGroupOption = ChoiceGroupOption;

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
export function CheckboxGroup({ values, defaultValues, ...rest }: CheckboxGroupProps) {
  return (
    <ChoiceGroup
      {...rest}
      mode="multi"
      selected={values}
      defaultSelected={defaultValues}
      inputType="checkbox"
      groupClass="gw-checkboxes"
      itemClass="gw-checkbox-item"
    />
  );
}
