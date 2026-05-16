# Style pages do not share a template

Component pages adopt a locked template (hero demo / When to use / When not to use / How it works with per-variant H3s / Accessibility / Related / Background). Pattern pages adopt a slightly different locked template (verb-led title where natural, no When-not-to-use by default, flexible How-it-works H3s, optional embedded Flow). Style pages — colour, spacing, typography, layout primitives, borders, focus — deliberately do not share a template.

Each style page is authored to suit its content type: swatches for colour, a ruler for spacing, type specimens for typography, primitive demos for layout. Token names appear next to their reference visuals, but the shape of that reference varies. A hybrid template (shared title / brief / How-to-use / Related / Background with a flexible "What's available" section) and a uniform template were both rejected because forcing colour's swatch shape into spacing's ruler shape produces a less informative reference layer. gov.uk takes the same non-template approach for its Styles section.

The trade-off accepted: style pages are less scannable as a group, and the absence of a shared structure may drift over time. Re-evaluate if drift becomes a navigation problem. At six pages this is tolerable; at twelve, the lack of shared structure may not be.
