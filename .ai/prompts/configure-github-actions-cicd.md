# Configure GitHub Actions CI/CD Workflow

## Context

DevOps engineer specializing in GitHub Actions, Node.js CI/CD pipelines, and Playwright testing.
Project configuration:

- Node.js v24.11.1 (from `.nvmrc`)
- pnpm as package manager
- Next.js 16 with App Router
- Biome for linting and formatting
- Vitest for unit tests (90% coverage threshold)
- Playwright for E2E tests (Chromium only)
- Supabase for backend (requires environment variables)

## Source Files

### Primary (must read)

- `package.json` - Available scripts and dependencies
- `.nvmrc` - Node.js version requirement
- `.env.ci` - CI environment variables template
- `playwright.config.ts` - E2E test configuration
- `vitest.config.mts` - Unit test and coverage configuration

### Reference (read as needed)

- `docs/tech-stack.md` - Technology stack overview
- `docs/commit-conventions.md` - Commit message conventions
- `CLAUDE.md` - Project coding standards

## Tasks

### Phase 1: Analysis

1. **Read configuration files:**
   - Verify Node.js version from `.nvmrc` (v24.11.1)
   - Identify all CI-relevant scripts from `package.json`
   - Extract required environment variables from `.env.ci`
   - Understand Playwright browser requirements and reporter settings
   - Note Vitest coverage thresholds (90%)

2. **Map dependencies between CI steps:**
   - Lint and format check can run independently
   - Unit tests can run independently
   - Build requires lint/tests to pass first
   - E2E tests require build and auth verification

### Phase 2: Create Workflow File

Create `.github/workflows/ci.yml` with the following structure:

1. **Workflow triggers:**
   - On push to `main` branch
   - On pull requests to `main` branch

2. **Jobs configuration:**

   **Job 1: `lint` (fast feedback)**
   - Checkout code
   - Setup pnpm with caching
   - Setup Node.js v24.11.1 with pnpm cache
   - Install dependencies with `pnpm install --frozen-lockfile`
   - Run `pnpm lint`

   **Job 2: `test` (unit tests)**
   - Same setup as lint
   - Run `pnpm test:coverage`
   - Upload coverage report as artifact
   - Upload to codecov (optional)

   **Job 3: `build`**
   - Depends on: lint, test
   - Same setup as above
   - Set environment variables for Next.js build:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
     - `NEXT_PUBLIC_SITE_URL`
   - Run `pnpm build`
   - Upload `.next` directory as artifact for E2E job

   **Job 4: `e2e` (Playwright)**
   - Depends on: build
   - Download build artifact
   - Install Playwright browsers: `npx playwright install --with-deps chromium`
   - Set environment variables (including secrets):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
     - `NEXT_PUBLIC_SITE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY` (from GitHub Secrets)
     - `TEST_USER_EMAIL`
     - `TEST_USER_PASSWORD` (from GitHub Secrets)
   - Run auth verification: `pnpm verify:auth`
   - Run E2E tests: `pnpm test:e2e`
   - Upload Playwright report as artifact (always)
   - Upload test-results on failure (traces, screenshots)

3. **Caching strategy:**
   - Use `pnpm/action-setup@v4` for pnpm installation
   - Use `actions/setup-node@v4` with `cache: 'pnpm'`
   - Cache Playwright browsers using `actions/cache@v4`

4. **Artifact retention:**
   - Coverage reports: 30 days
   - Playwright reports: 30 days
   - Build artifacts: 1 day (only needed for E2E job)

### Phase 3: Validation

1. **Verify workflow syntax:**
   - Ensure YAML is valid
   - Check all job dependencies are correct
   - Verify environment variable names match `.env.ci`

2. **Confirm secret requirements:**
   - List secrets that must be added to GitHub repository:
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `TEST_USER_PASSWORD`

3. **Test matrix considerations:**
   - Single OS: ubuntu-latest
   - Single Node version: 24.11.1
   - Single browser: Chromium

## Output Format

### Workflow File Structure

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '24.11.1'
  PNPM_VERSION: '10.23.0'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      # ... lint steps

  test:
    runs-on: ubuntu-latest
    steps:
      # ... test steps with coverage

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      # ... build steps

  e2e:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      # ... E2E steps with Playwright
```

### Required GitHub Secrets

Document these secrets that must be configured:

| Secret Name | Description | Source |
|-------------|-------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Supabase admin operations | Supabase Dashboard > Settings > API |
| `TEST_USER_PASSWORD` | Password for E2E test user | Match value used in test setup |

### Reusable Setup Composite Action (Optional)

If code duplication is high, create `.github/actions/setup-node-pnpm/action.yml`:

```yaml
name: 'Setup Node.js and pnpm'
description: 'Install Node.js and pnpm with caching'

runs:
  using: 'composite'
  steps:
    - uses: pnpm/action-setup@v4
      with:
        version: ${{ env.PNPM_VERSION }}

    - uses: actions/setup-node@v4
      with:
        node-version-file: '.nvmrc'
        cache: 'pnpm'

    - run: pnpm install --frozen-lockfile
      shell: bash
```

## Success Criteria

### Measurable Goals

- [ ] Workflow file created at `.github/workflows/ci.yml`
- [ ] All four jobs configured: lint, test, build, e2e
- [ ] pnpm caching enabled using official action
- [ ] Coverage report uploaded as artifact
- [ ] Playwright report uploaded as artifact
- [ ] All required environment variables documented
- [ ] GitHub secrets list provided

### Validation Method

- Run `yamllint` or GitHub Actions syntax validator on the workflow
- Verify all script names match `package.json`
- Confirm Node version matches `.nvmrc`
- Check that Playwright installs only Chromium (not all browsers)

## Constraints

- DO NOT install all Playwright browsers - only Chromium is needed
- DO NOT use deprecated action versions (use v4 for setup-node, cache actions)
- DO NOT hardcode Node version - read from `.nvmrc` using `node-version-file`
- ALWAYS use pnpm version 10.23.0 to match project configuration
- DO NOT expose secrets in logs - use `${{ secrets.* }}` syntax
- DO NOT run E2E tests without build artifact - require proper job dependency
- ONLY use `ubuntu-latest` as the runner OS
- ALWAYS use `pnpm install --frozen-lockfile` in CI (pnpm defaults to this when CI=true)
- PREFER uploading artifacts with `if: always()` for debugging failed runs
- ENSURE Playwright runs with `CI=true` environment variable (automatic on GitHub Actions)

## Examples

### Example: pnpm Setup Steps

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10.23.0

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Example: Playwright Setup and Run

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm test:e2e
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY }}
    NEXT_PUBLIC_SITE_URL: http://localhost:3000
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    TEST_USER_EMAIL: e2e-test@onestaff.test
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30

- name: Upload test results
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: test-results
    path: test-results/
    retention-days: 30
```

### Example: Coverage Upload

```yaml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 30
```

### Example: Build with Environment Variables

```yaml
- name: Build application
  run: pnpm build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY }}
    NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

## Post-Implementation Checklist

After creating the workflow, verify:

1. **Add GitHub Secrets** in repository settings:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TEST_USER_PASSWORD`

2. **Add GitHub Variables** (non-sensitive) in repository settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

3. **Test the workflow:**
   - Push to a feature branch
   - Create a PR to trigger the workflow
   - Verify all jobs complete successfully
   - Download and inspect artifacts
