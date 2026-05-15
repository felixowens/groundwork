import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { bemModifier } from '../lib/bem-modifier';
import type { WithoutStyleOverrides } from './types';

/**
 * Supported visual treatments for Groundwork buttons.
 *
 * @public
 */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

/**
 * Props for the Groundwork Button component.
 *
 * @public
 */
export type ButtonProps = WithoutStyleOverrides<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Renders an action button with Groundwork's closed variant set.
 *
 * @example
 * ```tsx
 * <Button variant="primary">Save and continue</Button>
 * ```
 *
 * @public
 */
export function Button({ variant = 'primary', type = 'button', children, ref, ...props }: ButtonProps) {
  return (
    <button ref={ref} {...props} className={bemModifier('gw-button', variant, 'primary')} style={undefined} type={type}>
      {children}
    </button>
  );
}
