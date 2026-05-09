import type { Ref } from 'react';
import { type FieldError, formatFieldError } from '../form/field-error';

/** A single invalid field listed in an ErrorSummary.
 *
 * @public
 */
export interface ErrorSummaryItem {
  id: string;
  label: string;
  error: FieldError;
}

/** Props for the Groundwork ErrorSummary component.
 *
 * @public
 */
export interface ErrorSummaryProps {
  title?: string;
  items: readonly ErrorSummaryItem[];
  ref?: Ref<HTMLDivElement>;
}

/**
 * Renders a page-level validation summary linking to each invalid field.
 *
 * @example
 * ```tsx
 * <ErrorSummary items={errors} />
 * ```
 *
 * @public
 */
export function ErrorSummary({ title = 'There is a problem', items, ref }: ErrorSummaryProps) {
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
}
