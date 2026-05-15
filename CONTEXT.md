# Groundwork

A design system that enforces UI consistency and accessibility through restrictive component APIs and a closed token set. See `docs/INTENT.md` for the full philosophy.

## Language

### Form controls

**Field**:
A labelled form control with optional hint and error. Two shapes: `<Field>` (a `<div>` + `<label>` shell wrapping one control) and a **Choice group** (a `<fieldset>` + `<legend>` shell wrapping multiple option inputs).
_Avoid_: form field, form group, input wrapper.

**Field consumer**:
The form-control element rendered inside a Field — receives ARIA props from the Field and applies them. Examples: Input, Textarea, Select; for a Choice group, the individual radio/checkbox inputs.
_Avoid_: form element, child control.

**Choice group**:
A `<fieldset>`-backed Field for picking from a short, visible list. RadioGroup (single-select) and CheckboxGroup (multi-select) are the two public shapes.
_Avoid_: option group.

**Field description**:
The bundle that wires a Field's label, hint, and error to its consumer: the derived IDs, the ARIA attribute bundles (input-style and fieldset-style), and the rendered hint and error nodes. Produced by `describeField()`.
_Avoid_: field ARIA, field binding, field metadata.

**Hint**:
Short supplementary copy explaining what the user should enter. Shown before the control; referenced by `aria-describedby`.
_Avoid_: help text, description.

**Field error**:
Structured error copy with `{ problem, fix }` — `problem` names what's wrong, `fix` tells the user how to correct it. Both Field and ErrorSummary format it consistently.
_Avoid_: validation error, error message (which refers to the rendered string).

### Tokens

**Primitive token**:
A raw value on a closed scale, prefixed `--_gw-`. Private — component CSS must not reference these directly.
_Avoid_: base token, atom.

**Semantic token**:
A public CSS custom property naming a decision (`--ink-secondary`, `--action`). References a primitive. The only tokens components are allowed to reference.
_Avoid_: design token (too generic), alias.

## Relationships

- A **Field** owns one **Field description**, which wires its label, **Hint**, and **Field error** to its **Field consumer**.
- A **Choice group** is a **Field** whose consumers are the choice inputs.
- A **Field description** is produced by `describeField(id, { hint, error })` and consumed by both `<Field>` and the Choice group module.
- Component CSS references **Semantic tokens** only; **Semantic tokens** reference **Primitive tokens**.

## Example dialogue

> **Dev:** "Can RadioGroup just use `<Field>`?"
> **Architect:** "Not directly — `<Field>` renders `<div>` + `<label>`, but a **Choice group** needs `<fieldset>` + `<legend>`. They share the **Field description** (the ARIA wiring + hint + error nodes), not the outer shell."

## Flagged ambiguities

- "Field" is used both for the domain concept (any labelled form control) and for the specific `<Field>` React component. Context disambiguates; when ambiguous, say "the Field component" vs "a labelled field."
