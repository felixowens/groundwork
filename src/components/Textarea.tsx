import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { AccessibleName, WithoutStyleOverrides } from './types';

export type TextareaProps = WithoutStyleOverrides<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-label' | 'aria-labelledby'>
> &
  AccessibleName;

/** Renders a Groundwork textarea. Prefer using it inside Field for labelling and ARIA wiring. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  return <textarea ref={ref} {...props} className="gw-textarea" style={undefined} />;
});
