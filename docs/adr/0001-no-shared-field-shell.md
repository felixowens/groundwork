# Don't extract a shared `<FieldShell>` from Field and Choice group

`<Field>` renders `<div> + <label> + hint + error + child` and `<ChoiceGroup>` renders `<fieldset> + <legend> + hint + error + choices`. The shells look parallel, but the variance is structural: outer element (`div`/`fieldset`), label element (`<label htmlFor id>`/`<legend>`), fieldset-specific focus management (`tabIndex={hasError ? -1 : rest.tabIndex}`) and attribute spread (`ref`, `...rest`, `{...fieldsetAriaProps}`), and the render-prop vs direct-children contract.

A shared shell component either grows wide signatures to accept all of that, or only shares the `{hintNode}{errorNode}` pair — which is two JSX nodes, not a module. The deep accessibility seam is already extracted as `describeField` (see CONTEXT.md "Field description"); what remains is conventional CSS class composition and JSX ordering across two call sites, with no expected third.

Re-evaluate if a third Field-shaped component appears that isn't a Choice group variant — for example, a `<Fieldset>` for grouped non-choice inputs (date parts, address) — and the shell variance narrows.
