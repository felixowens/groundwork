import type { InputHTMLAttributes, Ref } from 'react';
import { bemModifier } from '../lib/bem-modifier';
import type { AccessibleName, WithoutStyleOverrides } from './types';

/**
 * Supported width hints for Groundwork text inputs.
 *
 * @public
 */
export type InputWidth = 'full' | 'w5' | 'w10' | 'w20' | 'w30' | 'two-thirds';

/**
 * Props for the Groundwork Input component.
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
  return <input ref={ref} {...props} className={bemModifier('gw-input', width, 'full')} style={undefined} />;
}
