import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { assertNever } from '../lib/assert-never';
import type { WithoutStyleOverrides } from './types';

/** Supported visual treatments for Groundwork buttons.
 *
 * @public
 */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

/** Props for the Groundwork Button component.
 *
 * @public
 */
export type ButtonProps = WithoutStyleOverrides<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

function buttonClassName(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'gw-button';
    case 'secondary':
      return 'gw-button gw-button--secondary';
    case 'destructive':
      return 'gw-button gw-button--destructive';
    case 'ghost':
      return 'gw-button gw-button--ghost';
    default:
      return assertNever(variant);
  }
}

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
    <button ref={ref} {...props} className={buttonClassName(variant)} style={undefined} type={type}>
      {children}
    </button>
  );
}
