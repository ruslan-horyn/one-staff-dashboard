#!/bin/bash

# Run tests with coverage only for staged files
# Used in pre-commit hook to enforce coverage thresholds on new code

set -e

# Get staged .ts/.tsx files, excluding: tests, types, mocks, index exports, config, scripts, e2e
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | \
  grep -E '\.(ts|tsx)$' | \
  grep -vE '\.test\.|\.spec\.|\.d\.ts$|__tests__|__mocks__|types/|/index\.tsx?$|^e2e/|\.config\.|^scripts/' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "No source files staged - skipping coverage check"
  exit 0
fi

echo "Running coverage for staged files:"
echo "$STAGED_FILES" | sed 's/^/  /'
echo ""

# Build --coverage.include flags for each file
COVERAGE_FLAGS=""
while IFS= read -r file; do
  COVERAGE_FLAGS="$COVERAGE_FLAGS --coverage.include=$file"
done <<< "$STAGED_FILES"

# Run tests related to staged files with coverage limited to those files
pnpm vitest related $STAGED_FILES --run --coverage $COVERAGE_FLAGS

echo ""
echo "Coverage check passed"
