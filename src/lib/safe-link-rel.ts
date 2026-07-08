const REL_TOKEN_SEPARATOR = /\s+/u;

/**
 * Returns a `rel` value that is safe for the given link `target`.
 *
 * When a link opens in a new browsing context (`target="_blank"`), the returned
 * `rel` always includes `noopener` and `noreferrer` so the opened page cannot
 * reach back through `window.opener`. Any author-supplied `rel` tokens are
 * preserved. For every other target the author `rel` is returned unchanged.
 *
 * @example
 * ```ts
 * safeLinkRel('_blank', undefined); // 'noopener noreferrer'
 * safeLinkRel('_blank', 'external'); // 'external noopener noreferrer'
 * safeLinkRel(undefined, 'external'); // 'external'
 * ```
 *
 * @internal
 */
export function safeLinkRel(target: string | undefined, rel: string | undefined): string | undefined {
  if (target !== '_blank') {
    return rel;
  }

  const relTokens = new Set(rel?.split(REL_TOKEN_SEPARATOR).filter((token) => token.length > 0));
  relTokens.add('noopener');
  relTokens.add('noreferrer');

  return Array.from(relTokens).join(' ');
}
