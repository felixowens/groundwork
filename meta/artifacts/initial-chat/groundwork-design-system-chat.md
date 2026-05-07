> From: <https://claude.ai/chat/b8e67f2a-54a9-41d1-a464-82955d53f9bd>

# you asked

message time: 2026-05-07 17:56:56

What's good about the GOV.UK design system?

---

# claude response

The GOV.UK Design System is widely regarded as one of the best public design systems out there. Here's what makes it stand out:

**Clarity and accessibility first.** Everything is built around the principle that government services must work for everyone, including people with low digital literacy, disabilities, or older devices. This forces a level of rigour that most commercial design systems skip. Components are tested with real users across a huge range of contexts.

**Opinionated simplicity.** It's deliberately minimal — no flashy animations, no decorative elements. Every component earns its place by solving a real, documented user need. The typography (GDS Transport), spacing scale, and colour palette are all chosen for maximum readability rather than aesthetics.

**Patterns over components.** Beyond the usual button/input library, it includes whole interaction patterns like "check answers before submitting," "ask users for dates," or "help users recover from validation errors." These encode years of usability research into reusable solutions.

**Content design as a first-class concern.** The system doesn't just tell you what a component looks like — it tells you what words to use, how to phrase error messages, when to use (or avoid) certain patterns. The writing guidance is arguably as valuable as the code.

**Progressive enhancement.** Everything works without JavaScript. The components are built in layers — semantic HTML first, then CSS, then JS for enhancement. This means services stay usable even on flaky connections or older browsers.

**Battle-tested at scale.** It's used across hundreds of government services handling millions of transactions. Edge cases that most design systems never encounter have been found and solved.

**Open and well-documented.** The contribution model, the decision records explaining *why* things are the way they are, and the community backlog are all public. You can trace the reasoning behind almost any design choice.

**Research-backed defaults.** Decisions like "one thing per page," specific input widths hinting at expected answer length, and the distinctive green action button all come from extensive A/B testing and user research rather than designer preference.

It's a great reference point even if you're not building government services — the discipline of designing for the widest possible audience tends to produce better outcomes for everyone.

---

# you asked

message time: 2026-05-07 18:01:33

Exactly. If you could design a similar opinionated and robust design system with these traits for use in new projects. What would you do?

---

# claude response

A few come to mind that share that same ethos of being research-driven, accessible, and publicly documented:

**US Web Design System (USWDS)** — the American equivalent. Very thorough accessibility standards, strong typography and spacing tokens, and good pattern guidance. It's a bit more visually flexible than GOV.UK since US federal agencies have more varied branding needs.

**Canada's Aurora / GC Design System** — follows a similar philosophy to GOV.UK. Bilingual by default (English/French), which adds an interesting constraint that shapes the component design.

**Australian Government Design System (GOLD)** — another government system heavily influenced by GOV.UK. Good component library with accessibility baked in.

**NHS Design System** — worth a separate mention even though it's UK government-adjacent. It adapted the GOV.UK approach for healthcare contexts, where the stakes around clarity and accessibility are even higher. The content guidelines are excellent.

**Italian Design System (Designers Italia)** — less well-known internationally but quite mature. Built on Bootstrap Italia with strong accessibility foundations.

Beyond government, a few open-source systems share the "opinionated, accessible, well-documented" quality:

**Primer (GitHub)** — very well-documented with clear rationale behind decisions. Strong accessibility standards and a good example of a design system that scales across a complex product.

**Carbon (IBM)** — comprehensive, heavily accessibility-focused, with good pattern guidance alongside components. The data visualisation guidelines are particularly strong.

**Pajamas (GitLab)** — fully open since GitLab is open-core. Good documentation of design decisions and a mature contribution model.

The government ones tend to be the most interesting though, because the constraint of "must work for literally everyone" produces a level of rigour that even well-resourced commercial systems rarely match. If you're after that GOV.UK-style discipline, USWDS and the NHS system are probably the closest in spirit.

---

# claude response

Great question. Let me think about this properly rather than just listing technologies.

The core insight from GOV.UK is that constraints produce better outcomes. So the goal isn't "a component library" — it's an opinionated system that makes the right thing easy and the wrong thing hard.

Here's how I'd approach it:

**Foundation: Design tokens, not variables.** A small, closed set of spacing (4px base scale), typography (one sans-serif, one mono, limited size steps), and colour tokens. No arbitrary values — if it's not in the token set, you can't use it without consciously breaking out. This is the single biggest lever for visual consistency.

**Colour with purpose.** A neutral-heavy palette with colour reserved for meaning: one action colour, one destructive colour, a muted palette for status/feedback states. No decorative colour. Dark mode as a first-class token layer rather than an afterthought.

**Typography as hierarchy, not decoration.** Maybe four or five font sizes total. Heading levels map to semantic function, not visual preference. Line lengths capped at ~66 characters because that's what the research says is readable. Prose-optimised line-height.

**Progressive enhancement as architecture.** Server-rendered HTML that works without JS. CSS that works without custom properties (fallbacks baked in). JS that enhances but never gates functionality. This isn't ideology — it's resilience engineering.

**One thing per page as the default pattern.** Multi-step flows broken into focused steps. This forces you to think about information architecture rather than cramming everything into a dashboard. You can break the rule, but you have to justify it.

**Content patterns baked in, not bolted on.** Error messages with a consistent structure (what went wrong, how to fix it). Microcopy guidance for every interactive component. A tone guide that's three paragraphs, not thirty pages.

**Accessibility as a constraint, not a checklist.** WCAG 2.2 AA as the floor. Components that are impossible to use without proper labelling — the API should refuse to render an input without an associated label rather than silently producing inaccessible markup.

**Form patterns as the killer feature.** Most apps are forms. Validation, error summary, conditional reveal, address lookup, date input, file upload — these patterns, done well and consistently, eliminate 70% of the UX decisions teams waste time on.

**Minimal component surface area.** Resist the urge to cover every case. Button, input, select, radios, checkboxes, textarea, table, tabs, accordion, summary list, notification banner, tag, breadcrumb, pagination. That's probably enough for most applications. Each component has one way to use it, not five variants.

**Documentation as product.** Every component page has: when to use it, when not to use it, the research behind it, known limitations, and accessibility notes. If you can't write that page, the component isn't ready.

For implementation, I'd lean toward framework-agnostic HTML/CSS with optional framework wrappers — similar to how GOV.UK Frontend works. The source of truth is the semantic markup and the token system, not a React component tree.

The hardest part isn't building it — it's maintaining the discipline to say no. GOV.UK's real strength is all the things it deliberately doesn't include. Every component you add is a maintenance burden and a decision you're making on behalf of every team that adopts the system.

Want me to actually build a starter implementation of this? I could put together a working prototype with the token system, core components, and documentation structure.

---

# you asked

message time: 2026-05-07 18:03:14

Yes. Show me how you'd implement a solid foundation lib for web apps that makes it extremely easy to maintain and hard to use incorrectly

---

# claude response

Let me start by reading the frontend design skill to make sure I'm following the right patterns.

Now let me build this. I'll create a comprehensive design system showcase that demonstrates the token system, core components, patterns, and documentation — all in one artifact.

Here's **Groundwork** — the full foundation in a single CSS file with zero dependencies.

The key design decisions that make it hard to misuse:

**Closed token set.** Twelve spacing values, seven text sizes, two font families, semantic-only colours. There's no `padding: 13px` escape hatch — if it's not a token, it doesn't exist. This alone eliminates most visual inconsistency across teams.

**Forms that look broken without labels.** The `.gw-field` wrapper pattern means an orphaned `<input>` without a `.gw-label` is visually incomplete. You *can* skip the label, but it'll be obvious something's wrong. Accessibility by social pressure rather than linting.

**Input width hints.** `.gw-input--w5`, `--w10`, `--w20`, `--w30` — the width tells the user how much they're expected to type. A postcode field is narrow. An email field is wide. This is lifted straight from GOV.UK because it works.

**Error messages with structure.** The error summary at page top links to each broken field. Individual field errors describe what's wrong *and how to fix it*. The pattern makes "Invalid input" feel obviously lazy.

**Colour never carries meaning alone.** Every banner has a title. Every tag has text. Error states use border changes alongside colour. This is WCAG compliance baked into the component API rather than checked after the fact.

**Four layout primitives.** Stack (vertical rhythm), cluster (horizontal wrap), prose (measure-capped text), grid (auto-responsive). These compose to handle essentially every layout without breakpoints or a grid framework.

**Dark mode at the token layer.** A single `prefers-color-scheme` block swaps the tokens. Every component inherits automatically. No per-component dark mode logic.

The whole thing is ~600 lines of CSS. Drop it into any project — plain HTML, SvelteKit, Astro, whatever. The source of truth is the markup and tokens, not a framework binding.

---

# you asked

message time: 2026-05-07 18:30:32

What's the best theory on tokenisation and how to tokenise a design system

---

# claude response

Cheers. It's one of those things where the theory is deceptively simple — "just use a fixed set of values" — but the discipline of actually enforcing it is where most teams fall down.

The bit that makes it work in practice is the closed-ness. Most design systems give you tokens *and* let you use arbitrary values alongside them, which means the tokens become suggestions rather than constraints. Six months later you've got 47 shades of grey and spacing values that differ by 1px between components because someone eyeballed it.

The GOV.UK insight is that removing options is the feature. You don't need 20 spacing values — you need 12 that cover every case, and the social agreement that if your layout doesn't work with those 12, the layout is wrong, not the scale.

If you wanted to take this further for your own projects, the natural next steps would be extracting the tokens into a format that can generate CSS, Tailwind config, and Figma tokens from a single source (something like Style Dictionary), and then building the enforcement layer — a linter that flags non-token values in CSS/Tailwind classes the same way a type system flags invalid types. That's where it goes from "good practice" to "structurally impossible to drift."

---

# claude response

Good question. Let me think about this from first principles rather than just regurgitating the common wisdom.

The core tension in design token theory is between **expressiveness** (can I build what I need?) and **constraint** (can I prevent visual drift?). Every tokenisation approach is a bet on where to sit on that spectrum.

**The three-tier model is the dominant theory, and it's mostly right.**

The idea, popularised by Salesforce's Lightning system and later refined by people like Nathan Curtis, is that tokens exist in three layers:

**Global tokens** (or "primitive" / "reference" tokens) — the raw palette. Every possible value in your system lives here. `blue-500`, `space-4`, `font-size-16`. These are the atoms. You almost never reference these directly in component CSS.

**Semantic tokens** (or "alias" / "decision" tokens) — the meaning layer. `color-action`, `color-surface`, `space-inline-md`, `text-body`. These map intent to a global token. This is where your dark mode swap happens — `color-surface` points to `white` in light mode and `#161616` in dark. Components reference *these*.

**Component tokens** — scoped overrides. `button-padding-x`, `input-border-color`. These reference semantic tokens by default but can be overridden per-component without blowing up the whole system. Most systems either skip this layer entirely or use it sparingly.

The reason this model wins is that it cleanly separates *what values exist* from *what values mean* from *how specific components use them*. You can re-theme at the semantic layer without touching components. You can tweak a single component without introducing a new global value.

**Where the theory breaks down in practice.**

The three-tier model is clean on a whiteboard but gets messy fast. The main failure modes:

**Token explosion.** If you're rigorous about the layering, a single button might reference `button-bg → color-action → blue-600`. Multiply that by every property of every component in every state (hover, focus, disabled, error) and you can end up with thousands of tokens. The system becomes harder to understand than raw CSS.

**The naming problem.** Semantic names are opinions. Is it `color-action` or `color-primary` or `color-interactive`? Is your spacing `sm/md/lg` or `tight/normal/loose` or `2/4/6`? Every naming scheme leaks an assumption about how people will think about the system. T-shirt sizes (`sm/md/lg`) feel intuitive but run out of room — what's smaller than `xs`? Numeric scales (`space-1` through `space-12`) are extensible but less meaningful.

**False abstraction.** Not everything benefits from being a token. If your `border-radius` is `4px` everywhere and you'll never change it, wrapping it in `--radius-default` adds indirection without value. The theory says "tokenise everything," but pragmatism says "tokenise the things that actually vary."

**The approach I think is strongest.**

Two tiers, not three. Global primitives + semantic decisions. Skip component tokens unless you're building a multi-brand system.

For a design system like the Groundwork one we built, here's how I'd structure it:

**Start from the semantic layer and work backwards.** Don't begin by defining every shade of blue — begin by asking "what decisions does a component author need to make?" They need a surface colour, a text colour, an action colour, a border, spacing, and type sizes. Define those semantic tokens first. *Then* populate the primitives underneath.

**Keep the global palette private.** The primitive tokens exist for the system maintainers, not the consumers. Component authors should never write `var(--blue-600)` — they write `var(--color-action)`. If your tooling doesn't enforce this, your naming should. Prefix primitives with an underscore or put them in a separate file that isn't documented publicly.

**Use a closed scale for spacing.** This is the single highest-leverage decision. A 4px base with a limited set of steps (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80) covers every layout case I've encountered. The key insight: **gaps in the scale are a feature, not a bug.** If there's no `28px` option, people can't bikeshed between `24px` and `28px`. They pick 24 or 32 and move on.

**Type scales should be semantic, not numeric.** `--text-body`, `--text-caption`, `--text-heading-s` communicates intent. `--text-16` communicates a pixel value and invites people to argue about whether their use case deserves a 17. The semantic name makes it clear that the *purpose* determines the size, not the other way around.

**Colour needs the hardest constraint.** The strongest rule I know: **colour always means something.** No decorative colour tokens. You get surface colours (background), ink colours (text), border colours, and a small set of semantic colours (action, destructive, success, warning, error, focus). If someone wants to make a section purple "for branding," that has to go through the token system as a new semantic decision, not an ad-hoc hex value.

**For dark mode / theming, swap at one layer only.** The semantic layer. `--color-surface` changes from `#fff` to `#161616`. Every component inherits. If you find yourself writing `@media (prefers-color-scheme: dark)` inside a component, you've broken the architecture.

**The practical test for whether a token is correct:**

Can you rename the value it points to without changing the token name? `--color-action: var(--blue-600)` passes — you can later point it at `--green-500` and the name still makes sense. `--blue-primary: var(--blue-600)` fails — if you change the brand colour to green, the token name is a lie.

Can someone unfamiliar with the system guess which token to use? If a dev has to open the token file and search through 200 entries, the naming isn't working. The system should be small enough to hold in your head.

Is there exactly one token for this decision? If there are three tokens that could plausibly apply to "the background of an interactive element on hover," you have too many tokens. Ambiguity is the enemy.

This is one of those areas where the right answer is less than you'd expect. A well-designed system of 40-60 tokens will outperform a comprehensive system of 400, because the smaller one is learnable and the larger one requires documentation that nobody reads.

---

# you asked

message time: 2026-05-07 18:32:27

Agreed. Do you think the system you designed holds up there?

---

# claude response

Honestly, it's close but not quite right. Let me be critical.

**What holds up well:**

The spacing scale is genuinely closed and small. Twelve values, 4px base, no escape hatch. That's the right call.

Colour is semantic-only — there's no `--blue-600` in the public API. You get `--action`, `--destructive`, `--success`, etc. The "colour means something" rule is enforced by the token set itself.

Typography is purpose-named (`--text-base`, `--text-lg`) rather than pixel-named. Passes the rename test — I could change `--text-base` from 16px to 18px without the name becoming a lie.

**Where it breaks its own rules:**

The biggest issue: **I skipped the primitive layer entirely.** The semantic tokens point directly at hardcoded hex values. That means if you want to re-theme (different brand, different palette), you're editing every semantic token individually rather than swapping which primitives they reference. For a single-brand project this is fine — it's pragmatic. But the system *claims* to be a foundation library, which implies reuse across projects. There's a contradiction there.

The dark mode block is a concrete example of the cost. I'm manually redeclaring every colour token with new hex values. If there were a primitive layer, dark mode would be remapping semantic tokens to different primitive slots, which is cleaner and less error-prone.

**The second problem: some tokens fail the "one token per decision" test.** `--ink-muted` and `--ink-faint` — when does a component author pick muted vs faint? The distinction is real (secondary text vs tertiary/disabled text), but the naming doesn't communicate the decision. Something like `--ink-secondary` and `--ink-tertiary`, or `--ink-subtle` and `--ink-disabled`, would map to use cases rather than visual descriptions.

**Third: the surface tokens are underspecified.** There's `--surface`, `--surface-raised`, and `--surface-sunken`. But what about the surface of a component that sits *on* a raised surface? Nesting isn't handled. GOV.UK sidesteps this by being very flat visually, but a general-purpose system should have an answer for card-on-card or panel-in-panel stacking.

**Fourth: I've got some inconsistency in what's tokenised.** Border widths are hardcoded (`2px` on inputs, `1px` on cards, `3px` on error summary, `4px` on banner left borders). These are design decisions that should be tokens — `--border-width-thin`, `--border-width-thick` maybe. Same with the focus ring: `3px solid` and `2px offset` are magic numbers buried in the CSS.

**What I'd change in v0.2:**

Add a private primitive layer — a small palette of neutrals (8-10 steps) and a single brand hue (5-6 steps) plus the semantic colours. Keep these in a separate block clearly marked as internal. Semantic tokens reference these. Dark mode swaps the mapping.

Rename `--ink-muted` / `--ink-faint` to something decision-oriented.

Tokenise border widths and the focus ring parameters.

Add a `--surface-overlay` token for nested elevation contexts.

But — and this is the important nuance — I wouldn't add component tokens yet. That layer only earns its complexity when you have multiple teams consuming the system and needing per-component overrides. For a foundation library that one or two devs are using, two tiers is the right call. You can always add the third layer later without breaking the existing API.

The system is maybe 80% right. The structural decisions (closed scales, semantic colour, purpose-named typography, layout primitives) are solid. The token architecture needs one more pass to properly separate primitives from semantics, and a few naming decisions need tightening. Not bad for a v0.1, but I wouldn't ship it to other teams without fixing the primitive layer gap.

---

# you asked

message time: 2026-05-07 18:35:54

ok. can you fix it then?

---

# claude response

Let me rebuild it properly with the fixes we discussed.

Good, I've got the full picture. Now let me rebuild the token architecture properly — adding the primitive layer, fixing the naming issues, tokenising border widths and focus ring, and adding the overlay surface token. I'll rewrite the whole file since the changes cascade through everything.

Here's v0.2. The key fixes:

**Proper two-tier architecture.** Primitives are now explicit (`--_gw-neutral-0` through `--_gw-neutral-950`, brand blues, status reds/greens/ambers) and semantic tokens reference them via `var()`. The dark mode block no longer redeclares hex values — it remaps semantic tokens to different primitive slots. Want to re-theme? Override the `--_gw-blue-*` primitives and every button, link, tab, and focus state updates automatically.

**Naming fixes.** `--ink-muted` → `--ink-secondary` (role: supporting text), `--ink-faint` → `--ink-disabled` (role: inactive elements). No ambiguity about which to pick. Typography tokens now use purpose names: `--text-body`, `--text-heading`, `--text-caption` instead of `--text-base`, `--text-xl`, `--text-xs`.

**Tokenised border widths.** No more magic `2px` and `4px` scattered through components. Four tokens: `--border-width-thin` (1px, dividers), `--border-width-medium` (2px, inputs), `--border-width-thick` (3px, error summary/focus), `--border-width-heavy` (4px, banner accents). Every `border` declaration in every component now references these.

**Tokenised focus ring.** `--focus-ring-color`, `--focus-ring-width`, `--focus-ring-offset` — all components reference these consistently. The global `:focus-visible` rule and per-component overrides (inputs with `offset: 0`) all pull from the same tokens.

**`--surface-overlay` for nested elevation.** Cards nested inside raised surfaces automatically get this background via `.gw-card .gw-card` and `.gw-surface-raised .gw-card`. The card-on-card problem is solved without manual overrides.

The docs include the full architecture diagram, a token reference with "maps to" and "when to use" columns, and a changelog showing what broke from v0.1.

---

# you asked

message time: 2026-05-07 20:55:41

Cool. I'm going to flesh out Groundwork into a proper design system and create a repo. Any recommendations on stack?

---

# claude response

This is a fun one. The best design system names tend to share a few traits: they're short, they imply structure or foundation without being generic, and they're memorable enough to become internal vocabulary ("just use the X component").

Some directions worth considering:

**Foundation/building metaphors** — these work because design systems literally are foundations. Groundwork (what we've been building), Bedrock, Substrate, Scaffold, Formwork (the moulds you pour concrete into — temporary structure that shapes the permanent thing). Keystone is nice too — the piece that holds the arch together.

**Material/craft metaphors** — Grain (implies texture, natural structure), Loom (weaving threads into fabric), Kiln (where raw material becomes something durable), Anvil (where things get shaped), Lathe.

**Navigation/wayfinding** — Compass, Meridian, Bearing, Ordnance (as in Ordnance Survey — very on-brand for a UK-built system). Baseline works here too, though it's overused.

**Understated/quiet names** — sometimes the best name is just a good word. Tidy, Plain, Steady, Matter, Given. These signal the system's philosophy through the name itself — no flash, just reliable.

**Nature/geology** — Basalt, Slate, Flint, Chalk, Strata (layers, which maps nicely to token architecture). Granite implies durability. Gneiss if you want a geology pun.

**Musical/rhythmic** — Cadence (implies rhythm and consistency), Tempo, Measure (we literally use `--measure` as a token already).

Names I'd avoid: anything with "UI" or "Kit" in it (too generic, sounds like a npm package from 2017), anything that sounds like a startup (Synth, Flux, Nova), and anything that requires explanation ("why is it called Parallax?").

For something in the spirit of what we built — opinionated, GOV.UK-influenced, constraint-driven — I'd lean toward names that sound solid and unpretentious. **Formwork**, **Ordnance**, **Strata**, **Flint**, or **Measure** would all fit the philosophy well. Formwork is my favourite of those — it's the structure that shapes the thing, then gets removed once the thing can stand on its own. That's exactly what a good design system does.

---

# claude response

Given your existing stack preferences, here's what I'd go with:

**Core CSS stays as-is.** Plain CSS custom properties, no preprocessor. The whole point is zero build step for consumers. Anyone can drop in `groundwork.css` and go. Don't introduce Sass or PostCSS unless you hit a concrete pain point — you haven't yet, and the indirection isn't free.

**Documentation site: Astro.** It's the natural fit here. Static by default, islands where you need interactivity, and you can write docs in MDX with live component demos. It'll feel familiar coming from SvelteKit but with less overhead for what's essentially a content site. You could use SvelteKit, but Astro's content collections are purpose-built for this kind of structured documentation (component pages with frontmatter for status, version, usage guidelines).

**Component demos: vanilla HTML.** Resist the urge to build React/Svelte wrappers yet. The design system's source of truth is semantic HTML + CSS classes. Demos should be literal HTML snippets that readers can copy. If you build wrappers later, they're a separate package that imports the CSS — not the other way around.

**Token management: Style Dictionary.** This is the one build tool worth adding. Define your primitives and semantic tokens as JSON/YAML, and Style Dictionary generates the CSS custom properties, plus TypeScript types if you want them, plus any future format (Figma tokens, iOS, Android). It enforces the two-tier architecture structurally — primitives and semantics live in separate source files, and the build step resolves the references. It also gives you a single source of truth that isn't a CSS file.

**Testing: consider two things.** First, visual regression with Playwright — screenshot every component demo page and diff on PR. This catches "I changed a token and broke something I didn't expect." Second, an accessibility linter in CI. `axe-core` via Playwright is straightforward. Run it against every demo page. If a component can't pass automated a11y checks in its demo, it shouldn't ship.

**Repo structure** — something like:

```
groundwork/
  tokens/
    primitives.json      ← raw palette, scales
    semantic.json         ← decisions, references primitives
  css/
    groundwork.css        ← generated by Style Dictionary
  docs/
    src/
      content/components/ ← MDX per component
      content/tokens/     ← MDX per token category
  tests/
    visual/              ← Playwright screenshots
    a11y/                ← axe-core runs
```

**What I'd skip for now.** Figma integration — it's a time sink and you don't have a design team consuming tokens from Figma. Framework wrappers (React, Svelte, Web Components) — add them when someone asks, not before. A design token API or theming runtime — CSS custom properties already give you runtime theming for free. npm publishing — get the system right first, publish when you've used it in at least two of your own projects.

**What I'd prioritise.** Get the token JSON → CSS pipeline working via Style Dictionary. Stand up the Astro docs site with even five component pages. Add Playwright visual regression on those pages. That's your foundation — everything else layers on top. Host the docs on your Forgejo instance or a cheap static host, and you've got a living reference you can point at from any project.

The one opinion I'd push hard: **use this in a real project immediately.** Design systems that develop in isolation from real usage accumulate bad decisions. Pick one of your side projects — the media catalogue or the browser activity recorder — and build the UI with Groundwork. The friction you hit will tell you what's actually missing versus what's theoretically missing.

---

# you asked

message time: 2026-05-07 21:03:48

How do I make it reusable? I aim to keep it opinionated so maybe this goes against that but is it worth going to a framework like React (since that's what I use for 99% of projects) or making it more generic and using web components or something

---

# claude response

This is a good tension to sit with. Let me work through the tradeoffs honestly rather than just picking one.

**The core question is: who's the consumer?**

If it's you and your projects — and it sounds like it is for now — then the answer is straightforward. You use React. Build React components. Don't over-engineer for hypothetical consumers who don't exist yet.

The GOV.UK approach (framework-agnostic HTML + CSS + progressive JS) makes sense when you're serving hundreds of teams across government who use everything from Rails to React to static HTML. You're one person. The abstraction tax of maintaining a generic layer *plus* framework bindings isn't worth paying when you know the framework.

**So: React components, but with a specific architecture.**

Keep the CSS tokens and the raw CSS as the foundation layer. Then build React components that are thin wrappers enforcing the patterns. The value isn't in the JSX — it's in the API design that makes misuse hard.

For example, your `Input` component shouldn't just render an `<input>`. It should *require* a label:

```tsx
// This is the entire value proposition of the React layer.
// You literally cannot render an input without a label.

<Field label="Email address" hint="We'll send your receipt here">
  <Input name="email" width="w30" />
</Field>

// Not this:
<input className="gw-input" />  // no label, no guard
```

The React layer's job is to make the rules from the documentation into compile-time (or at least runtime) constraints. Required label props. Error messages that demand both a description and a fix. Button variants via a `variant` prop rather than className concatenation where you might typo `gw-button--secndary`.

**Why not Web Components?**

The theory is appealing — write once, use everywhere. The practice is rough. Shadow DOM makes theming with CSS custom properties work *okay* but creates friction with things like form participation, SSR, and global styles bleeding. Slotting is clunky compared to React's composition model. The DX is noticeably worse — no JSX, no TypeScript prop validation without extra tooling, no ecosystem of dev tools.

The people who benefit from Web Components are building design systems for organisations with mixed frameworks. You're not in that situation. If you ever need a Svelte or vanilla HTML consumer, you can always add a thin wrapper layer later — the CSS tokens work regardless.

**What I'd actually build:**

A single package. CSS tokens + React components. Something like:

```
@groundwork/ui
  tokens/           ← Style Dictionary source
  css/
    groundwork.css  ← generated, importable standalone
  src/
    components/
      Field.tsx     ← the workhorse, wraps label + hint + error
      Input.tsx
      Button.tsx
      ...
    tokens.ts       ← exported token values for JS use (spacing, etc.)
    index.ts        ← barrel export
```

Consumers do `import { Field, Input, Button } from '@groundwork/ui'` and `import '@groundwork/ui/css/groundwork.css'`. If someone wants just the CSS without React, they can import the stylesheet alone.

**The key design decisions for the React layer:**

Make `Field` the primary API, not individual inputs. Every form element goes through `Field` which handles label rendering, hint text, error state, and `aria-describedby` wiring. This is where you encode the "every input needs a label" rule as a TypeScript constraint rather than a social contract.

Use TypeScript strictly. `variant: 'primary' | 'secondary' | 'destructive' | 'ghost'` — not `className` strings. `width: 'w5' | 'w10' | 'w20' | 'w30'` — not arbitrary values. The token system's closed scale should be reflected in the type system.

Keep components uncontrolled by default with a controlled escape hatch. Don't fight the platform. `<Input>` should just be a styled `<input>` that forwards refs and spreads remaining props. The value is in the wrapper patterns (Field, ErrorSummary, FormSection), not in reimplementing form state.

No component-level CSS-in-JS. Import the CSS file. Components use the class names. This keeps the CSS extractable for anyone who wants it without React, and avoids the runtime cost and complexity of styled-components or Emotion.

**What "opinionated" means in this context** is that the component API only exposes the decisions the system supports. There's no `style` prop passthrough. There's no `className` override. If the system doesn't have a token for it, the component doesn't support it. People (including future you) can always drop down to the raw CSS classes if they need to break out, but the React layer should make the happy path the only obvious path.

This stays opinionated *and* reusable. The opinions are just enforced by TypeScript instead of documentation.

---

# you asked

message time: 2026-05-07 21:08:58

Agreed. I'm going to start this project off with claude code. Can you give me a handoff? Assume I'll pass this whole chat as an artefact so they can get up to speed.

---

# claude response

Here's a comprehensive handoff document.

I'll create a clean markdown handoff document.

Two files to feed into Claude Code:

**groundwork-handoff.md** — the structured handoff covering the token architecture, component inventory, React API rules, repo structure, CLAUDE.md guidance, and a prioritised build order. It's written to be actionable rather than narrative — an agent can read it top to bottom and know exactly what to build and in what order.

**groundwork-design-system.html** — the v0.2 CSS implementation as ground truth for visual appearance and token values.

The handoff deliberately separates *what* from *why*. The "what" is in the handoff doc. The "why" is in this conversation. I'd pass both — the conversation is where the design reasoning lives (why two tiers not three, why `--ink-secondary` not `--ink-muted`, why no component tokens yet, the GOV.UK philosophy underpinning everything). An agent that only reads the handoff will build the right thing; one that also reads the conversation will make better judgement calls when it hits ambiguous decisions.

One thing worth flagging: the CLAUDE.md section in the handoff is a suggestion, not a finished file. You'll want to merge it with your existing AGENTS.md patterns since you've already got a philosophy for how coding agents should work in your repos.
