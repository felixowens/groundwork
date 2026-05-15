/**
 * Composes a BEM block + modifier class string, omitting the modifier when it
 * equals the default value.
 *
 * Collapses the repeated "switch on a closed variant union, return
 * `'base'` or `'base base--<variant>'`" pattern used by components with a
 * default variant (Button, Banner, Input width). When `defaultModifier` is
 * omitted, the modifier class is always appended.
 *
 * @example
 * ```ts
 * bemModifier('gw-button', 'primary', 'primary'); // 'gw-button'
 * bemModifier('gw-button', 'secondary', 'primary'); // 'gw-button gw-button--secondary'
 * bemModifier('gw-banner', variant, 'neutral');
 * ```
 *
 * @internal
 */
export function bemModifier<M extends string>(base: string, modifier: M, defaultModifier?: M): string {
  return modifier === defaultModifier ? base : `${base} ${base}--${modifier}`;
}
