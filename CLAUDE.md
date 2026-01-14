# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Required Reading

**IMPORTANT:** Before starting any task, always read the following documentation files:

- `docs/prd.md` - Product Requirements Document with user stories and acceptance criteria
- `docs/tech-stack.md` - Technology stack and tools used in the project
- `docs/directory-architecture.md` - Project structure and file organization guidelines
- `docs/commit-conventions.md` - Commit message format and conventions (MUST follow when committing)

These files contain essential context about the project's requirements, architecture, and conventions.

## Project Overview

One Staff Dashboard is an internal MVP web application for a temporary staffing agency. It replaces manual spreadsheet-based processes by centralizing management of temporary workers, clients, work locations, and schedules. Key features include worker assignment to positions, availability tracking, and worked hours reporting.

## Development Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start development server
pnpm build           # Production build
pnpm start           # Run production server
pnpm lint            # Run Biome linter (check mode)
pnpm lint:fix        # Run Biome linter with auto-fix
pnpm format          # Run Biome formatter
pnpm test            # Run Vitest once
pnpm test:ui         # Run Vitest with UI
pnpm test:coverage   # Run Vitest with coverage
pnpm test:watch      # Run Vitest in watch mode
pnpm test:changed    # Run tests with coverage for staged files (used in pre-commit)
```

**Note:** Uses pnpm as package manager. Node.js v24.11.1 (see .nvmrc).

Future commands (not yet configured):

```bash
pnpm test:e2e        # Run Playwright E2E tests
```

## Tech Stack

**Currently Installed:**

- Next.js 16 (app router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Biome (linting + formatting)
- Supabase (PostgreSQL + JWT auth)
- Zod (validation for forms and server actions)
- Lucide React (icons)
- Vitest + React Testing Library + MSW (testing)
- react-hook-form (forms)

**Planned (not yet added):**

- Zustand (state management)
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
- CI/CD via GitHub Actions with Vercel hosting

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

#### NEXT_JS_PROXY

Next.js 16 renamed `middleware.ts` to `proxy.ts` to clarify its purpose as a network boundary/routing layer.

**Key Changes from Middleware:**

- File renamed: `middleware.ts` → `proxy.ts`
- Export renamed: `middleware()` → `proxy()`
- Config flags renamed: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

**Usage:**

- Located at project root (same level as `app/` or `pages/`)
- Only one `proxy.ts` file per project
- Can import helper modules for organization

**Project Implementation (`proxy.ts`):**

```typescript
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Session Handling (`lib/supabase/proxy.ts`):**

The `updateSession()` function:
1. Creates Supabase client with cookie access from the request
2. Calls `getUser()` to validate and refresh JWT token
3. Redirects unauthenticated users to `/login` for protected routes
4. Redirects authenticated users away from public auth pages to `/dashboard`
5. Returns response with updated cookies

**Reference:** [Next.js 16 Proxy Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

### Imports Order (enforced by Biome)

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

- Use `react-hook-form` with `zod` validation via `@hookform/resolvers/zod`
- Prefer `useFormContext` over prop-drilling `control`, `watch`
- Prefer `Controller` over `register` for UI component integration
- Schemas are defined in `/services/[module]/schemas.ts` and shared between client and server
- All validation messages from i18n (no inline text)

Example schema:

```typescript
// /services/workers/schemas.ts
import { z } from 'zod';

export const createWorkerSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  phone: z.string().min(9).max(20),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
```

Example form usage:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createWorkerSchema, type CreateWorkerInput } from '@/services/workers/schemas';

const form = useForm<CreateWorkerInput>({
  resolver: zodResolver(createWorkerSchema),
  defaultValues: { firstName: '', lastName: '', phone: '' },
});
```

## Server Actions

Server actions use the `createAction()` wrapper from `/services/shared/` for consistent error handling, validation, and authentication.

### Creating Server Actions

```typescript
// /services/workers/actions.ts
'use server';

import { createAction } from '@/services/shared';
import { createWorkerSchema, type CreateWorkerInput } from './schemas';
import type { Tables } from '@/types/database';

type Worker = Tables<'temporary_workers'>;

export const createWorker = createAction<CreateWorkerInput, Worker>(
  async (input, { supabase, user }) => {
    const { data, error } = await supabase
      .from('temporary_workers')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      })
      .select()
      .single();

    if (error) throw error; // Automatically mapped to ActionError
    return data;
  },
  { schema: createWorkerSchema } // Optional: Zod validation
);
```

### ActionResult Type

All server actions return `ActionResult<T>`:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

interface ActionError {
  code: string;    // e.g., 'NOT_FOUND', 'VALIDATION_ERROR'
  message: string; // Human-readable message
  details?: Record<string, unknown>; // Field errors, etc.
}
```

### Handling Results

```typescript
import { isSuccess, isFailure } from '@/services/shared';

const result = await createWorker(input);

if (isSuccess(result)) {
  // result.data is typed as Worker
  console.log(result.data.id);
} else {
  // result.error is typed as ActionError
  console.log(result.error.code, result.error.message);
}
```

### Error Codes

Available error codes from `ErrorCodes`:

| Code | Description |
|------|-------------|
| `NOT_AUTHENTICATED` | User not logged in |
| `FORBIDDEN` | User lacks permission |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Unique constraint violation |
| `HAS_DEPENDENCIES` | Cannot delete (foreign key) |
| `DATABASE_ERROR` | Unexpected database error |
| `INTERNAL_ERROR` | Unexpected application error |

### Pagination Helpers

Use pagination helpers from `/services/shared/pagination.ts` for paginated queries:

```typescript
import { paginateResult, applyPaginationToQuery, DEFAULT_PAGE_SIZE } from '@/services/shared';
import type { PaginatedResult } from '@/services/shared';

// In a query function
export async function getWorkers(params: WorkerFilter): Promise<PaginatedResult<Worker>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;

  // Get total count
  const { count } = await supabase
    .from('temporary_workers')
    .select('*', { count: 'exact', head: true });

  // Get paginated data using helper
  const query = supabase.from('temporary_workers').select('*');
  const { data, error } = await applyPaginationToQuery(query, page, pageSize);

  if (error) throw error;
  return paginateResult(data ?? [], count ?? 0, page, pageSize);
}
```

**Available helpers:**

| Function | Description |
|----------|-------------|
| `calculateOffset(page, pageSize)` | Converts page/pageSize to SQL offset |
| `calculateTotalPages(totalItems, pageSize)` | Calculates total pages |
| `createPaginationMeta(params)` | Creates full pagination metadata |
| `paginateResult(data, totalItems, page, pageSize)` | Wraps data in `PaginatedResult<T>` |
| `applyPaginationToQuery(query, page, pageSize)` | Adds `.range()` to Supabase query |

**Constants:** `DEFAULT_PAGE_SIZE` (20), `MAX_PAGE_SIZE` (100)

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

- **No manual mock cleanup needed** - `restoreMocks: true` is configured in `vitest.config.mts`, so mocks are automatically reset after each test. Do NOT add `beforeEach(() => { vi.clearAllMocks(); })` to tests.
- Leverage the `vi` object for test doubles - Use `vi.fn()` for function mocks, `vi.spyOn()` to monitor existing functions, and `vi.stubGlobal()` for global mocks. Prefer spies over mocks when you only need to verify interactions without changing behavior.
- Master `vi.mock()` factory patterns - Place mock factory functions at the top level of your test file, return typed mock implementations, and use `mockImplementation()` or `mockReturnValue()` for dynamic control during tests. Remember the factory runs before imports are processed.
- Create setup files for reusable configuration - Define global mocks, custom matchers, and environment setup in dedicated files referenced in your `vitest.config.ts`. This keeps your test files clean while ensuring consistent test environments.
- Use inline snapshots for readable assertions - Replace complex equality checks with `expect(value).toMatchInlineSnapshot()` to capture expected output directly in your test file, making changes more visible in code reviews.
- Monitor coverage with purpose and only when asked - Configure coverage thresholds in `vitest.config.ts` to ensure critical code paths are tested, but focus on meaningful tests rather than arbitrary coverage percentages.
- **Pre-commit coverage** - The pre-commit hook runs coverage checks only for staged files with 90% threshold. New code must have tests before committing.
- Make watch mode part of your workflow - Run `vitest --watch` during development for instant feedback as you modify code, filtering tests with `-t` to focus on specific areas under development.
- Explore UI mode for complex test suites - Use `vitest --ui` to visually navigate large test suites, inspect test results, and debug failures more efficiently during development.
- Handle optional dependencies with smart mocking - Use conditional mocking to test code with optional dependencies by implementing `vi.mock()` with the factory pattern for modules that might not be available in all environments.
- Configure jsdom for DOM testing - Set `environment: 'jsdom'` in your configuration for frontend component tests and combine with testing-library utilities for realistic user interaction simulation.
- Structure tests for maintainability - Group related tests with descriptive `describe` blocks, use explicit assertion messages, and follow the Arrange-Act-Assert pattern to make tests self-documenting.
- Leverage TypeScript type checking in tests - Enable strict typing in your tests to catch type errors early, use `expectTypeOf()` for type-level assertions, and ensure mocks preserve the original type signatures.

## CODING_PRACTICES

### Guidelines for VERSION_CONTROL

#### CONVENTIONAL_COMMITS

**MANDATORY:** All commits MUST follow the Conventional Commits format. Commits that don't follow this format will be rejected by the commitlint hook.

**Format:** `type(scope): description`

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Project scopes:** `workers`, `clients`, `locations`, `positions`, `assignments`, `reports`, `auth`, `ui`, `api`, `db`, `deps`, `config`

**Rules:**

- Type and scope MUST be lowercase
- Description MUST start with lowercase letter
- Description MUST NOT end with a period
- Use `!` after type/scope for breaking changes (e.g., `feat(api)!: change format`)
- Do NOT include "Generated with Claude Code" or "Co-Authored-By" lines
- Reference issues in footer when applicable (e.g., `Closes #123`)

**Examples:**

```bash
feat(workers): add bulk import functionality
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
refactor(assignments)!: change data structure
```

See `docs/commit-conventions.md` for complete reference.
