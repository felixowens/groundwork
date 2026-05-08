import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { assertNever } from '../lib/assert-never';
import type { WithoutStyleOverrides } from './types';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export type ButtonProps = WithoutStyleOverrides<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  children: ReactNode;
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

/** Renders an action button with Groundwork's closed variant set. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', type = 'button', children, ...props },
  ref,
) {
  return (
    <button ref={ref} {...props} className={buttonClassName(variant)} style={undefined} type={type}>
      {children}
    </button>
  );
});
