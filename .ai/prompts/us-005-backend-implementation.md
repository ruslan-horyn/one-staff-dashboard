# US-005 Backend Implementation: Temporary Worker Management

## Context

Expert Next.js/TypeScript developer implementing backend server actions for temporary worker management in a multi-tenant staffing agency application.

**Project Stack:**
- Next.js 16 (App Router, Server Actions)
- TypeScript 5
- Supabase (PostgreSQL with RLS)
- Zod (validation)
- Vitest (testing)

**Domain:** US-005 - "As a Coordinator, I want to quickly add and edit temporary worker data to maintain an up-to-date database."

## Source Files

### Primary (must read):
- `docs/prd.md` - Product requirements, US-005 acceptance criteria
- `docs/tech-stack.md` - Technology stack and conventions
- `docs/directory-architecture.md` - Project structure guidelines
- `docs/ui-architecture.md` - UI patterns and component architecture

### Database Schema:
- `supabase/migrations/*_temporary_workers.sql` - Table definition
- `supabase/migrations/*_rls_policies.sql` - RLS policies for multi-tenancy

### Reference Implementation (follow patterns from):
- `services/clients/actions.ts` - CRUD server actions pattern
- `services/clients/schemas.ts` - Zod validation schemas pattern
- `services/shared/action-wrapper.ts` - `createAction()` HOF
- `services/shared/result.ts` - `ActionResult<T>` type
- `services/shared/errors.ts` - Error codes and mappers
- `services/shared/pagination.ts` - Pagination helpers
- `services/shared/query-helpers.ts` - Query builder utilities
- `services/shared/schemas.ts` - Shared validation schemas

### Existing Workers Module:
- `services/workers/schemas.ts` - Already implemented Zod schemas
- `types/worker.ts` - Worker type definitions

## Tasks

### Phase 1: Analysis

1. Read all primary source files to understand:
   - US-005 acceptance criteria and edge cases
   - Directory structure for services
   - Database schema for `temporary_workers` table
   - RLS policies for organization isolation

2. Study the reference implementation in `services/clients/`:
   - `createAction()` wrapper usage pattern
   - Error handling approach
   - Soft delete implementation
   - Pagination pattern for list queries
   - Partial update pattern (filter undefined)

3. Review existing workers module:
   - Existing schemas in `services/workers/schemas.ts`
   - Type definitions in `types/worker.ts`
   - Identify what's missing

### Phase 2: Implementation

Create `/services/workers/actions.ts` with the following server actions:

**1. createWorker**
```typescript
Input: CreateWorkerInput (firstName, lastName, phone)
Output: ActionResult<Worker>
Validation: createWorkerSchema
```
- Extract organization_id from user profile
- Insert worker with organization isolation
- Handle DUPLICATE_ENTRY for unique phone

**2. getWorker**
```typescript
Input: WorkerIdInput (id)
Output: ActionResult<Worker>
Validation: workerIdSchema
```
- Fetch single worker by ID
- Filter soft-deleted records
- RLS enforces organization isolation

**3. getWorkers**
```typescript
Input: WorkerFilter (page, pageSize, search, sortBy, sortOrder, includeDeleted)
Output: ActionResult<PaginatedResult<Worker>>
Validation: workerFilterSchema
```
- Paginated list with search/filter/sort
- Search in firstName, lastName, phone columns
- Use pagination helpers from shared module
- Parallel count + data queries

**4. updateWorker**
```typescript
Input: UpdateWorkerInput (id, firstName?, lastName?, phone?)
Output: ActionResult<Worker>
Validation: updateWorkerSchema
```
- Partial update (only provided fields)
- Filter undefined values before update
- Handle DUPLICATE_ENTRY for phone change

**5. deleteWorker**
```typescript
Input: DeleteWorkerInput (id)
Output: ActionResult<Worker>
Validation: deleteWorkerSchema
```
- Soft delete (set deleted_at)
- Check for active assignments (HAS_DEPENDENCIES error)
- Return deleted record for UI feedback

### Phase 3: Testing

Create `/services/workers/__tests__/actions.test.ts`:

**Test cases for createWorker:**
- Creates worker with valid input
- Returns VALIDATION_ERROR for invalid firstName (empty, too long)
- Returns VALIDATION_ERROR for invalid phone format
- Returns DUPLICATE_ENTRY if phone exists in organization
- Sets correct organization_id from user profile

**Test cases for getWorker:**
- Returns worker by ID
- Returns NOT_FOUND for non-existent ID
- Returns NOT_FOUND for soft-deleted worker
- RLS prevents access to other organization's workers

**Test cases for getWorkers:**
- Returns paginated results
- Filters by search text (matches firstName, lastName, phone)
- Sorts by name, created_at
- Respects includeDeleted flag
- Returns empty page when no results

**Test cases for updateWorker:**
- Updates with all fields provided
- Updates with partial fields (only firstName)
- Returns NOT_FOUND for non-existent worker
- Returns DUPLICATE_ENTRY for duplicate phone

**Test cases for deleteWorker:**
- Soft deletes worker (sets deleted_at)
- Returns NOT_FOUND for non-existent worker
- Returns HAS_DEPENDENCIES if worker has active assignments

### Phase 4: Barrel Exports

Update `/services/workers/index.ts`:
- Export all actions
- Export all schemas
- Export all types

## Output Format

### File Structure
```
services/workers/
├── actions.ts        # NEW: Server actions
├── schemas.ts        # EXISTS: Zod schemas
├── index.ts          # UPDATE: Barrel exports
└── __tests__/
    └── actions.test.ts  # NEW: Unit tests
```

### Action Template
```typescript
'use server';

import { createAction } from '@/services/shared';
import { createWorkerSchema, type CreateWorkerInput } from './schemas';
import type { Tables } from '@/types/database';

type Worker = Tables<'temporary_workers'>;

export const createWorker = createAction<CreateWorkerInput, Worker>(
  async (input, { supabase, user }) => {
    // Implementation
  },
  { schema: createWorkerSchema }
);
```

### Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWorker, getWorker, getWorkers, updateWorker, deleteWorker } from '../actions';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('workers actions', () => {
  describe('createWorker', () => {
    it('should create worker with valid input', async () => {
      // Arrange, Act, Assert
    });
  });
});
```

## Success Criteria

### Measurable Goals
- [ ] All 5 server actions implemented and exported
- [ ] All actions pass TypeScript compilation (`pnpm build`)
- [ ] All actions use `createAction()` wrapper correctly
- [ ] Soft delete pattern used for deleteWorker
- [ ] Pagination implemented for getWorkers using shared helpers
- [ ] Unit tests achieve 90%+ coverage for actions.ts
- [ ] All tests pass (`pnpm test`)

### Validation Method
- Run `pnpm build` - no type errors
- Run `pnpm test services/workers` - all tests pass
- Run `pnpm test:coverage` - verify 90%+ coverage
- Manual test: Create, read, update, delete worker via UI

## Constraints

- DO NOT modify existing `schemas.ts` - schemas are already complete
- DO NOT create new database migrations - schema already exists
- DO NOT add new dependencies - use existing packages only
- DO NOT implement UI components - backend only
- MUST use `createAction()` wrapper for all actions
- MUST follow soft delete pattern (set deleted_at, not hard delete)
- MUST return `ActionResult<T>` from all actions
- MUST use shared pagination helpers for list queries
- MUST mock Supabase in tests - no real database calls
- MUST follow existing code patterns from `services/clients/`
