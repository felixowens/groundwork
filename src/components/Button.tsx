import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, type Ref, useRef } from 'react';
import { bemModifier } from '../lib/bem-modifier';
import type { WithoutStyleOverrides } from './types';

const DOUBLE_CLICK_THRESHOLD_MS = 500;

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
  /**
   * Ignore click events that fire within 500ms of the previous accepted click.
   * Useful for actions where a user's double-click would otherwise submit twice
   * — for example, motor-impairment-driven involuntary clicks or habituated
   * double-clicks from desktop operating systems. Slow-connection resubmits
   * (where the user clicks again seconds later after no feedback) are out of
   * scope; handle those with a loading state in the consumer.
   */
  preventDoubleClick?: boolean;
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
export function Button({
  variant = 'primary',
  type = 'button',
  preventDoubleClick = false,
  onClick,
  children,
  ref,
  ...props
}: ButtonProps) {
  const lastAcceptedClickRef = useRef(0);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (preventDoubleClick) {
      const now = Date.now();
      if (now - lastAcceptedClickRef.current < DOUBLE_CLICK_THRESHOLD_MS) {
        event.preventDefault();
        return;
      }
      lastAcceptedClickRef.current = now;
    }
    onClick?.(event);
  }

  return (
    <button
      ref={ref}
      {...props}
      onClick={handleClick}
      className={bemModifier('gw-button', variant, 'primary')}
      style={undefined}
      type={type}
    >
      {children}
    </button>
  );
}
