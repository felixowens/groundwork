import { forwardRef } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import type { AccessibleName, WithoutStyleOverrides } from './types';

export type SelectProps = WithoutStyleOverrides<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'aria-label' | 'aria-labelledby'>
> &
  AccessibleName & {
    children: ReactNode;
  };

/** Renders a Groundwork select. Prefer using it inside Field for labelling and ARIA wiring. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, ...props },
  ref,
) {
  return (
    <select ref={ref} {...props} className="gw-select" style={undefined}>
      {children}
    </select>
  );
});
