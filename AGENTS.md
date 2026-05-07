# AGENTS.md

> Rules for AI coding agents working in this repository.
> Violations of these rules produce broken builds, not "style issues."

---

## Core Philosophy

**Make the wrong thing impossible, not just unlikely.**

Every architectural decision in this repo exists to turn runtime bugs into compile-time errors, type errors, or failing tests. If you're tempted to cast, suppress a warning, use `any`, unwrap without context, or skip a validation — stop. The friction is the feature.

---

## Before You Write Code

1. **Read before you write.** Understand the module you're changing. Read its types, its tests, its neighbours. Don't infer structure from filenames alone.
2. **Check for existing abstractions.** If a utility, type, or pattern exists for what you need, use it. Do not reinvent. Grep before you create.
3. **Ask if uncertain.** If a design decision is ambiguous, surface it rather than guessing. A wrong guess that compiles is worse than a question.

---

## Code Style & Conventions

### General

- **No abbreviations in public APIs.** `transaction`, not `txn`. `configuration`, not `cfg`. Local bindings with obvious scope are fine.
- **No dead code.** Don't comment out code "for later." That's what version control is for.
- **No TODO without a tracking reference.** `TODO(#123): ...` or `TODO(@handle): ...`. Orphan TODOs rot.
- **Prefer `const` / `let` over `var` / mutable bindings.** Immutability by default. Mutation is opt-in and explicit.
- **Functions should do one thing.** If you need the word "and" to describe what a function does, split it.
- **Prefer returning early over deep nesting.** Guard clauses at the top; happy path at natural indentation.

### Naming

- Types/structs/classes: `PascalCase`
- Functions/methods/variables: `snake_case` (Rust/Python/Gleam) or `camelCase` (TypeScript) — match the language idiom.
- Constants: `SCREAMING_SNAKE_CASE`
- Boolean variables/fields: phrase as a predicate — `is_valid`, `has_expired`, `should_retry`.
- Enum variants: describe the state, not the action — `ConnectionState::Disconnected`, not `ConnectionState::Disconnect`.

### Error Handling

- **No panics / unhandled exceptions in library code.** Ever.
- **Use typed errors, not stringly-typed ones.** `Result<T, DomainError>`, not `Result<T, String>`.
- **Unwrap only in tests or with `.expect("reason why this is safe")`.** Bare `.unwrap()` in non-test code is a build failure.
- **Propagate errors; don't swallow them.** If you catch/handle an error, log it or convert it. Silent `catch {}` blocks are forbidden.
- **Errors are values, not control flow.** Don't use exceptions/panics for expected conditions.

### Type Safety

- **No `any` (TypeScript), no `as` casts without justification, no `unsafe` without a `// SAFETY:` comment.**
- **Parse, don't validate.** Transform unstructured input into a typed, validated structure at the boundary. Interior code receives only parsed types.
- **Newtypes / branded types for domain identifiers.** `UserId(u64)`, not bare `u64`. `Email(String)`, not bare `String`. Make mixed-up arguments a compile error.
- **Exhaustive matching.** Match on enums exhaustively. No wildcard catches on enums that may grow — the compiler should force you to handle new variants.
- **If a function can fail, its return type must encode that.** `Result`, `Option`, `Either` — not a nullable return with a docstring saying "may return null."

---

## Architecture

### Boundaries & Layers

- **IO at the edges, pure logic in the core.** Database calls, HTTP requests, file reads — these live at the outermost layer. Business logic functions take data in and return data out. No side effects in the middle.
- **One-way dependency flow.** A module may depend on modules "below" it, never "above" or "beside" it in the dependency graph. If you feel the urge to create a circular dependency, you need a new abstraction.
- **Explicit dependency injection.** Functions/modules receive their dependencies as arguments or via constructor injection. No hidden global state, no ambient singletons, no mutable statics.

### API Design

- **If this project has an OpenAPI spec, it is the source of truth.** Do not hand-write client types or request/response shapes. They are generated.
- **Backwards compatibility for public/external APIs.** Adding a field is fine. Removing or renaming one is a migration. If you change a public API consumed by external clients, check every callsite. Internal interfaces get no such protection — migrate and move on.
- **Validate at the boundary, trust the interior.** All external input (HTTP requests, CLI args, file reads, env vars) is validated and parsed into domain types immediately. Interior functions never re-validate.

### Database

- **Compile-time checked queries where the tooling supports it** (e.g., `sqlx::query!`, Prisma, Drizzle). If the query can't be checked at compile time, wrap it in a tested helper.
- **Migrations are append-only.** Never edit a migration that has been applied. Create a new one.
- **No raw string SQL concatenation.** Use parameterised queries. Always.

### Think Forward

There is only a way forward. When building a product, don't hedge with fallback code, legacy shims, or defensive workarounds for situations that no longer exist. Ask: *what is the cleanest solution if we had no history to protect?* Then build that.

The best designs feel almost obvious in hindsight — so well-fitted to the problem that you wonder why it wasn't always done this way. If your approach needs extensive compatibility layers or flags for old behaviour, the design isn't done yet.

- **No fallback code for deprecated or removed paths.** If the old way was wrong, delete it — don't preserve it behind a flag.
- **No backwards-compat shims in product code.** Libraries and SDKs with external consumers are the exception.
- **No speculative code "just in case."** Code that isn't needed now is dead weight that muddies intent and slows future changes.
- **This is about dead code paths, not error handling.** Graceful handling of things that can genuinely fail at runtime (network, IO, user input) is not "fallback code" — it's correctness. Don't confuse removing legacy paths with removing resilience.

---

## Testing

- **Tests are not optional.** New logic ships with tests. Bug fixes ship with a regression test proving the fix.
- **Test behaviour, not implementation.** Tests assert on public interfaces and observable outcomes. Don't test private methods or internal state.
- **Test names describe the scenario and expected outcome.** `test_expired_token_returns_unauthorized`, not `test_auth_3`.
- **No flaky tests.** If a test is flaky, fix it or delete it. A flaky test is worse than no test — it erodes trust.
- **Use the type system to make invalid test states unrepresentable.** Builder patterns, factory functions, test fixtures — not ad-hoc object construction with half the fields set to defaults.

---

## Dependencies

- **Justify new dependencies.** A new crate/package is a maintenance burden. If the standard library or an existing dependency covers 80% of the need, prefer that.
- **Pin versions.** Use lockfiles. Commit them.
- **Audit before adding.** Check maintenance status, download counts, and transitive dependency count. A dependency that pulls in 200 transitive crates for one function is not worth it.

---

## Documentation

- **Public APIs get doc comments.** Not novels — a one-liner explaining *what* it does and *why* you'd call it.
- **Complex business logic gets a `// Why:` comment.** Don't explain *how* the code works (the code does that). Explain *why* this approach was chosen over the obvious alternative.
- **READMEs stay current.** If you change how to build, run, or deploy — update the README in the same commit.

---

## Local CI Parity

`just ci` is the single entrypoint that mirrors GitHub Actions. It runs in this order:

1. `cargo fmt --check` + `oxfmt --check` — formatting drift
2. `cargo clippy --all-targets --all-features -- -D warnings` + `oxlint` — lint
3. `tsc --noEmit` — strict TypeScript typecheck
4. `cargo test --all-features` + `vitest run` — full Rust/integration suite + frontend unit tests
5. `npm run build` + `cargo build --release --features server` — both builds

Lefthook hooks enforce a subset:

- **pre-commit** (fast, sub-second): rust-fmt, rust-clippy, ts-typecheck, oxlint, oxfmt-check on staged files only.
- **pre-push** (slow): `cargo test --all-features` + `vitest run`.

If `just ci` passes locally, CI will pass. If it doesn't, fix the failure rather than skipping hooks (`--no-verify`) — that's a build failure per AGENTS.md §"Operational Rules" §5.

### Frontend type contract

The TypeScript frontend (`client/`) consumes a typed wire contract that mirrors `src/server/dto.rs` by hand: types in `client/src/types/api.ts`, runtime parsers in `client/src/parse/parsers.ts`. **When you change a DTO on the Rust side, update both TS files in the same commit.** The parsers run on every fetch response and throw `ApiContractError` on drift — `tests/server.rs` exercises the JSON shape end-to-end so contract regressions surface in CI.

The build (`client/build.mjs`) compiles `client/src/**/*.ts` with `esbuild`, type-checks with `tsc --noEmit`, copies `client/static/*` (index.html, style.css), and during the JS→TS migration window also passes through `web/views/*.js` to `web/dist/views/`. Once every view is migrated to TS, the legacy pass-through can be removed.

### Frontend tests (vitest)

`vitest run` covers the wire-boundary parsers and pure logic (e.g. `tokenAtCursor`, `buildSuggestions`) under a node environment — no jsdom. **DOM-touching code (renderers, event wiring) is not unit-tested**: jsdom is a fragile second model of the browser, and `innerHTML` assertions tend to break on every refactor without catching real regressions. View rendering is exercised by `cargo test`'s end-to-end HTTP coverage and by manual browser checks. When porting a view to TS, lift any pure helper out of the DOM file (e.g., into a sibling module or a named export) so it can be tested in isolation.

---

## Agent-Specific Rules

These apply specifically to AI coding agents operating in this repo:

### Production Data Isolation

**Never run grimoire against `~/.grimoire`.** That path holds the user's real catalog and asset library — destructive commands like `import --move`, `delete`, and `delete --match` are irreversible there.

The repo isolates the dev catalog via two layered mechanisms:

1. **`.cargo/config.toml`** sets `GRIMOIRE_ROOT=<repo>/.grimoire-dev` for every cargo subprocess (`cargo run`, `cargo test`, `cargo build`). This is the load-bearing guard — it works regardless of CWD, agent harness, or shell environment.
2. **`.envrc`** (direnv) exports the same env var into your interactive shell, so direct invocations like `./target/release/grimoire …` also land in the dev root. Run `direnv allow` once to activate.

The dev root `<repo>/.grimoire-dev` is gitignored.

Rules:

- Do **not** pass `--root ~/.grimoire` (or any path resembling the user's home catalog) when invoking the binary.
- Do **not** override `GRIMOIRE_ROOT` to point at the user's home catalog. The cargo config sets `force = true`, so a stale shell export won't shadow it for cargo invocations — but agents shouldn't try.
- If the dev root is empty and you need data, run `cargo run -- init` followed by `cargo run -- import …` against fixture files you create — never copy from `~/.grimoire`.
- Tests still pass `--root <TempDir>` explicitly; that pattern is correct and unaffected by the env var.

### Raising Concerns & Architectural Judgment

**You are expected to push back.** Blindly implementing a task that makes the codebase worse is a failure, even if the task is "completed." You have a responsibility to flag problems.

**Before implementing, ask yourself:**

- Does this task, as described, fit cleanly into the existing architecture? Or am I about to bolt something on?
- Am I working *with* the type system and module boundaries, or *around* them?
- If I implement this literally, will the next change in this area be harder or easier?
- Is there a simpler design that would make this task trivial?

**Signals that something needs a deeper conversation before you proceed:**

- **Shotgun surgery.** The change requires touching many unrelated files for a single logical change. The abstraction boundaries are wrong.
- **Fighting the types.** You're reaching for casts, `any`, wrapper hacks, or extra `Option`/`nullable` layers to make things fit. The data model is wrong.
- **Duplication pressure.** You're about to copy-paste logic because the existing abstraction doesn't quite fit. The abstraction needs rethinking, not duplicating.
- **Feature envy.** Your new code is constantly reaching into another module's internals. The behaviour lives in the wrong place.
- **Naming strain.** You can't name the function/type clearly because it does too many things or straddles two concerns.
- **Test contortion.** Writing the test is harder than writing the code. The interface is wrong.
- **Growing parameter lists.** A function needs 6+ arguments or a config bag is accumulating fields. The responsibility is too broad.

**When you spot these signals:**

1. **Stop. Don't implement the workaround.** A clean implementation on a broken foundation is still broken.
2. **State the concern clearly.** What's wrong, what signal you noticed, and why it matters.
3. **Propose an alternative.** Don't just say "this is bad" — offer a concrete path. "If we extract X into its own module and invert the dependency, this task becomes a three-line change."
4. **Distinguish severity.** Be clear about whether this is "we should fix this now because it'll compound" vs "this is tech debt worth noting for later." Not everything is a blocker.
5. **If the task is urgent and the refactor isn't, say so.** "I can do this as-is behind a clean interface, but we should revisit the underlying structure before adding more features here." Pragmatism over dogma.

### Operational Rules

1. **Do not introduce new patterns.** Follow the patterns already established in the codebase. If you think a new pattern is better, surface it as a suggestion — don't just do it.
2. **Leave the codebase better than you found it.** If completing a task exposes dead code, inconsistent naming, redundant abstractions, or duplication — clean it up. A cohesive, maintainable codebase is a top priority. Use judgement: small, obvious improvements are expected; large refactors that change the task's scope should be surfaced first.
3. **Run the build / type-check / linter before declaring done.** This repo's entrypoint is `just ci` — it runs `fmt-check`, `lint`, `typecheck`, `test`, and `build` in the same order CI does. Lefthook runs a subset on every commit and the full test suite on push, so passing `just ci` locally means passing in CI.
4. **Run tests before and after your change.** If tests fail after your change that didn't fail before, your change is broken.
5. **Do not add `// eslint-disable`, `#[allow(...)]`, `# type: ignore`, or equivalent suppressions** without an accompanying comment explaining why the suppression is necessary and a reference to a tracking issue for its removal.
6. **Do not generate placeholder or stub implementations** unless explicitly asked for scaffolding. If you can't implement something fully, say so.
7. **Preserve existing test coverage.** Do not delete or weaken tests to make your code pass. If a test is genuinely wrong, explain why before changing it.
8. **If the project uses code generation** (OpenAPI → client, protobuf → types, sqlx → query macros), **do not hand-edit generated files.** Modify the source and regenerate.
9. **Read `CLAUDE.md`, `AGENTS.md`, and any `README.md` in the directory you're working in before starting.** They exist for a reason.
10. **Prefer explicit over clever.** A five-line function that reads clearly beats a one-liner that requires a PhD to parse. Write code for the next person (or agent) reading it, not for a code golf leaderboard.
