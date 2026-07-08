import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { bemModifier } from '../lib/bem-modifier';
import type { WithoutStyleOverrides } from './types';

/**
 * Supported visual treatments for Groundwork tags.
 *
 * @public
 */
export type TagVariant = 'neutral' | 'action' | 'success' | 'warning' | 'error';

/**
 * Props for the Groundwork Tag component.
 *
 * @public
 */
export type TagProps = WithoutStyleOverrides<Omit<HTMLAttributes<HTMLSpanElement>, 'children'>> & {
  variant?: TagVariant;
  children: ReactNode;
  ref?: Ref<HTMLSpanElement>;
};

/**
 * Renders a compact status indicator with a required text label.
 *
 * The label is the tag's accessible name and its non-colour cue, so the meaning
 * never depends on the variant colour alone.
 *
 * @example
 * ```tsx
 * <Tag variant="success">Paid</Tag>
 * ```
 *
 * @public
 */
export function Tag({ variant = 'neutral', children, ref, ...props }: TagProps) {
  return (
    <span ref={ref} {...props} className={bemModifier('gw-tag', variant, 'neutral')} style={undefined}>
      {children}
    </span>
  );
}
