import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { assertNever } from '../lib/assert-never';
import type { WithoutStyleOverrides } from './types';

/**
 * Supported visual treatments for Groundwork banners.
 *
 * @public
 */
export type BannerVariant = 'neutral' | 'success' | 'warning' | 'error';

/**
 * Supported announcement semantics for Groundwork banners.
 *
 * @public
 */
export type BannerAnnouncement = 'none' | 'polite' | 'assertive';

/**
 * Props for the Groundwork Banner component.
 *
 * @public
 */
export type BannerProps = WithoutStyleOverrides<
  Omit<HTMLAttributes<HTMLDivElement>, 'aria-live' | 'children' | 'role' | 'title'>
> & {
  variant?: BannerVariant;
  title: ReactNode;
  children?: ReactNode;
  announcement?: BannerAnnouncement;
  ref?: Ref<HTMLDivElement>;
};

function bannerClassName(variant: BannerVariant): string {
  switch (variant) {
    case 'neutral':
      return 'gw-banner';
    case 'success':
      return 'gw-banner gw-banner--success';
    case 'warning':
      return 'gw-banner gw-banner--warning';
    case 'error':
      return 'gw-banner gw-banner--error';
    default:
      return assertNever(variant);
  }
}

function announcementProps(
  announcement: BannerAnnouncement,
): Pick<HTMLAttributes<HTMLDivElement>, 'aria-live' | 'role'> {
  switch (announcement) {
    case 'none':
      return {};
    case 'polite':
      return { 'aria-live': 'polite', role: 'status' };
    case 'assertive':
      return { 'aria-live': 'assertive', role: 'alert' };
    default:
      return assertNever(announcement);
  }
}

/**
 * Renders a status banner with a required visible title.
 *
 * @example
 * ```tsx
 * <Banner variant="success" title="Address saved">
 *   Your delivery address has been updated.
 * </Banner>
 * ```
 *
 * @public
 */
export function Banner({ variant = 'neutral', title, children, announcement = 'none', ref, ...props }: BannerProps) {
  return (
    <div
      ref={ref}
      {...props}
      {...announcementProps(announcement)}
      className={bannerClassName(variant)}
      style={undefined}
    >
      <p className="gw-banner__title">{title}</p>
      {children === undefined ? null : <div className="gw-banner__body">{children}</div>}
    </div>
  );
}
