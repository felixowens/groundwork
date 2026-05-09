import type { ReactNode, Ref, SelectHTMLAttributes } from 'react';
import type { AccessibleName, WithoutStyleOverrides } from './types';

/** Props for the Groundwork Select component.
 *
 * @public
 */
export type SelectProps = WithoutStyleOverrides<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'aria-label' | 'aria-labelledby'>
> &
  AccessibleName & {
    children: ReactNode;
    ref?: Ref<HTMLSelectElement>;
  };

/**
 * Renders a Groundwork select. Prefer using it inside Field for labelling and ARIA wiring.
 *
 * @example
 * ```tsx
 * <Select aria-label="Country">
 *   <option>United Kingdom</option>
 * </Select>
 * ```
 *
 * @public
 */
export function Select({ children, ref, ...props }: SelectProps) {
  return (
    <select ref={ref} {...props} className="gw-select" style={undefined}>
      {children}
    </select>
  );
}
