#!/bin/bash

# Run tests with coverage only for staged files
# Used in pre-commit hook to enforce coverage thresholds on new code

set -e

# Get staged .ts/.tsx source files (exclude tests, types, mocks)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | \
  grep -E '\.(ts|tsx)$' | \
  grep -vE '\.test\.|\.spec\.|\.d\.ts$|__tests__|__mocks__|types/' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "No source files staged - skipping coverage check"
  exit 0
fi

echo "Running coverage for staged files:"
echo "$STAGED_FILES" | sed 's/^/  /'
echo ""

COVERAGE_INCLUDE=$(echo "$STAGED_FILES" | tr '\n' ',' | sed 's/,$//')

pnpm vitest run \
  --changed HEAD \
  --coverage \
  --coverage.include="$COVERAGE_INCLUDE" \

echo ""
echo "Coverage check passed"
