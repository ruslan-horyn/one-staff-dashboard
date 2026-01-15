# Directory Architecture - One Staff Dashboard

## Full Directory Tree

```
one-staff-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Group for unauthenticated users
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Group for authenticated users
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── workers/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── clients/
│   │   ├── locations/
│   │   ├── assignments/
│   │   └── reports/
│   ├── api/                      # Route handlers
│   │   ├── workers/route.ts
│   │   ├── clients/route.ts
│   │   ├── locations/route.ts
│   │   ├── assignments/route.ts
│   │   └── reports/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── data-table/           # Data table components (grouped)
│   │   │   ├── __tests__/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-column-header.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-skeleton.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   └── index.ts
│   ├── features/                 # Domain-specific components
│   │   ├── workers/index.ts
│   │   ├── clients/index.ts
│   │   ├── locations/index.ts
│   │   ├── assignments/index.ts
│   │   └── reports/index.ts
│   └── forms/                    # Forms
│       └── index.ts
├── hooks/                        # Custom React hooks
│   └── index.ts
├── stores/                       # Zustand stores
│   └── index.ts
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase types (auto-generated)
│   ├── common.ts                 # Enums, pagination, sort params
│   ├── auth.ts                   # Auth user types
│   ├── organization.ts           # Organization entity and DTOs
│   ├── client.ts                 # Client entity and DTOs
│   ├── work-location.ts          # WorkLocation entity and DTOs
│   ├── position.ts               # Position entity and DTOs
│   ├── worker.ts                 # Worker entity and DTOs
│   ├── assignment.ts             # Assignment entity and DTOs
│   ├── report.ts                 # Report filter and summary types
│   └── index.ts                  # Barrel exports
├── services/                     # Server actions, queries, validation
│   ├── shared/                   # Shared utilities
│   │   ├── __tests__/            # Unit tests for shared module
│   │   ├── result.ts             # ActionResult<T> type and helpers
│   │   ├── errors.ts             # Error codes and Supabase/Zod mapping
│   │   ├── auth.ts               # Session checking utilities
│   │   ├── action-wrapper.ts     # createAction() HOF wrapper
│   │   ├── schemas.ts            # Shared Zod schemas
│   │   ├── pagination.ts         # Pagination helpers
│   │   └── index.ts
│   ├── auth/                     # Auth module
│   │   ├── actions.ts            # Server actions (signIn, signOut, signUp)
│   │   ├── queries.ts            # Data fetching (getCurrentUser)
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── index.ts
│   ├── organizations/            # Organizations module
│   │   ├── actions.ts            # Server actions (get, update)
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── index.ts
│   ├── users/                    # Users module (admin only)
│   │   ├── actions.ts            # Server actions (getUsers, invite, deactivate)
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── index.ts
│   ├── clients/                  # Clients module (admin only)
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── work-locations/           # Work locations module
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── positions/                # Positions module
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── workers/                  # Workers module
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── assignments/              # Assignments module
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── reports/                  # Reports module
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   └── index.ts
├── utils/                        # Pure utilities
│   └── index.ts
├── lib/                          # Configurations and clients
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   └── cn.ts
│   └── env.ts
├── __mocks__/                    # Test mocks (MSW handlers)
├── e2e/                          # Playwright E2E tests
├── docs/
│   ├── prd.md                    # Product Requirements Document
│   ├── tech-stack.md             # Technology stack
│   └── directory-architecture.md # This file
├── proxy.ts                      # Next.js 16 proxy (auth guard)
└── ... (config files)
```

## Directory Descriptions

### /app - Next.js App Router

Application routing and pages. Uses route groups for different layouts.

- `(auth)/` - pages for unauthenticated users (login)
- `(dashboard)/` - pages for authenticated users
- `api/` - Route handlers (REST API)

### /components - React Components

- `ui/` - Base, reusable UI components (Button, Input, Modal, Table)
- `layout/` - Page structure components (Header, Sidebar, Footer)
- `features/` - Domain-specific components, per feature
- `forms/` - Forms with react-hook-form

### /hooks - Custom React Hooks

Hooks for data fetching, local state management, helpers.

### /stores - Zustand Stores

Global stores for application state.

### /types - TypeScript Types & DTOs

Type definitions organized by domain entity. Each entity file follows a consistent pattern:

**Type Categories:**

1. **Base Entity Types** - Direct database table types derived from Supabase

   ```typescript
   export type Worker = Tables<'temporary_workers'>;
   ```

2. **Extended DTOs** - Entities with computed fields and relations

   ```typescript
   export interface WorkerWithStats extends Worker {
     totalHours: number;
     activeAssignments: number;
     assignedLocations: string[];
   }
   ```

> **Note:** Input/command types (e.g., `CreateWorkerInput`) are defined in `/services/[module]/schemas.ts` and inferred from Zod schemas. This ensures validation rules and types stay in sync.

**File Structure:**

- `database.ts` - Auto-generated Supabase types (run `pnpm supabase gen types`)
- `common.ts` - Shared types: enums (`UserRole`, `AssignmentStatus`), pagination, sort params
- `auth.ts` - `Profile` entity type
- `organization.ts` - `Organization` entity, `OrganizationWithStats` DTO
- `client.ts` - `Client` entity, `ClientWithLocations` DTO
- `work-location.ts` - `WorkLocation` entity, `WorkLocationWithClient`, `WorkLocationWithPositions` DTOs
- `position.ts` - `Position` entity, `PositionWithLocation` DTO
- `worker.ts` - `Worker` entity, `WorkerWithStats`, `WorkerWithAssignments` DTOs
- `assignment.ts` - `Assignment`, `AuditLogEntry` entities, `AssignmentWithDetails` DTO
- `report.ts` - `HoursReportData` DTO for hours reports

### /services - Server Actions & Data Layer

Modular structure for server-side operations. Each domain module contains:

- `actions.ts` - Server actions (mutations) with `'use server'` directive
- `queries.ts` - Data fetching functions for Server Components
- `schemas.ts` - Zod validation schemas for input validation
- `index.ts` - Barrel exports

**Shared utilities** (`/services/shared/`):

- `result.ts` - `ActionResult<T>` type, `success()`, `failure()`, `isSuccess()`, `isFailure()` helpers
- `errors.ts` - `ErrorCodes`, `mapSupabaseError()`, `mapZodError()`, `mapAuthError()`
- `auth.ts` - `getSession()`, `requireSession()`, `AuthenticationError`
- `action-wrapper.ts` - `createAction()` HOF for wrapping server actions with validation and auth
- `schemas.ts` - Shared Zod schemas (UUID, phone, email, pagination, date ranges)
- `pagination.ts` - Pagination types (`PaginatedResult<T>`, `PaginationMeta`) and helpers (`calculateOffset`, `calculateTotalPages`, `createPaginationMeta`, `paginateResult`, `applyPaginationToQuery`)

### /utils - Pure Utilities

Pure helper functions (formatting, validation, export).

### /lib - Configurations

External service clients (Supabase), environment configuration.

### Unit Tests (**tests**/ Folders)

`.test.ts` / `.test.tsx` files placed in `__tests__/` subfolder within each module:

- `components/ui/Button.tsx` → `components/ui/__tests__/Button.test.tsx`
- `hooks/useAuth.ts` → `hooks/__tests__/useAuth.test.ts`
- `services/shared/result.ts` → `services/shared/__tests__/result.test.ts`

### /e2e - E2E Tests

Playwright end-to-end tests.

### /**mocks** - Test Mocks

MSW handlers, Supabase service mocks.

## Import Examples

```typescript
// Components
import { Button } from '@/components/ui';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { WorkerCard } from '@/components/features/workers';

// Hooks & Stores
import { useWorkers } from '@/hooks';
import { useAuthStore } from '@/stores';

// Types - Base entities
import type { Worker, Client, Assignment, Organization } from '@/types';

// Types - Extended DTOs (with relations/computed fields)
import type { WorkerWithStats, WorkerWithAssignments, OrganizationWithStats } from '@/types';
import type { AssignmentWithDetails } from '@/types';

// Types - Common utilities
import type { PaginationParams, SortParams, UserRole } from '@/types';

// Server Actions & Queries
import { createWorker, updateWorker } from '@/services/workers/actions';
import { getWorkers, getWorkerById } from '@/services/workers/queries';
import { getOrganization, updateOrganization } from '@/services/organizations/actions';
import { getUsers, inviteUser, deactivateUser } from '@/services/users/actions';

// Validation Schemas & Input Types (from services)
import { createWorkerSchema } from '@/services/workers/schemas';
import type { CreateWorkerInput, UpdateWorkerInput } from '@/services/workers';

// Pagination helpers
import { paginateResult, calculateOffset, DEFAULT_PAGE_SIZE } from '@/services/shared';
import type { PaginatedResult, PaginationMeta } from '@/services/shared';

// Utilities
import { formatDate } from '@/utils';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
```

## Checklist: Where to Place a New File?

| File Type                      | Location                                  |
| ------------------------------ | ----------------------------------------- |
| UI Component (Button, Modal)   | `/components/ui/`                         |
| Layout Component               | `/components/layout/`                     |
| Domain Component               | `/components/features/[domain]/`          |
| Form                           | `/components/forms/`                      |
| Custom Hook                    | `/hooks/`                                 |
| Zustand Store                  | `/stores/`                                |
| Entity Type / DTO              | `/types/[entity].ts`                      |
| Zod Schema + Input Types       | `/services/[module]/schemas.ts`           |
| Server Action                  | `/services/[module]/actions.ts`           |
| Server Query                   | `/services/[module]/queries.ts`           |
| Utility Function               | `/utils/`                                 |
| API Endpoint (REST)            | `/app/api/[resource]/route.ts`            |
| Page                           | `/app/(dashboard)/[resource]/page.tsx`    |
| Unit Test                      | `[module]/__tests__/[file].test.ts(x)`    |
| E2E Test                       | `/e2e/`                                   |

## Server vs Client Components

- **Server Components by default** (without `'use client'`)
- **Client Components** only when needed:
  - Interactivity (onClick, onChange)
  - React hooks (useState, useEffect)
  - Browser API (window, localStorage)
- Client/server boundary marked in component structure

## Naming Conventions

| Type              | Convention                    | Example               |
| ----------------- | ----------------------------- | --------------------- |
| Components        | PascalCase                    | `WorkerCard.tsx`      |
| Hooks             | camelCase + `use` prefix      | `useWorkers.ts`       |
| Utils/lib         | camelCase                     | `formatDate.ts`       |
| Types             | PascalCase file, lowercase    | `worker.ts`           |
| Server Actions    | camelCase                     | `actions.ts`          |
| Server Queries    | camelCase                     | `queries.ts`          |
| Zod Schemas       | camelCase + `Schema` suffix   | `createWorkerSchema`  |
| Tests             | `.test.ts` or `.test.tsx`     | `Button.test.tsx`     |

## Updating Supabase Types

After changes to the database schema, generate new types:

```bash
pnpm supabase gen types typescript --local > types/database.ts
```
