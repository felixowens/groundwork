# INTENT.md — Why Groundwork Exists

## The problem

Every new project starts with the same waste: picking colours, arguing about spacing, reinventing form validation UX, forgetting accessible labels, choosing between 14px and 15px for secondary text. These aren't interesting decisions. They're tax.

Design systems exist to eliminate this tax, but most of them optimise for the wrong thing. They optimise for flexibility — giving you every possible option so you can build anything. The result is Tailwind's 300+ colour classes, Material's 40 button variants, and teams that still ship inconsistent UIs because the system said "here are your options" instead of "here is the answer."

GOV.UK's design system works because it does the opposite. It makes decisions for you. There's one button style. One input pattern. One way to handle errors. The constraints aren't limitations — they're the product. You stop thinking about UI decisions and start thinking about the thing you're actually building.

Groundwork is that philosophy applied to general web application development.

## The bet

The bet is that a small, closed, opinionated system will produce better outcomes than a large, flexible one. Specifically:

- **A closed token set** (12 spacing values, 7 type sizes, semantic-only colours) eliminates visual drift across pages and over time. You can't introduce `padding: 13px` because 13 doesn't exist.
- **React components with restrictive APIs** (required labels, no className override, variant unions instead of string props) turn documentation into compiler errors. You don't need to remember the rules — the types enforce them.
- **Form patterns as the core feature** (Field wrapper, error summary, width hints, check-your-answers) cover the 80% case for application UI. Most apps are forms. Do forms exceptionally well and everything else is incremental.
- **Two-tier tokens** (private primitives → public semantic) make re-theming a primitive swap rather than a component-by-component restyle, while keeping the public API small enough to hold in your head.

## Who this is for

Me. Right now, this is a personal tool. It exists to eliminate the startup cost of new projects and enforce consistency across them. If it becomes useful to others, great — but the design decisions should serve actual usage in real projects, not hypothetical flexibility for hypothetical users.

## What this is not

- **Not a component mega-library.** ~17 components. If you need a date range picker or a drag-and-drop kanban board, build it on top or use something else.
- **Not framework-agnostic.** The CSS layer is generic. The component layer is React. There are no Web Component wrappers, no Vue bindings, no Svelte port. These can exist later if there's demand, but maintaining phantom consumers wastes effort.
- **Not a design tool integration.** No Figma plugin, no design-to-code pipeline. Tokens live in JSON, generate CSS, and that's the workflow.
- **Not a CSS framework.** There's no utility class system. No `.gw-mt-4` or `.gw-text-center`. Layout is handled by four primitives (stack, cluster, prose, grid) and the rest is component-level.

## Design philosophy

### Constraints produce consistency

The spacing scale has intentional gaps. There's no value between 24px and 32px. This is a feature — it eliminates the decision between 26, 28, and 30. You pick 24 or 32 and move on. This principle applies everywhere: two border radii, not five. Three ink colours, not seven. Four border widths that cover every structural use case.

### Names describe decisions, not appearances

`--ink-secondary` tells you when to use it (supporting text). `--ink-muted` tells you what it looks like (muted) and leaves you guessing whether it's for hints, disabled states, or metadata. Every token name should pass the rename test: can you change the underlying value without the name becoming a lie?

### Accessibility is structural, not aspirational

The React `<Field>` component requires a label prop. It's not a lint warning or a documentation note — it's a type error. Error messages are structured to include both what went wrong and how to fix it, because the component API guides you toward that pattern. The focus ring is 3px solid yellow — ugly on purpose, unmissable by design.

### The CSS is the product, React is the enforcement layer

The token system and component styles work as a standalone CSS file. You could use Groundwork with plain HTML or any framework by applying class names. The React layer's job is narrower: make the correct patterns the only patterns available through the component API. TypeScript turns the design rules into type constraints.

### Progressive disclosure of complexity

Start with `<Field>` + `<Input>` + `<Button>`. That covers most forms. Add error handling when you need it. Add summary lists for review pages. Add cards and tables for dashboards. The system grows with your needs — you don't have to understand all 17 components on day one.

## Success criteria

This project succeeds when:

1. Starting a new side project's UI takes minutes, not hours.
2. The second project built with Groundwork looks consistent with the first without any manual effort.
3. Accessibility basics (labels, focus, error messaging, colour independence) are impossible to skip, not just encouraged.
4. Re-theming for a different visual identity requires changing a handful of primitive values, not auditing every component.

This project fails if:

1. The token set or component count grows to the point where you need to search documentation to find the right option.
2. The restrictive API creates so much friction that you bypass it with escape hatches on every other component.
3. It becomes a project *about* a design system rather than a tool *for* building other projects.

## Origin

This system came out of a conversation about what makes GOV.UK's design system effective and how to apply those principles to general web development. The key insight: GOV.UK works because of what it says no to, not what it includes. Groundwork tries to carry that forward — a small surface area, a closed token system, and opinions that save you from making the same boring decisions on every project.
