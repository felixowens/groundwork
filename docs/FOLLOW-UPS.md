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
