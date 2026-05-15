# Groundwork architecture review — 2026-05-15

Findings from an architectural pass against the React component layer, token pipeline, docs site, and test setup. Aim: identify **deepening opportunities** — shallow modules that should become deep, repeated patterns that should become shared seams — to improve testability and AI-navigability.

## Vocabulary

- **Module** — anything with an interface and an implementation (function, class, file, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config.
- **Depth** — leverage at the interface. **Deep** = lots of behaviour behind a small interface. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place.
- **Leverage** — what callers get from depth. **Locality** — what maintainers get from depth.
- **Deletion test** — imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.

## Sources read

- `docs/INTENT.md` — why Groundwork exists
- `meta/artifacts/initial-chat/groundwork-handoff.md` — v0.2 decisions
- `CLAUDE.md` — current agent rules
- Codebase walk: `src/components/`, `src/form/`, `docs/src/`, `tests/`, `tokens/`

No `CONTEXT.md` or ADRs exist yet, so domain vocabulary is drawn from `INTENT.md` and the handoff (Field, Fieldset, hint, error, ARIA wiring, width hint, variant, primitive/semantic tokens).

---

## Findings

### 1. Collapse `RadioGroup` and `CheckboxGroup` into one fieldset-backed choice module

**Status:** Implemented 2026-05-15

**Files:**
- `src/components/RadioGroup.tsx:1–139`
- `src/components/CheckboxGroup.tsx:1–139`

**Problem.** These two files are ~95% byte-identical. Both define their own `optionId()` (lines 38–45 in each, character-for-character the same regex), their own `describedBy()` (lines 47–50, identical), their own hint/error ID derivation, their own fieldset+legend+hint+error shell, and their own option-rendering loop. The only real variance:

- `<input type="radio">` vs `<input type="checkbox">`
- `value: string` + `defaultValue: string` vs `values: readonly string[]` + `defaultValues: readonly string[]`
- "is option selected" predicate: `value === option.value` vs `values.includes(option.value)`
- Wrapper class (`gw-radios`/`gw-checkboxes`) and item class (`gw-radio-item`/`gw-checkbox-item`)

That's a tiny axis of variance. The current shape puts it at file granularity, so everything else gets duplicated alongside it. By the deletion test: deleting either file would not concentrate complexity, it would just relocate it; deleting the duplication would. Textbook shallow-pair — two large implementations behind one small conceptual interface ("a fieldset-backed group of choices").

**Solution sketch.** One module that owns "fieldset-backed choice list with hint + error + legend." The radio-vs-checkbox axis becomes the variance behind the seam, not the file boundary. Public surface stays as `<RadioGroup>` and `<CheckboxGroup>` (the handoff names them, and consumers should still get the type-safe `value: string` vs `values: string[]` distinction); internally they delegate to one implementation that takes the input semantics as configuration.

**Benefits.**
- **Locality.** Accessibility wiring and error formatting change in one place, not two.
- **Leverage.** Future variants (toggle-buttons, segmented controls, "yes/no" shortcuts) plug in instead of becoming the third copy.
- **Tests.** The fieldset ARIA contract is asserted against one implementation. The radio/checkbox cases in `tests/components/form-controls.spec.ts:44–97` become "fixture A and fixture B exercising the same module."

**Outcome.** Implemented 2026-05-15.

- **Shape:** Option A from grilling — one internal `<ChoiceGroup>` at `src/components/_internal/ChoiceGroup.tsx`, with `<RadioGroup>` and `<CheckboxGroup>` as ~25-line public wrappers. Public surface unchanged.
- **Internal interface:** Mode-discriminated union. `mode: 'single'` narrows `selected?: string` and `defaultSelected?: string`; `mode: 'multi'` narrows them to `readonly string[]`. The selection predicate lives entirely inside `<ChoiceGroup>`.
- **Wrappers:** Translate public `value`/`values` (and `defaultValue`/`defaultValues`) to the internal's `selected`/`defaultSelected`, plus pass `inputType`, `groupClass`, `itemClass`. The five-line "real variance" axis is finally encoded as data instead of code duplication.
- **Validates finding (2):** `<ChoiceGroup>` consumes `describeField` for the fieldset's ARIA wiring and hint/error nodes. With Field + ChoiceGroup both consuming the helper, "two adapters = real seam" is now satisfied.
- **Files:**
  - `src/components/_internal/ChoiceGroup.tsx` (new — establishes the `_internal/` convention for shared, non-public components)
  - `src/components/_internal/__tests__/choice-group.test.tsx` (new, 8 tests covering mode discrimination, controlled/uncontrolled, error state, option ID derivation, per-option hint wiring, disabled propagation)
  - `src/components/RadioGroup.tsx` (rewritten 139→56 lines)
  - `src/components/CheckboxGroup.tsx` (rewritten 139→56 lines)
- **Verification:** `npm run lint`, `npm run typecheck`, `npm run test:unit` (80 tests), `npm run test:components` (20 tests) all green. DOM output is byte-identical, so the existing `form-controls.spec.ts` Playwright tests pass unchanged.
- **Net line count:** 278 → 249 (29 fewer), but the bigger win is locality: option rendering, ARIA wiring, error state, and selection logic now live in one place.

---

### 2. Make Field actually own ARIA wiring — extract a deep "field ARIA" module

**Status:** Implemented 2026-05-15

**Files:**
- `src/components/Field.tsx:34–63`
- `src/components/RadioGroup.tsx:38–82`
- `src/components/CheckboxGroup.tsx:38–82`

**Problem.** The handoff and `INTENT.md` say Field is *the* place accessibility constraints live ("Field is the most important — it's where the accessibility constraints live"). The implementation tells a different story:

- `describedBy(hintId, errorId)` is defined verbatim in **three** files.
- The `hintId = ... ${id}-hint` / `errorId = ... ${id}-error` / `labelId = ${id}-label` derivation appears verbatim in **three** files.
- The "render hint span / render error message span" block (`Field.tsx:70–79`) is reimplemented in `RadioGroup.tsx:97–106` and `CheckboxGroup.tsx:97–106`.

Deletion test: removing `describedBy()` from any one file concentrates complexity in zero callers (it's only called once locally). But the *pattern* — "derive the IDs, compose `aria-describedby`, render the hint and error nodes" — is the actual interesting module, and it isn't a module. The interface to "ARIA wiring for a labelled field" is leaking out of Field into every consumer that wants Field-shaped behaviour with a different outer element.

**Solution sketch.** Pull "given an `id`, optional hint, optional error, produce: the IDs you need, the `aria-describedby` value, and the rendered hint/error nodes" into one deep helper. Field uses it. The choice module from (1) uses it. Future field-shaped components use it. Interface stays small (id + hint + error in; IDs + ARIA + nodes out); implementation owns ID conventions, the `formatFieldError` call, and the DOM shape of the error span.

**Benefits.**
- **Locality.** ARIA conventions sit in exactly one place. Today, an accessibility bug fix or copy change must be made in three.
- **Leverage.** New field-shaped components (date picker fieldset, file upload with hint/error) get the wiring by depending on the helper.
- **Tests.** A single unit test for ID derivation + `aria-describedby` composition replaces N integration assertions scattered across `form-controls.spec.ts`.

**Outcome.** Implemented 2026-05-15.

- **Name:** `describeField()` returning `FieldDescription`. Added to `CONTEXT.md` as the canonical term for the bundle.
- **Location:** `src/form/field-description.tsx` (sibling to `field-error.ts`; `.tsx` because the helper returns JSX nodes).
- **Release tag:** `@internal`. Not exported from `src/index.ts` — the helper is a shared internal seam, not a user-facing API. If demand for custom Field-shaped components emerges later, can be promoted to `@public`.
- **Depth:** Returns `labelId`, two ARIA bundles (`inputAriaProps`, `fieldsetAriaProps`), and pre-rendered `hintNode` / `errorNode`.
- **`labelProps` dropped during implementation:** the grilling choice to package `{ id, htmlFor, className }` for the `<label>` didn't survive biome's `noLabelWithoutControl` rule, which can't see `htmlFor` through a spread. Field writes `<label className="gw-label" htmlFor={id} id={labelId}>` explicitly — the helper exposes `labelId` only. The other three duplicated pieces (ID derivation, `aria-describedby` composition, hint/error JSX) are still collapsed.
- **Behaviour:** Composes `aria-describedby` as `hint error` order. `aria-invalid` only set when error present. `fieldsetAriaProps` omits `aria-labelledby` (legend serves implicitly).
- **Files:**
  - `src/form/field-description.tsx` (new)
  - `src/form/__tests__/field-description.test.tsx` (new, 9 tests)
  - `src/components/Field.tsx` (rewritten to consume `describeField`; render-prop API unchanged for `Input`/`Textarea`/`Select`)
  - `CONTEXT.md` (new, coins "Field description" and related terms)
- **Verification:** `npm run lint`, `npm run typecheck`, `npm run test:unit` (72 tests), `npm run test:components` (20 tests) all green. DOM output is byte-identical, so visual regression and a11y baselines hold.
- **Migration remaining:** `RadioGroup` and `CheckboxGroup` still hold their own copies of `describedBy()`, ID derivation, and hint/error JSX. They'll consume `describeField` as part of finding (1)'s Choice-group collapse, where the single fieldset-backed module wires it up once.

---

### 3. Lift the Field shell so `<fieldset>`-backed fields and `<div>`-backed fields share one outer container

**Status:** Rejected 2026-05-15 — recorded as ADR-0001

**Files:**
- `src/components/Field.tsx:65–82`
- `src/components/RadioGroup.tsx:85–106`
- `src/components/CheckboxGroup.tsx:85–106`

**Problem.** Field renders `<div class="gw-field"> + <label> + <hint> + <error> + children`. The two choice components render `<fieldset class="gw-field gw-fieldset"> + <legend> + <hint> + <error> + children`. The shells differ in two ways only: the wrapping element (`div` vs `fieldset`) and the label element (`<label>` vs `<legend>`). Everything else — the error-state class, hint span, error span, the focus-management `tabIndex` trick — is the same idea expressed twice. Field is shallower than it should be: it owns the pattern *for inputs with HTML labels* but cedes the pattern *for grouped controls* to a parallel implementation.

**Solution sketch.** Two shapes worth exploring during grilling:
- A polymorphic Field whose outer element can be `fieldset` (with `<legend>` instead of `<label>`).
- A `Fieldset` sibling that shares the same internals as Field — same shell helper, same ARIA helper from (2), different outer element.

Either way the seam moves: "labelled wrapper with hint + error + ARIA wiring" becomes one module; "what element wraps it and whether the label is a `<label>` or `<legend>`" becomes the variance behind the seam.

**Benefits.**
- **Locality.** Visual error state, hint placement, `tabIndex` focus rule, dark-mode handling — all one place.
- **Leverage.** Combined with (1) and (2), a new fieldset-backed component (address fieldset, date-parts trio) gets the full Field treatment for free.
- **Tests.** Visual regression for "field error state" stops being multi-snapshot. The accessibility contract test is one shape.

**Outcome.** Rejected 2026-05-15. Recorded as [`docs/adr/0001-no-shared-field-shell.md`](../../docs/adr/0001-no-shared-field-shell.md).

After findings (1) and (2) landed, the residual shell duplication shrank to: the error-state class ternary (`'gw-field [extra]?' + (hasError ? ' gw-field--error' : '')`), the `{hintNode}{errorNode}` JSX pair, and the rough shape of "labelled wrapper." Everything else is genuine structural variance:

- **Outer element:** `<div>` vs `<fieldset>` — different HTML semantics, different default styles, different attribute sets (no `ref` forwarding on the `<div>` form; the `<fieldset>` form spreads `...rest` for native fieldset attributes).
- **Label element:** `<label className="gw-label" htmlFor={id} id={labelId}>` vs `<legend className="gw-label">` — `<label>` needs `htmlFor` and `id` to wire to the control; `<legend>` is implicitly associated with its fieldset and needs neither.
- **Fieldset-only focus management:** `tabIndex={hasError ? -1 : rest.tabIndex}` for the error-jump behaviour used by ErrorSummary. Doesn't apply to `<div>`-backed Fields (the control inside owns focus directly).
- **Child contract:** Field uses a render prop (`children(field: FieldRenderProps)`) to hand the consumer `inputAriaProps` and `hasError`; ChoiceGroup renders its choices directly because it already has the inputs.

A shared `<FieldShell>` either grows wide signatures to accept all four axes (and obscures each caller's actual idiosyncrasies), or shares only `{hintNode}{errorNode}` — which is two JSX nodes, not a module. The deep ARIA seam is already `describeField`; the remaining shell is conventional CSS composition with two call sites.

The smaller "extract just `fieldClassName` into `describeField`" move was also considered and rejected: it would broaden `describeField`'s scope from "accessibility wiring" to "accessibility wiring + root-element styling," and the choice-group unit test pins the exact class string `'gw-field gw-fieldset gw-field--error'` (order-sensitive), so any extraction reshuffles either the test or the order. Not worth the churn.

ADR-0001 records this so a future architectural pass doesn't re-suggest extracting `<FieldShell>` without recognizing the structural variance. The ADR also names the trigger condition for revisiting: a third Field-shaped component that isn't a Choice group variant.

---

### 4. Auto-derive component nav from a single source — kill the manual `docs-registry.ts`

**Status:** Implemented 2026-05-15

**Files:**
- `docs/src/docs-registry.ts:15–66`
- `tests/docs-pages.ts:9–53`
- `docs/src/pages/components/*.astro` (11 pages)
- `docs/src/components/form-control-demos.tsx`

**Problem.** Two systems track the same fact — "which component pages exist." `tests/docs-pages.ts` walks the filesystem and discovers every `.astro` page (deep: one filesystem walk, N test cases). `docs/src/docs-registry.ts` hard-codes the same list as an array literal with hand-written `label` and `description` for each entry (shallow: every component must be remembered).

The handoff says the docs site uses content collections. The current implementation does *not* — it uses raw `.astro` files plus a parallel registry. So you have: the `.astro` file's `<h1>` (label #1), the registry's `label` (label #2), the route segment in the URL (label #3) — three sources for the same fact.

Deletion test on `docs-registry.ts`: deleting it concentrates complexity (the nav has to come from somewhere). The right place to concentrate it is "next to the page itself" — frontmatter in the `.astro`, or a content collection, or a manifest the page exports.

**Solution sketch.** One source per page for nav metadata. Probably an Astro content collection or page frontmatter for `label` + `description` + `order`, with `docsNavSections` derived the same way `docsPages` is derived in tests. The "add a date input means edit eight files" locality problem shrinks meaningfully once nav and routing fall out of the same source.

**Benefits.**
- **Locality.** A component's documentation metadata lives next to its documentation page.
- **Leverage.** New pages appear in nav automatically; impossible to ship a page that isn't navigable, or a nav entry that 404s.
- **Tests.** `tests/docs-registry.test.ts` can be replaced with the discovery shape from `docs-pages.ts`.

**Outcome.** Implemented 2026-05-15.

- **Approach:** Sidecar `.ts` meta files per component page, auto-derived via `import.meta.glob`.
- **Type:** `docs/src/component-meta.ts` — the shared `ComponentMeta = { label, description, order }`.
- **Data files:** `docs/src/pages/components/_meta/<slug>.ts` (10 files). Astro skips `_`-prefixed directories from routing, so the files sit next to their `.astro` page without becoming phantom API routes.
- **Why a subdirectory:** First attempt put `*.meta.ts` siblings next to the `.astro` files. Astro processed them as TypeScript API endpoints and emitted 10 warnings about missing GET handlers. Moving them into `_meta/` is the canonical Astro-friendly fix.
- **Registry:** `docs/src/docs-registry.ts` rewritten — `componentDocs` is now derived from `import.meta.glob('./pages/components/_meta/*.ts', { eager: true })`, sorted by `meta.order`. `docsNavSections` still hand-authored for the non-components sections (Start, Guides).
- **Page consumption:** Each `.astro` page imports its own meta and uses it for `<DocsLayout title={meta.label} description={meta.description}>`, replacing two hardcoded strings per page.
- **Content tweaks (visible):** Browser tab titles for three pages now match the human-readable nav label: `RadioGroup → Radio group`, `CheckboxGroup → Checkbox group`, `SummaryList → Summary list`. The per-page SEO description goes from generic ("Groundwork radio group component") to the usage-oriented description from the meta. No body content changes.
- **Files changed:**
  - `docs/src/component-meta.ts` (new — type)
  - `docs/src/pages/components/_meta/*.ts` (10 new — one per component)
  - `docs/src/pages/components/*.astro` (10 edited — import meta, use in DocsLayout)
  - `docs/src/docs-registry.ts` (rewritten — auto-derives `componentDocs`)
- **Verification:** `npm run lint`, `npm run typecheck`, `npm run test:unit` (80 tests including `docs-registry.test.ts`), `npm run test:components` (20 tests), `npm run test:a11y` (18 tests), `npm run docs:build` (zero warnings) all green.
- **What got better:** Adding a new component page is now: create the `.astro` file + create a `_meta/<slug>.ts`. The registry, nav, and components-index all update automatically. The two hardcoded strings per `.astro` (browser title + SEO description) and the manual registry entry collapse into one source of truth per component.

---

### 5. Parameterize the Field-ARIA contract test instead of writing it N times

**Status:** Implemented 2026-05-15

**Files:**
- `tests/components/form-controls.spec.ts:3–97`

**Problem.** The same contract is asserted by hand for each input variant: get the control by role, assert `gw-X` class, assert `aria-labelledby=${id}-label`, assert `aria-describedby=${id}-hint`, sometimes assert error wiring. Each block is structurally identical. This is the "interface is the test surface" principle inverted — the interface to "Field-wired control" is one thing, but tests treat it as N things.

Worth flagging: this is a consequence of (2). If the ARIA wiring is a deep module, then `form-controls.spec.ts` is its caller, and a contract test belongs at the module's seam. Currently the contract sprawls across the integration surface because the seam doesn't exist there.

**Solution sketch.** A test factory that takes `{ pageUrl, role, accessibleName, expectedId, expectsHint, expectsError, expectedWidthClass? }` and produces the per-control test cases. Adding a date input means appending one config object, not copying 13 lines.

**Benefits.** Adding a new field-wired component becomes a one-line test addition. The shared contract is asserted by the factory; component-specific behaviour (selecting an option, filling a textarea) stays in bespoke tests where it belongs.

**Outcome.** Implemented 2026-05-15.

- **Helper:** `tests/field-aria-contract.ts` exports `testFieldAriaContract(name, config)`. Config is a discriminated union: `shape: 'single-control'` (for `<Field>` + Input/Select/Textarea) and `shape: 'fieldset'` (for Choice groups). Sibling to `tests/docs-pages.ts`, matching the existing top-level-helper convention.
- **Scope of the contract.** What the factory asserts mirrors what `describeField()` guarantees:
  - **Single-control:** the control has the expected `gw-X` class; `aria-labelledby = ${id}-label`; `aria-describedby` is composed from `${id}-hint` and/or `${id}-error` in that order; `aria-invalid="true"` is set when an error is expected; the error element contains the expected text.
  - **Fieldset:** the fieldset has `gw-fieldset`; `aria-describedby` is composed the same way; when an error is expected, `gw-field--error` is set, `aria-invalid="true"` is set, and the error text matches.
  - The `aria-describedby` composer is the test-side mirror of the helper inside `describeField()`. If the helper drifts, the factory's expectation drifts — both points are now single seams.
- **What stayed bespoke** (one test each, only the component-specific bits):
  - Input — width classes (`gw-input--w20`, `gw-input--w10`) and `autocomplete`
  - Select — default option text and selection behaviour
  - Textarea — `rows` attribute and `fill()` round-trip
  - RadioGroup — option-level selection, keyboard navigation (`ArrowDown`), disabled state, per-option `aria-describedby`
  - CheckboxGroup — option toggling, `Space` to uncheck, per-option `aria-describedby`
  - Plus the unchanged controlled-values test against the test fixture page
- **Test count:** the spec file went from 6 tests to 12 (6 contract calls + 6 bespoke tests including the controlled-values one). Granularity is finer — failures now pinpoint either "ARIA contract" or "component behaviour" without ambiguity. Total components project: 20 → 26 tests, all green.
- **Adding a new field-wired component** (e.g. a date input): append one config object (~9 lines) to call `testFieldAriaContract` and write a bespoke test only for the component-specific behaviour. The previously copy-pasted 4–7 ARIA assertion block is gone.
- **Files:**
  - `tests/field-aria-contract.ts` (new, 75 lines including types)
  - `tests/components/form-controls.spec.ts` (rewritten, 118 → 144 lines but each block is tighter and the duplicated ARIA assertion shape no longer exists)
- **Verification:** `npm run lint`, `npm run typecheck`, `npm run test:unit` (80 tests), `npm run test:components` (26 tests, up from 20), `npm run test:a11y` (18 tests) all green.
- **Reporting wrinkle:** Playwright reports the source location of each contract test as `tests/field-aria-contract.ts:3:3` (the inner `test()` call site), not the spec file. Test names are unique enough to disambiguate. Acceptable trade-off vs. a more elaborate "yield config, iterate in spec" pattern that would push the line back to the spec file.

---

### 6. Variant→class composition as a small utility (lowest-stakes; borderline)

**Status:** Open

**Files:**
- `src/components/Button.tsx:23–36`
- `src/components/Banner.tsx:34–47`
- `src/components/Input.tsx:25–42` (width, not variant — same shape)

**Problem.** Three components each define a private `XClassName(variant)` switch that does the same thing: return the base class, append `gw-X--<variant>` for non-default variants. With `assertNever` exhaustiveness it's safe, but the shape is duplicated.

Deletion test: deleting any individual switch helper just moves the switch into JSX. The duplication isn't of code that calls a helper — it's of the *shape* of three sibling helpers. Weaker than the Field/Choice duplication and may not be worth refactoring on its own.

**Solution sketch.** Either a `bemModifier(base, modifier, default)` helper, or a typed record mapping `Variant → modifier class`. Each component's helper becomes one line.

**Benefits.** Modest. Small absolute saving per component. Only worth doing if you anticipate more variant-bearing components, or want to encode "default variant gets no modifier" once.

**Recommendation.** Skip in isolation. Bundle with (1)–(3) if that work happens — by then `src/components/_internal/` (or similar) for shared helpers exists and the marginal cost is near zero.

**Outcome.** _(grilling pending)_

---

## How they relate

(1), (2), and (3) form one coherent move: today, Field is shallow (it cedes ARIA and shell rendering to its would-be consumers), and RadioGroup/CheckboxGroup are a redundant pair carrying duplicated wiring. Doing them together turns "Field is the most important component" from a claim in the handoff into a load-bearing structural fact in the codebase.

(4) and (5) are independent and could happen any time. (6) is small and best bundled.

## Next

Working through these candidate-by-candidate via the grilling loop. Update each finding's **Outcome** as decisions land. When a rejection has a load-bearing reason that a future explorer would need, record it as an ADR under `docs/adr/`.
