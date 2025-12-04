# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

One Staff Dashboard is an internal MVP web application for a temporary staffing agency. It replaces manual spreadsheet-based processes by centralizing management of temporary workers, clients, work locations, and schedules. Key features include worker assignment to positions, availability tracking, and worked hours reporting.

## Development Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start development server
pnpm build           # Production build
pnpm start           # Run production server
pnpm lint            # Run ESLint
```

**Note:** Uses pnpm as package manager. Node.js v24.11.1 (see .nvmrc).

Future commands (not yet configured):

```bash
pnpm test            # Run Vitest unit tests
pnpm test:e2e        # Run Playwright E2E tests
```

## Tech Stack

**Currently Installed:**

- Next.js 16 (app router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- ESLint 9

**Planned (not yet added):**

- Supabase (PostgreSQL + JWT auth)
- Zustand (state management)
- Lucide React (icons)
- Vitest + React Testing Library + MSW (testing)
- Playwright (E2E)

## Key Domain Concepts

- **Roles:** Administrator, Coordinator (Pracownik Agencji)
- **Entities:** Clients (Klienci), Work Locations (Miejsca Pracy), Temporary Workers (Pracownicy Tymczasowi), Open Positions (Otwarte Stanowiska)
- **Main workflow:** Coordinators assign workers to positions with start datetime (end datetime optional). System allows overlapping assignments.
- **Reports:** Hours worked reports with CSV/Excel export
- **Audit log:** Immutable event log tracking all assignment operations

## Architecture Notes

- Uses Next.js App Router with server-side routing focus
- Path alias: `@/*` maps to project root (e.g., `@/app/page`)
- RWD (responsive) design foundation for future PWA
- Temporary workers do not have system login access
- No automatic notifications in MVP scope
- Overlapping assignments are permitted by design (coordinator responsibility)
- CI/CD via GitHub Actions with Cloudflare Pages hosting

## FRONTEND

### Guidelines for REACT

#### REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Const arrow functions for components, never `React.FC`
- Implement "memo" for expensive components that render often with the same props
- Utilize "lazy" and "Suspense" for code-splitting and performance optimization
- Use the "useCallback" hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer "useMemo" for expensive calculations to avoid recomputation on every render
- Implement "useId" (if relevant) for generating unique IDs for accessibility attributes
- Use the new "use" hooks (if relevant) for data fetching in React 19+ projects  
- Consider using the new "useOptimistic" (if relevant) hook for optimistic UI updates in forms
- Use "useTransition" (if relevant) for non-urgent state updates to keep the UI responsive

Example component:

```typescript
interface WidgetProps {
  title: string;
  count?: number;
}

export const Widget = ({ title, count = 0 }: WidgetProps) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};
```

#### NEXT_JS

- Use App Router and Server Components for improved performance and SEO
- Implement route handlers for API endpoints instead of the pages/api directory
- Use server actions for form handling and data mutations from Server Components
- Leverage Next.js Image component with proper sizing for core web vitals optimization
- Implement the Metadata API for dynamic SEO optimization
- Use React Server Components to reduce client-side JavaScript
- Implement Streaming and Suspense for improved loading states
- Use the new Link component without requiring a child <a> tag
- Leverage parallel routes for complex layouts and parallel data fetching
- Implement intercepting routes for modal patterns and nested UIs

### Imports Order (enforced by ESLint)

1. React
2. External packages
3. Internal modules
4. Parent/sibling imports

## Accessibility

- Use ARIA landmarks to identify regions of the page (main, navigation, search, etc.)
- Apply appropriate ARIA roles to custom interface elements that lack semantic HTML equivalents
- Set aria-expanded and aria-controls for expandable content like accordions and dropdowns
- Use aria-live regions with appropriate politeness settings for dynamic content updates
- Implement aria-hidden to hide decorative or duplicative content from screen readers
- Apply aria-label or aria-labelledby for elements without visible text labels
- Use aria-describedby to associate descriptive text with form inputs or complex elements
- Implement aria-current for indicating the current item in a set, navigation, or process
- Avoid redundant ARIA that duplicates the semantics of native HTML elements
- Apply aria-invalid and appropriate error messaging for form validation

## Forms

- Use `react-hook-form` with `yup` validation via `@hookform/resolvers/yup`
- Prefer `useFormContext` over prop-drilling `control`, `watch`
- Prefer `Controller` over `register` for UI component integration
- All validation messages from i18n (no inline text)

Example schema:

```typescript
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import type { TFunction } from 'react-i18next';
import * as yup from 'yup';

export const featureFormSchema = (t: TFunction) =>
  yup.object({
    field1: yup.string().required(t('common:validator.required')),
    field2: yup.string().min(3, t('common:validator.invalid')),
  });

export interface FeatureFormType extends yup.InferType<ReturnType<typeof featureFormSchema>> {}
```

### Guidelines for STYLING

#### TAILWIND

- Use the @layer directive to organize styles into components, utilities, and base layers
- Implement Just-in-Time (JIT) mode for development efficiency and smaller CSS bundles
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Leverage the @apply directive in component classes to reuse utility combinations
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Use component extraction for repeated UI patterns instead of copying utility classes
- Leverage the theme() function in CSS for accessing Tailwind theme values
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus:, active:, etc.) for interactive elements

## DATABASE

### Guidelines for SQL

#### POSTGRES

- Use connection pooling to manage database connections efficiently
- Implement JSONB columns for semi-structured/flexible data instead of excessive table normalization
- Use materialized views for complex, frequently accessed read-only data

## DEVOPS

### Guidelines for CI_CD

#### GITHUB_ACTIONS

- Check if `package.json` exists in project root and summarize key scripts
- Check if `.nvmrc` exists in project root
- Check if `.env.example` exists in project root to identify key `env:` variables
- Always use terminal command: `git branch -a | cat` to verify whether we use `main` or `master` branch
- Always use `env:` variables and secrets attached to jobs instead of global workflows
- Always use `pnpm i --frozen-lockfile` for Node-based dependency setup
- Extract common steps into composite actions in separate files
- For public actions, verify latest major version via GitHub API before use

## TESTING

### Guidelines for E2E

#### PLAYWRIGHT

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests
- Use locators for resilient element selection
- Leverage API testing for backend validation
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs

### Guidelines for UNIT

#### VITEST

- Leverage the `vi` object for test doubles - Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions, and `vi.stubGlobal()` for global mocks. Prefer spies over mocks when you only need to verify interactions without changing behavior.
- Master `vi.mock()` factory patterns - Place mock factory functions at the top level of your test file, return typed mock implementations, and use `mockImplementation()` or `mockReturnValue()` for dynamic control during tests. Remember the factory runs before imports are processed.
- Create setup files for reusable configuration - Define global mocks, custom matchers, and environment setup in dedicated files referenced in your `vitest.config.ts`. This keeps your test files clean while ensuring consistent test environments.
- Use inline snapshots for readable assertions - Replace complex equality checks with `expect(value).toMatchInlineSnapshot()` to capture expected output directly in your test file, making changes more visible in code reviews.
- Monitor coverage with purpose and only when asked - Configure coverage thresholds in `vitest.config.ts` to ensure critical code paths are tested, but focus on meaningful tests rather than arbitrary coverage percentages.
- Make watch mode part of your workflow - Run `vitest --watch` during development for instant feedback as you modify code, filtering tests with `-t` to focus on specific areas under development.
- Explore UI mode for complex test suites - Use `vitest --ui` to visually navigate large test suites, inspect test results, and debug failures more efficiently during development.
- Handle optional dependencies with smart mocking - Use conditional mocking to test code with optional dependencies by implementing `vi.mock()` with the factory pattern for modules that might not be available in all environments.
- Configure jsdom for DOM testing - Set `environment: 'jsdom'` in your configuration for frontend component tests and combine with testing-library utilities for realistic user interaction simulation.
- Structure tests for maintainability - Group related tests with descriptive `describe` blocks, use explicit assertion messages, and follow the Arrange-Act-Assert pattern to make tests self-documenting.
- Leverage TypeScript type checking in tests - Enable strict typing in your tests to catch type errors early, use `expectTypeOf()` for type-level assertions, and ensure mocks preserve the original type signatures.

## CODING_PRACTICES

### Guidelines for VERSION_CONTROL

#### CONVENTIONAL_COMMITS

- Follow the format: `type(scope): description` for all commit messages
- Use consistent types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Define clear scopes based on project modules to indicate affected areas
- Include issue references in commit messages to link changes to requirements
- Use breaking change footer (`!:` or `BREAKING CHANGE:`) to clearly mark incompatible changes
- Do not include "Generated with Claude Code" or "Co-Authored-By" lines in commits
- Configure commitlint to automatically enforce conventional commit format
