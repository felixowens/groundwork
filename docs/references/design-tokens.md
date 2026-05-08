# Design Tokens Community Group reference

Groundwork token source files use the Design Tokens Community Group (DTCG) shape:

- token values are stored in `$value`
- token types are stored in `$type`
- token references use curly-brace paths, for example `{primitives.color.blue.60}`

Primary reference:

- DTCG Format Module, editors' draft snapshot for 2025.10: <https://www.designtokens.org/tr/2025.10/format/>
- Community Group draft: <https://design-tokens.github.io/community-group/format/>

## JSON Schema status

As of the 2025.10 format document, the DTCG does not publish an official JSON Schema for token files. The spec includes an editor's note that the group is exploring adding one to support the format.

Do not add a repo-local schema unless we intentionally choose to maintain our own partial validation rules. Prefer validating architectural constraints in dedicated checks, such as `scripts/check-css-architecture.mjs`, rather than pretending to implement the full DTCG spec.
