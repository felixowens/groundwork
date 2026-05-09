set shell := ["bash", "-cu"]

ci:
	@npm run ci

build:
	@npm run build

build-css:
	@npm run build:css

check-css:
	@npm run check:css

check-generated-css:
	@npm run check:generated-css

check-biome:
	@npm run check:biome

check-oxlint:
	@npm run check:oxlint

check-project-rules:
	@npm run check:project-rules

docs:
	@npm run docs:dev

docs-build:
	@npm run docs:build

format:
	@npm run format

format-check:
	@npm run format:check

lint:
	@npm run lint

test:
	@npm test

test-unit:
	@npm run test:unit

test-unit-coverage:
	@npm run test:unit:coverage

test-a11y:
	@npm run test:a11y

test-components:
	@npm run test:components

test-flows:
	@npm run test:flows

test-visual:
	@npm run test:visual

typecheck:
	@npm run typecheck

review-ui:
	@npm run review:ui
