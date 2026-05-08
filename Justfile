set shell := ["bash", "-cu"]

ci:
	@npm run ci

build:
	@npm run build

build-css:
	@npm run build:css

check-css:
	@npm run check:css

docs:
	@npm run docs:dev

docs-build:
	@npm run docs:build

test:
	@npm test

test-a11y:
	@npm run test:a11y

test-flows:
	@npm run test:flows

test-visual:
	@npm run test:visual

typecheck:
	@npm run typecheck

review-ui:
	@npm run review:ui
