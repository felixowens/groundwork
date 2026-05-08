import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { assertNever } from '../lib/assert-never';
import type { AccessibleName, WithoutStyleOverrides } from './types';

export type InputWidth = 'full' | 'w5' | 'w10' | 'w20' | 'w30' | 'two-thirds';

export type InputProps = WithoutStyleOverrides<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-label' | 'aria-labelledby' | 'children'>
> &
  AccessibleName & {
    width?: InputWidth;
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

/** Renders a Groundwork text input. Prefer using it inside Field for labelling and ARIA wiring. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { width = 'full', ...props },
  ref,
) {
  return <input ref={ref} {...props} className={inputClassName(width)} style={undefined} />;
});
