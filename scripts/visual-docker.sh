#!/usr/bin/env bash
# Runs the Playwright visual suite inside the pinned Playwright container so
# screenshots render identically on any host OS (macOS, Linux, Windows/WSL).
#
# Usage:
#   scripts/visual-docker.sh                     # verify against committed baselines
#   scripts/visual-docker.sh --update-snapshots  # regenerate baselines
#
# Keep IMAGE in sync with the @playwright/test version in package.json.
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.59.1-noble"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required for OS-agnostic visual tests. Install Docker, or let CI run them." >&2
  exit 1
fi

exec docker run --rm --ipc=host \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -v "$PWD":/work -w /work \
  "$IMAGE" \
  bash -lc "npm ci && npx playwright test tests/visual ${*}"
