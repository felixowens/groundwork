import type { Ref, TextareaHTMLAttributes } from 'react';
import type { AccessibleName, WithoutStyleOverrides } from './types';

export type TextareaProps = WithoutStyleOverrides<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-label' | 'aria-labelledby'>
> &
  AccessibleName & {
    ref?: Ref<HTMLTextAreaElement>;
  };

/** Renders a Groundwork textarea. Prefer using it inside Field for labelling and ARIA wiring. */
export function Textarea({ ref, ...props }: TextareaProps) {
  return <textarea ref={ref} {...props} className="gw-textarea" style={undefined} />;
}
