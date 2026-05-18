import { type ReactNode, type Ref, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Props for the Groundwork CodeBlock component.
 *
 * @public
 */
export interface CodeBlockProps {
  /**
   * The code text to render. Whitespace is preserved verbatim.
   */
  children: string;
  /**
   * Optional caption rendered above the code block.
   */
  caption?: string | undefined;
  /**
   * Optional language hint. Renders as a `language-{value}` class on the inner
   * `<code>` element so syntax-highlighting passes can hook on later.
   */
  language?: string | undefined;
  ref?: Ref<HTMLElement>;
}

/**
 * Renders a code block with an optional caption and a "Copy" button.
 *
 * @example
 * ```tsx
 * <CodeBlock language="tsx">{`<Button>Continue</Button>`}</CodeBlock>
 * ```
 *
 * @public
 */
export function CodeBlock({ children, caption, language, ref }: CodeBlockProps): ReactNode {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attachPre = useCallback((pre: HTMLPreElement | null) => {
    if (pre !== null) {
      pre.setAttribute('tabindex', '0');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
      return;
    }
    await navigator.clipboard.writeText(children);
    setCopied(true);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [children]);

  const codeClass = language === undefined ? undefined : `language-${language}`;

  return (
    <figure className="gw-code-block-figure" ref={ref}>
      {caption === undefined ? null : <figcaption className="gw-code-block-caption">{caption}</figcaption>}
      <div className="gw-code-block-shell">
        <pre className="gw-code-block" ref={attachPre}>
          <code className={codeClass}>{children}</code>
        </pre>
        <button className="gw-code-block-copy" onClick={copy} type="button">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <span aria-live="polite" className="gw-visually-hidden">
        {copied ? 'Code copied to clipboard.' : ''}
      </span>
    </figure>
  );
}
