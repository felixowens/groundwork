# Patterns absorb Flows; Flows are not a parallel top-level section

Patterns is a new top-level docs section (Get-started / Styles / Components / Patterns / Reference). Flows — interactive component journeys with human-testable scripts and Playwright coverage, established in `docs/wiki/flows-as-human-testable-documentation.md` — predate Patterns and currently live at `/flows/`. The decision is to redefine Flows as a structural element within Pattern pages: a large Pattern (Check answers) embeds its Flow as the interactive demo and test surface; a small Pattern (Ask for an email) may have no Flow, only a static demo.

The alternatives were Patterns ∥ Flows (two parallel sections — duplication risk, since readers want both prose and demo from one page), Patterns = renamed Flows (loses the testing-artifact framing the wiki article established), and Patterns + Flows but unlinked (two doc taxonomies to maintain). Patterns ⊃ Flows preserves the testing framing while making Patterns the primary entry point — and scales: small patterns don't force a Flow, large ones embed one.

Re-evaluate if a Flow appears that doesn't fit inside a single Pattern page — for example, a Flow that spans multiple Patterns, or a standalone integration-test Flow with no obvious pattern home.
