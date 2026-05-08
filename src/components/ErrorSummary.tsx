import { forwardRef } from 'react';
import { type FieldError, formatFieldError } from '../form/field-error';

export type ErrorSummaryItem = {
  id: string;
  label: string;
  error: FieldError;
};

export type ErrorSummaryProps = {
  title?: string;
  items: readonly ErrorSummaryItem[];
};

/** Renders a page-level validation summary linking to each invalid field. */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { title = 'There is a problem', items },
  ref,
) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="gw-error-summary" role="alert" tabIndex={-1}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              {item.label}: {formatFieldError(item.error)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
