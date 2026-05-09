/**
 * @internal
 */
export type WithoutStyleOverrides<T> = Omit<T, 'className' | 'style'>;

/**
 * @internal
 */
export type AccessibleName =
  | {
      'aria-label': string;
      'aria-labelledby'?: never;
    }
  | {
      'aria-labelledby': string;
      'aria-label'?: never;
    };
