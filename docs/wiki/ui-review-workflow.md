# UI review workflow

Source: current Groundwork session, 2026-05-07.

## Decision

Groundwork keeps a local UI review tool in the repo:

```bash
npm run review:ui
```

The script captures screenshots and layout metrics into `.logs/ui-review/latest/`. The directory is intentionally gitignored because these are review artifacts, not baselines.

## What it checks today

- Desktop screenshots for overview, tokens, flows, and the contact-details flow.
- Contact-details flow screenshots for initial, error, review, and confirmation states.
- Mobile screenshots for the flows index and contact-details initial/error states.
- Horizontal overflow at desktop and mobile widths.
- List padding for content lists, to catch markers/numbers escaping their container.
- Programmatic focus and visible focus outline on the error summary after validation.

## Relationship to tests

This tool is not a replacement for CI tests:

- Playwright visual snapshots are the regression baseline.
- Axe tests catch automated accessibility violations.
- Flow interaction tests assert core journeys.
- `review:ui` is for human inspection and quick layout diagnostics while developing docs and flows.

## Rule of thumb

If a human reviewer notices a visual issue, add a cheap metric to `review:ui` when possible. Screenshots are useful, but measurable checks make regressions easier for agents to catch.
