import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';
import { assertNever } from '../lib/assert-never';
import type { WithoutStyleOverrides } from './types';

const REL_TOKEN_SEPARATOR = /\s+/u;

interface SummaryListActionBase {
  label: ReactNode;
  visuallyHiddenText: string;
}

/**
 * A link action associated with a SummaryList row.
 *
 * @public
 */
export type SummaryListLinkAction = WithoutStyleOverrides<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'style'>
> &
  SummaryListActionBase & {
    kind: 'link';
    href: string;
  };

/**
 * A button action associated with a SummaryList row.
 *
 * @public
 */
export type SummaryListButtonAction = WithoutStyleOverrides<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'style' | 'type'>
> &
  SummaryListActionBase & {
    kind: 'button';
    type?: 'button' | 'submit' | 'reset' | undefined;
  };

/**
 * Supported row actions for the Groundwork SummaryList component.
 *
 * @public
 */
export type SummaryListAction = SummaryListLinkAction | SummaryListButtonAction;

/**
 * A single key/value row in a Groundwork SummaryList.
 *
 * @public
 */
export interface SummaryListRow {
  id: string;
  key: ReactNode;
  value: ReactNode;
  actions?: readonly SummaryListAction[] | undefined;
}

/**
 * Props for the Groundwork SummaryList component.
 *
 * @public
 */
export type SummaryListProps = WithoutStyleOverrides<Omit<HTMLAttributes<HTMLDListElement>, 'children'>> & {
  rows: readonly SummaryListRow[];
  ref?: Ref<HTMLDListElement>;
};

function rowHasActions(row: SummaryListRow): boolean {
  return row.actions !== undefined && row.actions.length > 0;
}

function actionContent(action: SummaryListAction): ReactNode {
  return (
    <>
      {action.label}
      <span className="gw-visually-hidden"> {action.visuallyHiddenText}</span>
    </>
  );
}

function safeLinkRel(target: string | undefined, rel: string | undefined): string | undefined {
  if (target !== '_blank') {
    return rel;
  }

  const relTokens = new Set(rel?.split(REL_TOKEN_SEPARATOR).filter((token) => token.length > 0));
  relTokens.add('noopener');
  relTokens.add('noreferrer');

  return Array.from(relTokens).join(' ');
}

function renderAction(action: SummaryListAction): ReactNode {
  const kind = action.kind;

  switch (kind) {
    case 'link': {
      const {
        kind: _kind,
        label: _label,
        visuallyHiddenText: _visuallyHiddenText,
        href,
        rel,
        target,
        ...props
      } = action;

      return (
        <a {...props} href={href} rel={safeLinkRel(target, rel)} target={target} className="gw-link" style={undefined}>
          {actionContent(action)}
        </a>
      );
    }
    case 'button': {
      const { kind: _kind, label: _label, visuallyHiddenText: _visuallyHiddenText, type = 'button', ...props } = action;

      return (
        <button {...props} type={type} className="gw-link" style={undefined}>
          {actionContent(action)}
        </button>
      );
    }
    default:
      return assertNever(kind);
  }
}

function renderActions(actions: readonly SummaryListAction[] | undefined): ReactNode {
  if (actions === undefined || actions.length === 0) {
    return null;
  }

  if (actions.length === 1) {
    for (const action of actions) {
      return <dd className="gw-summary-list__action">{renderAction(action)}</dd>;
    }
  }

  return (
    <dd className="gw-summary-list__action">
      <ul className="gw-summary-list__actions-list">
        {actions.map((action, index) => (
          <li className="gw-summary-list__actions-list-item" key={action.id ?? `${action.kind}-${index}`}>
            {renderAction(action)}
          </li>
        ))}
      </ul>
    </dd>
  );
}

/**
 * Renders key/value facts, optionally with contextual row actions.
 *
 * @example
 * ```tsx
 * <SummaryList
 *   rows={[
 *     {
 *       id: 'full-name',
 *       key: 'Full name',
 *       value: 'Ada Lovelace',
 *       actions: [{ kind: 'link', href: '/name', label: 'Change', visuallyHiddenText: 'full name' }],
 *     },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export function SummaryList({ rows, ref, ...props }: SummaryListProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl ref={ref} {...props} className="gw-summary-list" style={undefined}>
      {rows.map((row) => (
        <div
          className={
            rowHasActions(row) ? 'gw-summary-list__row' : 'gw-summary-list__row gw-summary-list__row--no-actions'
          }
          key={row.id}
        >
          <dt className="gw-summary-list__key">{row.key}</dt>
          <dd className="gw-summary-list__value">{row.value}</dd>
          {renderActions(row.actions)}
        </div>
      ))}
    </dl>
  );
}
