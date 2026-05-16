# Component API reference is generated typedoc, not inline tables

Each component's React props are documented via TSDoc with required `@public` / `@alpha` / `@internal` release tags (per AGENTS.md). The decision is to generate a typedoc-style API reference at `/reference/api/` from those TSDoc annotations, rather than maintaining hand-authored prop tables inline on each component doc page. Component pages link to the API reference at the bottom and otherwise stay focused on usage prose.

Inline prop tables — the gov.uk parallel and the more common pattern across design systems — were rejected for two reasons. INTENT.md positions TypeScript as the spec ("TypeScript turns the design rules into type constraints"), so duplicating prop signatures in MDX adds rot risk without adding enforcement. And the role of an API table in "making misuse hard" is weak when the prop union is already a compile-time error. Component pages can spend their prose budget on the when/when-not/how-it-works content that types cannot enforce.

The trade-off accepted: a typedoc generation step has to exist and stay healthy in `just ci`, and non-React consumers (CSS-only users) get less help from per-component pages. Re-evaluate if the generation overhead becomes painful, or if a real non-React consumer surfaces and needs inline reference per component.
