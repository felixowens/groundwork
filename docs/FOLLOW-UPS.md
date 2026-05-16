# Follow-ups

Revisit-when triggers that don't belong inline as TODOs. Each entry names the trigger condition, the work to do, and the files most likely to need editing.

## Weave layout-width guidance into patterns

**Trigger:** when `/styles/layout/` exists and documents recommended widths.

**What to do:** add prose to `/patterns/submit-information/` and `/patterns/check-answers/` explaining the width these flows should sit at and why. Cross-link to the layout style page.

**Files most likely affected:**

- `docs/src/pages/patterns/submit-information.astro`
- `docs/src/pages/patterns/check-answers.astro`
- the eventual `/styles/layout/` page

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

## Audit visual regression diff threshold

**Trigger:** when a doc-page change visibly alters the rendered output but `npx playwright test tests/visual` still passes without `--update-snapshots`.

**What to do:** during the PR review fixup, adding a second card to `/get-started/` was a measurable visible change (~10% more rendered pixels on the index) but did not exceed `maxDiffPixelRatio: 0.005`. Either the metric is dominated by background pixels (most of the page is unchanged whitespace), or the threshold is still too lax for small layout additions. Investigate whether to tighten further (0.001?) or pair the ratio with `maxDiffPixels` so small absolute diffs don't slip through on long pages.

**Files most likely affected:**

- `playwright.config.ts`
