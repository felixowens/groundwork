# Groundwork

Groundwork is an opinionated design system for web applications. It favours constraints over choices: a closed token set, semantic CSS custom properties, and React components that make accessible patterns hard to skip.

This repository is currently a proof of concept.

## What is included

- Two-tier DTCG-format design tokens: OKLCH private primitives (`--_gw-*`) mapped to public semantic tokens.
- Generated distributable CSS at `css/groundwork.css`.
- Restrictive React components for the core form workflow: `Field`, `Input`, `Textarea`, `Select`, `Button`, and `ErrorSummary`.
- Astro documentation pages with live demos.
- Playwright accessibility and visual-regression test harnesses.

## Architecture

```txt
primitives.json  ─┐
                  ├─ Style Dictionary ─> src/styles/generated/tokens.css  ─┐
semantic.json    ─┘                                                        │
                                                                           ├─ scripts/build-css.mjs ─> css/groundwork.css
src/styles/*.css ──────────────────────────────────────────────────────────┘
```

Style Dictionary generates the token CSS; `scripts/build-css.mjs` assembles that generated token CSS with authored source CSS into the distributable file.

Components reference only semantic tokens. Primitive tokens exist so themes can swap raw values without rewriting component CSS.

## Development

```bash
npm install
npm run build:css
npm run typecheck
npm run build
npm test
npm run review:ui
```

`npm run review:ui` captures local UI-review screenshots and layout checks in `.logs/ui-review/latest/`. It is a development review tool, not a CI gate.

`just ci` runs the same validation entrypoint as `npm run ci`.

If Playwright browsers are not installed locally, install them explicitly before running browser tests:

```bash
npx playwright install
```

## Usage

```tsx
import { Button, Field, Input } from '@groundwork/ui';
import '@groundwork/ui/css/groundwork.css';

export function Example() {
  return (
    <Field id="email" label="Email address" hint="We'll send your receipt here">
      {({ inputProps }) => <Input {...inputProps} name="email" type="email" width="w30" />}
    </Field>
  );
}
```

## Rules

- Do not edit `css/groundwork.css` directly. Edit token JSON or source CSS, then run `npm run build:css`.
- Do not reference `--_gw-*` primitives in component CSS. Use semantic tokens only.
- Do not add component tokens without explicit approval.
- Do not add CSS-in-JS, Tailwind, or runtime styling.
- React components intentionally do not expose `className` or `style` escape hatches.
