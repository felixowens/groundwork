# Follow-ups

Revisit-when triggers that don't belong inline as TODOs. Each entry names the trigger condition, the work to do, and the files most likely to need editing.

## Revisit Select / RadioGroup / CheckboxGroup guidance

**Trigger:** when a richer single-choice picker (autocomplete-style) component lands in Groundwork.

**What to do:** the in-page cross-links between Select and RadioGroup currently use the canonical "short, visible list" vs "longer single-choice list" language without a concrete option-count threshold. When the new picker exists, decide between:

- sharpening the in-page cross-links with thresholds and a third option, or
- promoting the comparison to a pattern (e.g. `/patterns/single-choice/`) or reference page.

**Files most likely affected:**

- `docs/src/pages/components/select.astro`
- `docs/src/pages/components/radio-group.astro`
- `docs/src/pages/components/checkbox-group.astro`
- the eventual new picker component page

## Auto-derive nav sections from the filesystem

**Trigger:** when a third Pattern, a fourth Get-started page, or a third Reference convention page is added — anywhere the manual nav list outgrows what a reviewer can hold in their head.

**What to do:** `docs-registry.ts` already auto-derives `componentDocs` from `_meta/*.ts` glob. Extend the same shape to Patterns and to Reference subsections so adding a page automatically registers it in the sidebar. Avoid touching `Get started` until it has more than ~4 entries — manual is still cheaper there.

**Files most likely affected:**

- `docs/src/docs-registry.ts`
- new `_meta` sidecar files under `docs/src/pages/patterns/` and `docs/src/pages/reference/conventions/`

## Dedupe ADR title parsing across index and slug routes

**Trigger:** when the ADR count grows beyond ~10, or when an ADR title format changes (e.g. front-matter title instead of leading H1).

**What to do:** `docs/src/pages/reference/adr/index.astro` and `docs/src/pages/reference/adr/[slug].astro` both regex-extract the H1 from `rawContent()` independently. Extract to a single data-loading helper (e.g. `docs/src/lib/adrs.ts`) consumed by both pages — eliminates the duplicate glob and the duplicate parsing.

**Files most likely affected:**

- `docs/src/pages/reference/adr/index.astro`
- `docs/src/pages/reference/adr/[slug].astro`
- new `docs/src/lib/adrs.ts`

## Derive prose-spacing test constants from CSS custom properties

**Trigger:** when a `--space-*` primitive changes, or when `prose-spacing.spec.ts` produces a false negative (test passes but spacing visibly wrong).

**What to do:** the test inlines `SPACE_2 = 8`, `SPACE_4 = 16`, `SPACE_8 = 32`, `SPACE_10 = 40` as pixel literals. If a primitive shifts, the test silently keeps the old expectation. Read each value from `getComputedStyle(document.documentElement).getPropertyValue('--space-N')` inside the browser context the test already runs in, the same way the `1px` border-width tolerance could be sourced from `--border-width-thin`.

**Files most likely affected:**

- `tests/visual/prose-spacing.spec.ts`

## Re-evaluate the hand-rolled API doc generator

**Trigger:** when `scripts/build-api-docs.mjs` grows beyond ~300 lines (ADR-0004's stated re-eval threshold), or when its output starts diverging visibly from what TSDoc would emit (e.g. mis-formatted unions, missing `@throws`, lost overloads).

**What to do:** options in rough order of cost:

- replace TS-compiler-API walking with `@microsoft/tsdoc` (already a devDependency for `scripts/project-rules/rules/tsdoc.mjs`) — narrower scope, idiomatic, but different output shape
- replace the whole script with the `typedoc` package — turnkey but generic output that may not fit Groundwork's prose tone
- split the existing script into AST-walk / format / render modules so each layer is independently testable

Also: `classifyKind()` returns `'other'` and `kindOrder()` uses a `default: 9` fallback — neither exhaustiveness-checked. If we keep the script, add `assertNever` exhaustiveness branches matching the project idiom (`src/components/Banner.tsx:46`).

**Files most likely affected:**

- `scripts/build-api-docs.mjs`
- `docs/adr/0004-api-reference-as-typedoc.md` (update or supersede)

## Promote DefinitionList to the library

**Trigger:** when an application surface (or a third docs surface) wants a simple read-only key-value display — metadata panels, system info, configuration readouts, glossary-style content.

**What to do:** the docs-internal `TokenList` Astro component (`docs/src/components/TokenList.astro`) is a styled two-column `<dl>`. Promote a React equivalent (`<DefinitionList>` with `Array<{ term, description }>`) into `src/components/`. It complements `SummaryList`, which covers the richer "review-with-Change-actions" transaction case — `DefinitionList` is the read-only counterpart with no per-row interactions.

**Files most likely affected:**

- new `src/components/DefinitionList.tsx`
- new `.gw-definition-list` rules in `src/styles/components.css`
- migrate `docs/src/components/TokenList.astro` to consume the library component (or delete it, depending on Astro/React interop choices for static pages)

## Decide whether to expose primitives on the colour style page

**Trigger:** when an application surface needs an off-palette colour — chart series, illustration accents, marketing surfaces, organisation branding — and the semantic palette doesn't cover the case.

**What to do:** today, primitives are private (`--_gw-*` prefix) and the colour style page documents only semantic tokens. gov.uk takes the opposite approach: they expose both their functional palette and their full web palette (Blue, Red, Green, etc. with tints and shades) so applications can reach for off-palette colours when needed. Re-evaluate:

- expose primitives publicly via a renamed prefix and document them on `/styles/colour/`, or
- keep primitives private and add a documented mechanism for extending the semantic palette per-application, or
- leave the system as-is and let applications inline the rare off-palette colour.

Write an ADR with the decision; right now the colour page hints at the gap ("If a colour you need isn't here") but doesn't resolve it.

**Files most likely affected:**

- `docs/src/pages/styles/colour.astro`
- `tokens/primitives.json` / `tokens/semantic.json`
- new ADR
- `CLAUDE.md` (the "two-tier only" rule may need refining)

## Audit visual regression diff threshold

**Trigger:** when a doc-page change visibly alters the rendered output but `npx playwright test tests/visual` still passes without `--update-snapshots`.

**What to do:** during the PR review fixup, adding a second card to `/get-started/` was a measurable visible change (~10% more rendered pixels on the index) but did not exceed `maxDiffPixelRatio: 0.005`. Either the metric is dominated by background pixels (most of the page is unchanged whitespace), or the threshold is still too lax for small layout additions. Investigate whether to tighten further (0.001?) or pair the ratio with `maxDiffPixels` so small absolute diffs don't slip through on long pages.

**Files most likely affected:**

- `playwright.config.ts`
