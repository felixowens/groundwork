import type { InputHTMLAttributes, Ref } from 'react';
import { assertNever } from '../lib/assert-never';
import type { AccessibleName, WithoutStyleOverrides } from './types';

/** Supported width hints for Groundwork text inputs.
 *
 * @public
 */
export type InputWidth = 'full' | 'w5' | 'w10' | 'w20' | 'w30' | 'two-thirds';

/** Props for the Groundwork Input component.
 *
 * @public
 */
export type InputProps = WithoutStyleOverrides<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-label' | 'aria-labelledby' | 'children'>
> &
  AccessibleName & {
    width?: InputWidth;
    ref?: Ref<HTMLInputElement>;
  };

function inputClassName(width: InputWidth): string {
  switch (width) {
    case 'full':
      return 'gw-input';
    case 'w5':
      return 'gw-input gw-input--w5';
    case 'w10':
      return 'gw-input gw-input--w10';
    case 'w20':
      return 'gw-input gw-input--w20';
    case 'w30':
      return 'gw-input gw-input--w30';
    case 'two-thirds':
      return 'gw-input gw-input--two-thirds';
    default:
      return assertNever(width);
  }
}

/**
 * Renders a Groundwork text input. Prefer using it inside Field for labelling and ARIA wiring.
 *
 * @example
 * ```tsx
 * <Input aria-label="Reference number" width="w10" />
 * ```
 *
 * @public
 */
export function Input({ width = 'full', ref, ...props }: InputProps) {
  return <input ref={ref} {...props} className={inputClassName(width)} style={undefined} />;
}
