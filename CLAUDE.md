# Groundwork Agent Guidance

Groundwork is a design system. Visual consistency, API correctness, and accessibility constraints matter more than shipping speed.

## Source of truth

- Read `docs/INTENT.md` and `meta/artifacts/initial-chat/groundwork-handoff.md` before architectural work.
- `meta/artifacts/initial-chat/groundwork-design-system.html` is the v0.2 visual and token reference.
- Token JSON files are the source of truth for CSS custom properties.
- `css/groundwork.css` is generated. Do not edit it directly.

## Token rules

- The architecture is two-tier only: private primitives (`--_gw-*`) and public semantic tokens.
- Component CSS must reference semantic tokens only.
- Do not add component tokens unless explicitly approved.
- Dark mode belongs at the semantic-token mapping layer, not inside individual components.

## React rules

- Components enforce the design system through TypeScript.
- Require labels or accessible names through component API design.
- Forward refs and spread safe native HTML attributes.
- Do not expose `className` or `style` props.
- Use closed prop unions for variants, widths, and supported choices.
- Prefer `Field` composition over standalone form controls.

## Styling rules

- No CSS-in-JS.
- No Tailwind.
- No runtime styling system.
- Plain CSS custom properties are the styling system.

## Testing rules

Every new component needs:

- Documentation page with when to use, when not to use, examples, and accessibility notes.
- Playwright accessibility coverage.
- Playwright visual-regression coverage.
