import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';
import { bemModifier } from '../lib/bem-modifier';
import { safeLinkRel } from '../lib/safe-link-rel';
import type { WithoutStyleOverrides } from './types';

/**
 * Elevation treatments for a Groundwork Card.
 *
 * `default` sits flat with a hairline border; `raised` lifts the card with a
 * shadow. Interactivity is a separate concern — pass `href` to make a card a
 * link — so elevation and clickability compose instead of fighting.
 *
 * @public
 */
export type CardElevation = 'default' | 'raised';

interface CardCommon {
  /**
   * Elevation treatment for the card.
   *
   * @defaultValue 'default'
   */
  variant?: CardElevation;
  children: ReactNode;
}

/**
 * Props for a non-interactive Groundwork Card, rendered as a `<div>`.
 *
 * @public
 */
export type CardContainerProps = WithoutStyleOverrides<Omit<HTMLAttributes<HTMLDivElement>, 'children'>> &
  CardCommon & {
    href?: never;
    ref?: Ref<HTMLDivElement>;
  };

/**
 * Props for an interactive Groundwork Card, rendered as an `<a>` link.
 *
 * @public
 */
export type CardLinkProps = WithoutStyleOverrides<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>> &
  CardCommon & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

/**
 * Props for the Groundwork Card component.
 *
 * @public
 */
export type CardProps = CardContainerProps | CardLinkProps;

function isLinkCard(props: CardProps): props is CardLinkProps {
  return 'href' in props && props.href !== undefined;
}

/**
 * Groups related content in a bordered surface, optionally as a whole-card link.
 *
 * A plain card is a `<div>`. Passing `href` renders a real `<a>` instead, so an
 * interactive card is keyboard-focusable and announced as a link — never a
 * click-trap `<div>`. Cards nested on a raised surface pick up
 * `--surface-overlay` automatically, so card-on-card layouts keep their
 * contrast without any extra prop.
 *
 * @example
 * ```tsx
 * <Card variant="raised">
 *   <h3 className="gw-heading-s">Weekly summary</h3>
 *   <p>2,847 active users</p>
 * </Card>
 *
 * <Card href="/reports/42">
 *   <h3 className="gw-heading-s">March report</h3>
 *   <p>Open the full breakdown</p>
 * </Card>
 * ```
 *
 * @public
 */
export function Card(props: CardProps) {
  const { variant = 'default', children } = props;
  const elevation = bemModifier('gw-card', variant, 'default');

  if (isLinkCard(props)) {
    const { variant: _variant, children: _children, ref, href, rel, target, ...rest } = props;

    return (
      <a
        {...rest}
        ref={ref}
        href={href}
        rel={safeLinkRel(target, rel)}
        target={target}
        className={`${elevation} gw-card--interactive`}
        style={undefined}
      >
        {children}
      </a>
    );
  }

  const { variant: _variant, children: _children, ref, ...rest } = props;

  return (
    <div {...rest} ref={ref} className={elevation} style={undefined}>
      {children}
    </div>
  );
}
