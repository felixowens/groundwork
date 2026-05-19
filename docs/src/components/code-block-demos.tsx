import { CodeBlock } from '../../../src';

export function CodeBlockHeroDemo() {
  return (
    <CodeBlock language="tsx">{`<Field id="email" label="Email address">
  {({ inputProps }) => <Input {...inputProps} type="email" />}
</Field>`}</CodeBlock>
  );
}

export function CodeBlockCaptionDemo() {
  return (
    <CodeBlock caption="Standard page wrapper" language="html">{`<section class="gw-section">
  <div class="gw-width gw-stack--lg">
    <h1>Page title</h1>
    <p>Page intro.</p>
  </div>
</section>`}</CodeBlock>
  );
}

export function CodeBlockLanguageDemo() {
  return (
    <CodeBlock language="css">{`.gw-button {
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  border-radius: var(--radius-sm);
}`}</CodeBlock>
  );
}
