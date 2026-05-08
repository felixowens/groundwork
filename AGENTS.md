# AGENTS.md

> Rules for coding agents working on Groundwork.

Groundwork is an opinionated design system for web applications. The goal is to make correct UI structure easy and incorrect structure difficult.

## Core philosophy

**Make the wrong thing impossible, not just unlikely.**

Use TypeScript types, generated tokens, and tests to turn design-system rules into compile-time errors or failing CI checks.

## Required reading

Before changing architecture or component APIs, read:

- `docs/INTENT.md`
- `meta/artifacts/initial-chat/groundwork-handoff.md`
- `meta/artifacts/initial-chat/groundwork-design-system.html`
- `CLAUDE.md`

## Token rules

- Token source files live in `tokens/`.
- `css/groundwork.css` is generated. Never edit it directly.
- Primitives are private and prefixed `--_gw-*`.
- Components and authored CSS use semantic tokens only.
- Do not add component tokens without explicit approval.
- Dark mode is implemented by remapping semantic tokens to primitives.

## Component rules

- React components must enforce accessible structure through their API.
- Form controls go through `Field` unless there is a strong reason not to.
- Components forward refs and spread safe native HTML props.
- Components do not accept `className` or `style`.
- Props reflect closed design-system choices: variants, widths, and statuses are unions, not arbitrary strings.

## Documentation and tests

Every new component needs:

- A docs page with when to use, when not to use, examples, and accessibility notes.
- Playwright accessibility coverage.
- Playwright visual-regression coverage.

## Validation

Use:

```bash
just ci
```

This runs the CSS build, CSS architecture checks, TypeScript checks, builds, and tests.

For noisy validation commands, prefer:

```bash
run_quiet "label" "command"
```

## Working style

- Read before writing.
- Prefer explicit code over clever abstractions.
- Raise concerns before implementing workarounds.
- Do not add dependencies without justification.
- Do not weaken tests to make a change pass.
