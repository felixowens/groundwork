# Groundwork Design System — Project Handoff

## What is this?

Groundwork is an opinionated design system for web applications, inspired by GOV.UK's design system philosophy: constraints over choices, accessibility as architecture, documentation as product. It exists as a two-tier token system (private primitives → public semantic tokens) with React components that enforce correct usage through TypeScript.

This document is a handoff from a design conversation. The full chat history is available as context. Read it — it contains the design rationale, the self-critique of v0.1, and the architectural decisions that led to v0.2. This document summarises the decisions, not the reasoning.

---

## Design principles

1. **Constraints over choices.** A closed token set. If it's not in the scale, it doesn't exist.
2. **Two layers, one seam.** Primitives hold raw values. Semantic tokens hold decisions. Theming swaps at the seam between them.
3. **Accessibility as architecture.** Components that are structurally impossible to use without proper labelling. Focus states that are unmistakable. Colour never carries meaning alone.
4. **Names describe decisions, not appearances.** `--ink-secondary` not `--ink-muted`. `--text-body` not `--text-16`. If you can rename the underlying value without the token name becoming a lie, the name is correct.
5. **Documentation is product.** Every component has: when to use it, when not to, the reasoning behind it, and edge case guidance.

---

## Token architecture

Two tiers. No component tokens (add that layer only if multi-team consumption demands it).

### Layer 1: Primitives (private)

Prefixed `--_gw-` to signal "internal, do not reference in component CSS."

- **Neutral scale:** `_gw-neutral-0` (white) through `_gw-neutral-950` (near-black). Warm grey. ~12 steps.
- **Brand blue:** `_gw-blue-100` through `_gw-blue-600`. Single hue, 6 steps.
- **Status colours:** `_gw-red-*` (danger/error), `_gw-green-*` (success), `_gw-amber-*` (warning). ~5 steps each.
- **Focus:** `_gw-yellow-400` — high-visibility yellow.
- **Spacing:** `_gw-space-1` (4px) through `_gw-space-20` (80px). 4px base, 11 values. Gaps in the scale are intentional — they prevent bikeshedding.
- **Type scale:** `_gw-text-xs` (13px) through `_gw-text-3xl` (40px). 7 sizes.
- **Border widths:** `_gw-border-thin` (1px), `medium` (2px), `thick` (3px), `heavy` (4px).
- **Radii:** `_gw-radius-sm` (3px), `_gw-radius-md` (6px). Two options. Intentional.

### Layer 2: Semantic tokens (public)

These are the decisions. Components reference ONLY these.

**Ink (text):**

- `--ink` → primary text, headings, body
- `--ink-secondary` → descriptions, hints, supporting text
- `--ink-disabled` → disabled controls, placeholders

**Surface (backgrounds):**

- `--surface` → page background
- `--surface-raised` → cards, panels
- `--surface-sunken` → code blocks, inset areas
- `--surface-overlay` → panels on raised surfaces (card-on-card nesting)

**Border:**

- `--border` → default dividers
- `--border-strong` → input borders, emphasis
- `--border-width-thin` through `--border-width-heavy`

**Semantic colour:**

- `--action`, `--action-hover`, `--action-text`
- `--destructive`, `--destructive-hover`, `--destructive-text`
- `--success`, `--success-surface`
- `--warning`, `--warning-surface`
- `--error`, `--error-surface`

**Focus ring:**

- `--focus-ring-color`, `--focus-ring-width`, `--focus-ring-offset`

**Typography:**

- `--text-caption`, `--text-secondary`, `--text-body`, `--text-subheading`, `--text-heading`, `--text-title`, `--text-display`
- Two families: `--font-sans`, `--font-mono`
- `--leading-tight` (1.25), `--leading-normal` (1.6)
- `--measure` (66ch max prose width)

**Dark mode:** Implemented by remapping semantic tokens to different primitives inside `@media (prefers-color-scheme: dark)`. Components don't change. Only the wiring changes.

**Re-theming:** Override primitives (e.g. replace `--_gw-blue-*` with brand colours). Semantic tokens inherit automatically.

---

## Component inventory

The system includes these components. Each enforces its usage rules through the React API.

- **Button** — primary, secondary, destructive, ghost. One primary per view.
- **Field** — the workhorse wrapper. Renders label, hint, error state, aria wiring. Every input goes through Field.
- **Input** — text input with width hints (w5, w10, w20, w30, two-thirds).
- **Textarea**
- **Select**
- **RadioGroup / CheckboxGroup** — large touch targets, bordered items.
- **ErrorSummary** — page-top validation summary with links to errored fields.
- **Banner** — success, warning, error, neutral. Left border accent.
- **Tag** — status indicators (action, success, warning, error, default).
- **SummaryList** — key-value "check your answers" pattern.
- **Table** — with numeric column alignment support.
- **Card** — default, raised, interactive. Auto-handles nested elevation via `--surface-overlay`.
- **Tabs** — ARIA tablist with proper roles.
- **Accordion/Details** — native `<details>` with styling.
- **Breadcrumb**
- **Pagination**

Layout primitives (CSS-only, no React wrapper needed):

- `.gw-width` (container), `.gw-stack` (vertical rhythm), `.gw-cluster` (horizontal wrap), `.gw-prose` (measure-capped text), `.gw-grid` (auto-responsive)

---

## React component design rules

These are hard rules for the React layer:

1. **`Field` is the primary form API.** Every form element goes through `<Field label="..." hint="..." error="...">`. Field handles label rendering, hint text, error state, and aria-describedby wiring. The `label` prop is required — you cannot render a form element without one.

2. **Props reflect the closed token set.** `variant: 'primary' | 'secondary' | 'destructive' | 'ghost'` — not className strings. `width: 'w5' | 'w10' | 'w20' | 'w30'` — not arbitrary values. TypeScript enforces the system's constraints.

3. **No `style` prop passthrough. No `className` override.** The component API only exposes the decisions the system supports. Users drop to raw CSS classes if they need to break out.

4. **Uncontrolled by default, controlled escape hatch.** Components forward refs and spread remaining HTML props. Don't reimplement form state.

5. **No CSS-in-JS.** Import the CSS file. Components use class names. This keeps the CSS extractable for non-React consumers.

6. **Error messages require both what's wrong and how to fix it.** The ErrorSummary and Field error APIs should make this pattern the default.

---

## Tech stack

- **Token source of truth:** Style Dictionary. Primitives and semantics as JSON. Generates CSS custom properties + TypeScript token types.
- **CSS:** Plain CSS custom properties. No preprocessor. The generated `groundwork.css` is the distributable.
- **React components:** TypeScript, strict mode. Thin wrappers that enforce patterns via the type system.
- **Documentation site:** Astro with MDX. Content collections for component pages (frontmatter: status, version, usage guidelines). Live demos are literal HTML snippets.
- **Testing:** Playwright for visual regression (screenshot every demo page, diff on PR). axe-core via Playwright for automated accessibility checks.
- **Repo hosting:** Harry's self-hosted Forgejo instance.

---

## Repo structure

```txt
groundwork/
├── CLAUDE.md              ← agent instructions (see below)
├── package.json
├── tokens/
│   ├── primitives.json    ← raw palette, scales, border widths
│   └── semantic.json      ← decisions, references primitives
├── css/
│   └── groundwork.css     ← generated by Style Dictionary
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Field.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── CheckboxGroup.tsx
│   │   ├── ErrorSummary.tsx
│   │   ├── Banner.tsx
│   │   ├── Tag.tsx
│   │   ├── SummaryList.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   ├── Details.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Pagination.tsx
│   └── tokens.ts          ← exported token values for JS use
│
├── docs/
│   └── src/
│       └── content/
│           ├── components/ ← one MDX per component
│           └── tokens/     ← one MDX per token category
├── tests/
│   ├── visual/            ← Playwright screenshot tests
│   └── a11y/              ← axe-core accessibility tests
└── dist/                  ← build output
```

---

## CLAUDE.md guidance

The repo should include a CLAUDE.md with these instructions for any coding agent working on it:

- This is a design system. Visual consistency and API correctness matter more than shipping speed.
- Read the full conversation history (linked/attached) before making architectural decisions. The design rationale matters.
- Token changes cascade. Before modifying any primitive or semantic token, trace every component that references it.
- The CSS file is generated from Style Dictionary. Never edit `css/groundwork.css` directly — edit the token JSON sources.
- Every React component must: require a `label` or equivalent accessible name, use semantic tokens only (never primitives or raw values in component code), forward refs, spread remaining HTML attributes.
- Every new component needs: a demo page in docs, a Playwright visual regression screenshot, and an axe-core accessibility test.
- Do not add component tokens (third tier) without explicit approval. Two tiers is sufficient until multi-team consumption proves otherwise.
- Do not add CSS-in-JS, Tailwind, or any runtime styling solution. The CSS custom properties are the styling system.
- Do not add `style` or `className` props to components. The API is intentionally restrictive.
- Prefer `<Field>` composition over standalone inputs. If someone is rendering `<Input>` outside of `<Field>`, something is wrong.

---

## What to build first

In priority order:

1. **Style Dictionary pipeline.** Get `tokens/primitives.json` + `tokens/semantic.json` → `css/groundwork.css` working. This is the foundation everything else depends on.
2. **Field + Input + Button.** The three components that cover 80% of form UI. Field is the most important — it's where the accessibility constraints live.
3. **ErrorSummary + error state on Field.** The error pattern is the system's most distinctive feature.
4. **Astro docs site** with pages for the three components above. Each page: when to use, when not to, live demo, code snippet, accessibility notes.
5. **Playwright tests** for the above pages (visual + a11y).
6. Remaining components in rough priority: Banner, Select, Textarea, RadioGroup, CheckboxGroup, Tag, SummaryList, Table, Card, Tabs, Details, Breadcrumb, Pagination.

---

## What to skip for now

- Figma integration
- Framework wrappers beyond React (Svelte, Vue, Web Components)
- npm publishing (use it in a real project first)
- Design token API / theming runtime beyond CSS custom properties
- Animation system
- Icon system
- A third token tier (component tokens)

---

## Reference

The v0.2 CSS implementation is attached to this conversation as `groundwork-design-system.html`. It contains the complete working token system, all component styles, and a documentation page demonstrating every component. Use it as the ground truth for visual appearance and token values.
