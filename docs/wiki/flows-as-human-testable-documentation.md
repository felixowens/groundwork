# Flows as human-testable documentation

Source: current Groundwork session, 2026-05-07.

## Decision

Groundwork docs should include **flows**: full interactive journeys that show components working together in realistic application contexts.

Flows are not exported package APIs. They are docs and review artifacts until repeated examples reveal a reusable abstraction.

## Why this matters

Isolated component pages prove that a component can render. They do not prove that the system works as a product surface.

Flows let us test:

- component composition across a real task
- accessibility wiring across validation, review, and confirmation states
- whether restrictive React APIs feel helpful or awkward in realistic use
- visual rhythm across multiple components on one page
- missing components or patterns that only appear in context

## What a flow should include

Each flow should have:

1. A realistic user task.
2. Happy path and error path.
3. A visible human test script.
4. Keyboard-only review guidance.
5. Automated axe coverage.
6. At least one Playwright interaction test for the core journey.
7. Visual regression coverage for the initial state.

## Current example

`/flows/contact-details/` demonstrates:

- data-entry fields
- validation with `ErrorSummary`
- field-level errors
- review/check-your-answers state
- confirmation state

## Rule of thumb

If a component looks fine in isolation but feels awkward inside a flow, the flow is probably telling the truth. Fix the API or pattern before adding more examples.
