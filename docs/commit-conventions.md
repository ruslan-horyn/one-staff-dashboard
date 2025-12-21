# Commit Conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) using commitlint and husky.

## Configuration

- **Config file:** `commitlint.config.mjs` extends `@commitlint/config-conventional`
- **Git hook:** `.husky/commit-msg` runs commitlint on every commit

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Rules

| Rule | Requirement |
|------|-------------|
| **type** | Required, lowercase, from allowed list |
| **scope** | Optional, lowercase, in parentheses |
| **description** | Required, lowercase start, no period at end, max ~100 chars |
| **body** | Optional, separated by blank line |
| **footer** | Optional, for breaking changes or issue references |

## Allowed Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(workers): add phone validation` |
| `fix` | Bug fix | `fix(auth): resolve login redirect issue` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `style` | Formatting, no code change | `style(ui): fix button alignment` |
| `refactor` | Code restructuring | `refactor(api): simplify error handling` |
| `perf` | Performance improvement | `perf(db): optimize query execution` |
| `test` | Adding/fixing tests | `test(workers): add unit tests for validation` |
| `build` | Build system or dependencies | `build(deps): update react to v19` |
| `ci` | CI configuration | `ci(github): add deployment workflow` |
| `chore` | Maintenance tasks | `chore: update gitignore` |
| `revert` | Reverting a commit | `revert: feat(workers): add phone validation` |

## Project Scopes

Use these scopes to indicate the affected area:

| Scope | Description |
|-------|-------------|
| `workers` | Temporary workers module |
| `clients` | Clients module |
| `locations` | Work locations module |
| `positions` | Open positions module |
| `assignments` | Worker assignments |
| `reports` | Hours worked reports |
| `auth` | Authentication |
| `ui` | UI components |
| `api` | API routes/actions |
| `db` | Database/Supabase |
| `deps` | Dependencies |
| `config` | Configuration files |

## Breaking Changes

Mark breaking changes using either:

1. **Exclamation mark:** `feat(api)!: change response format`
2. **Footer:** Add `BREAKING CHANGE: description` in the commit body

## Valid Examples

```bash
# Feature with scope
feat(workers): add bulk import functionality

# Bug fix without scope
fix: resolve memory leak in dashboard

# Documentation
docs(api): add endpoint documentation

# Refactoring with breaking change
refactor(auth)!: migrate to new session format

BREAKING CHANGE: session tokens from v1 are no longer valid

# With issue reference
fix(assignments): prevent duplicate entries

Closes #123
```

## Invalid Examples

```bash
# Wrong: uppercase type
Feature: add something

# Wrong: period at end
feat: add new feature.

# Wrong: missing type
fixed the bug

# Wrong: uppercase description start
feat: Add new feature

# Wrong: empty description
feat:
```

## Husky Integration

The commit-msg hook automatically validates commits:

```bash
# .husky/commit-msg
pnpm exec commitlint --edit $1
```

If a commit message doesn't follow the conventions, the commit will be rejected with an error message explaining what's wrong.
