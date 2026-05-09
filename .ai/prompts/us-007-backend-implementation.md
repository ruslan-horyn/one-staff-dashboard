# US-007: Positions & Assignment Creation - Backend Implementation

## Context

Senior TypeScript/Next.js developer implementing server actions for two related modules:
1. **Positions Module** - CRUD for positions at work locations
2. **Assignments Module** - Create assignment action (assigning workers to positions)

These modules enable the core workflow: creating positions at work locations and assigning temporary workers to them.

**Project Stack:**
- Next.js 16 (App Router, Server Actions)
- TypeScript 5
- Supabase (PostgreSQL + RLS)
- Zod 4 (validation)

## Source Files

### Primary (must read):
- `services/clients/actions.ts` - Reference CRUD implementation pattern
- `services/positions/schemas.ts` - Existing Zod schemas for positions
- `services/assignments/schemas.ts` - Existing Zod schemas for assignments
- `types/database.ts` - Database types (`positions`, `assignments` tables)
- `types/position.ts` - Position entity types
- `types/assignment.ts` - Assignment entity types

### Reference (read as needed):
- `services/shared/action-wrapper.ts` - `createAction()` HOF wrapper
- `services/shared/pagination.ts` - Pagination helpers
- `services/shared/query-helpers.ts` - Search, sort, soft-delete helpers
- `docs/server-actions-plan.md` - Full action specifications

## Tasks

### Phase 1: Analysis

1. Read `types/database.ts` for table structures:
   - `positions`: id, name, work_location_id, is_active, created_at, updated_at, deleted_at
   - `assignments`: id, worker_id, position_id, start_at, end_at, status, created_by, ended_by, cancelled_by, created_at, updated_at

2. Understand relationships:
   - Position -> WorkLocation -> Client -> Organization (RLS chain)
   - Assignment -> Position (for location context)
   - Assignment -> Worker (for worker assignment)
   - Assignment -> Profile (created_by, ended_by, cancelled_by)

3. Review PRD US-007 acceptance criteria:
   - Create position at work location (simple text field)
   - Assign worker to position with start datetime
   - Optional end datetime
   - Overlapping assignments are ALLOWED (no blocking validation)

### Phase 2: Positions Module Implementation

Create `services/positions/actions.ts` with these server actions:

#### 1. createPosition
- **Input:** `CreatePositionInput` (workLocationId, name)
- **Output:** `Position`
- **Logic:**
  - Insert position linked to work location
  - RLS handles organization scoping via work_location -> client chain
- **Schema:** `createPositionSchema`

#### 2. getPosition
- **Input:** `PositionIdInput` (id)
- **Output:** `Position`
- **Logic:**
  - Select by ID where `deleted_at` is null
- **Schema:** `positionIdSchema`

#### 3. getPositions
- **Input:** `PositionFilter` (page, pageSize, search, workLocationId?, isActive?, sortBy, sortOrder, includeDeleted)
- **Output:** `PaginatedResult<Position>`
- **Logic:**
  - Build count and data queries in parallel
  - Apply filters: soft-delete, work location, active status, search (name only)
  - Apply sorting and pagination
- **Schema:** `positionFilterSchema`

#### 4. updatePosition
- **Input:** `UpdatePositionInput` (id, name?, isActive?)
- **Output:** `Position`
- **Logic:**
  - Filter undefined values
  - Update where `deleted_at` is null
- **Schema:** `updatePositionSchema`

#### 5. deletePosition
- **Input:** `DeletePositionInput` (id)
- **Output:** `Position`
- **Logic:**
  - Soft delete by setting `deleted_at`
  - Note: Consider checking for active assignments (HAS_DEPENDENCIES)
- **Schema:** `deletePositionSchema`

### Phase 3: Assignment Create Action

Create `services/assignments/actions.ts` with initial action:

#### createAssignment
- **Input:** `CreateAssignmentInput` (workerId, positionId, startAt, endAt?)
- **Output:** `Assignment`
- **Logic:**
  - Get current user ID for `created_by` field
  - Insert assignment with status 'scheduled'
  - DO NOT block overlapping assignments (per PRD requirement)
  - RLS handles organization scoping via position -> work_location -> client chain
- **Schema:** `createAssignmentSchema`

#### getAssignment
- **Input:** `AssignmentIdInput` (id)
- **Output:** `Assignment`
- **Logic:**
  - Select by ID
  - Join worker, position info for details view
- **Schema:** `assignmentIdSchema`

#### getAssignments
- **Input:** `AssignmentFilter` (page, pageSize, workerId?, positionId?, status[], dateFrom?, dateTo?, sortBy, sortOrder)
- **Output:** `PaginatedResult<Assignment>`
- **Logic:**
  - Build count and data queries in parallel
  - Apply filters: worker, position, status array, date range
  - Apply sorting and pagination
- **Schema:** `assignmentFilterSchema`

### Phase 4: Finalization

1. Add searchable columns constant to positions schemas:
   ```typescript
   export const POSITION_SEARCHABLE_COLUMNS = ['name'] as const;
   ```

2. Update barrel exports:
   - `services/positions/index.ts`
   - `services/assignments/index.ts`

3. Verify TypeScript compilation with `pnpm tsc --noEmit`

### Phase 5: Unit Testing

Create test files in `__tests__` folders for both modules.

#### Positions Tests: `services/positions/__tests__/actions.test.ts`

**Test Setup:**
```typescript
import type { PostgrestError, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@/services/shared/errors';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase client with chainable query builder
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockIs = vi.fn();
const mockSingle = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();

const mockSupabaseQuery = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  is: mockIs,
  single: mockSingle,
  or: mockOr,
  order: mockOrder,
  range: mockRange,
};

Object.values(mockSupabaseQuery).forEach((mock) => {
  mock.mockReturnValue(mockSupabaseQuery);
});

const mockGetUser = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: vi.fn(() => mockSupabaseQuery),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

const mockPosition = {
  id: 'position-123',
  work_location_id: 'location-456',
  name: 'Warehouse Worker',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};
```

**Test Cases for Positions:**

**createPosition:**
- Returns success when valid input provided
- Returns VALIDATION_ERROR for missing name
- Returns VALIDATION_ERROR for invalid workLocationId
- Returns NOT_FOUND when work location doesn't exist

**getPosition:**
- Returns position when found
- Returns NOT_FOUND for non-existent ID
- Returns NOT_FOUND for soft-deleted position

**getPositions:**
- Returns paginated results
- Filters by workLocationId
- Filters by isActive status
- Applies search filter on name
- Excludes soft-deleted by default

**updatePosition:**
- Updates name when provided
- Updates isActive when provided
- Returns NOT_FOUND for non-existent ID

**deletePosition:**
- Soft deletes position
- Returns NOT_FOUND for non-existent ID

#### Assignments Tests: `services/assignments/__tests__/actions.test.ts`

**Additional Mock Setup for Assignments:**
```typescript
const mockAssignment = {
  id: 'assignment-123',
  worker_id: 'worker-456',
  position_id: 'position-789',
  start_at: '2024-01-15T08:00:00Z',
  end_at: null,
  status: 'scheduled',
  created_by: 'user-123',
  ended_by: null,
  cancelled_by: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};
```

**Test Cases for createAssignment:**
- Returns success with valid input
- Sets status to 'scheduled' automatically
- Sets created_by to current user ID
- Accepts optional endAt parameter
- Returns VALIDATION_ERROR for missing workerId
- Returns VALIDATION_ERROR for missing positionId
- Returns VALIDATION_ERROR for missing startAt
- Returns VALIDATION_ERROR when endAt is before startAt
- Returns NOT_FOUND when worker doesn't exist
- Returns NOT_FOUND when position doesn't exist
- DOES NOT block overlapping assignments (verify no overlap check)

**Test Cases for getAssignment:**
- Returns assignment when found
- Returns NOT_FOUND for non-existent ID

**Test Cases for getAssignments:**
- Returns paginated results
- Filters by workerId
- Filters by positionId
- Filters by status array
- Filters by date range (dateFrom, dateTo)
- Applies sorting by start_at

**Example Test:**
```typescript
describe('createAssignment', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    Object.values(mockSupabaseQuery).forEach((mock) => mock.mockClear());
    Object.values(mockSupabaseQuery).forEach((mock) =>
      mock.mockReturnValue(mockSupabaseQuery)
    );
  });

  it('creates assignment with status scheduled', async () => {
    mockSingle.mockResolvedValue({ data: mockAssignment, error: null });

    const result = await createAssignment({
      workerId: 'worker-456',
      positionId: 'position-789',
      startAt: '2024-01-15T08:00:00Z',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('scheduled');
      expect(result.data.created_by).toBe('user-123');
    }

    // Verify insert was called with correct data
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        worker_id: 'worker-456',
        position_id: 'position-789',
        status: 'scheduled',
        created_by: 'user-123',
      })
    );
  });

  it('allows overlapping assignments', async () => {
    // This test verifies NO overlap blocking exists
    mockSingle.mockResolvedValue({ data: mockAssignment, error: null });

    const result = await createAssignment({
      workerId: 'worker-456',
      positionId: 'position-789',
      startAt: '2024-01-15T08:00:00Z',
    });

    expect(result.success).toBe(true);
    // Verify no RPC call for overlap check
    expect(mockSupabase.rpc).not.toHaveBeenCalled?.();
  });

  it('returns VALIDATION_ERROR when endAt before startAt', async () => {
    const result = await createAssignment({
      workerId: 'worker-456',
      positionId: 'position-789',
      startAt: '2024-01-15T17:00:00Z',
      endAt: '2024-01-15T08:00:00Z', // Before start
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });
});
```

## Output Format

### positions/actions.ts Structure

```typescript
'use server';

import {
  applyPaginationToQuery,
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  paginateResult,
} from '@/services/shared/pagination';
import {
  applySearchFilter,
  applySoftDeleteFilter,
  applySortFilter,
  buildSearchFilter,
} from '@/services/shared/query-helpers';
import type { Position } from '@/types';
import { createAction } from '../shared/action-wrapper';
import {
  POSITION_SEARCHABLE_COLUMNS,
  type CreatePositionInput,
  type DeletePositionInput,
  type PositionFilter,
  type PositionIdInput,
  type UpdatePositionInput,
  createPositionSchema,
  deletePositionSchema,
  positionFilterSchema,
  positionIdSchema,
  updatePositionSchema,
} from './schemas';

/**
 * Creates a new position at a work location.
 */
export const createPosition = createAction<CreatePositionInput, Position>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .from('positions')
      .insert({
        work_location_id: input.workLocationId,
        name: input.name,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: createPositionSchema }
);

// ... remaining position actions
```

### assignments/actions.ts Structure

```typescript
'use server';

import type { Assignment } from '@/types';
import { createAction } from '../shared/action-wrapper';
import {
  type CreateAssignmentInput,
  createAssignmentSchema,
} from './schemas';

/**
 * Creates a new assignment for a worker to a position.
 * Note: Overlapping assignments are allowed per PRD requirements.
 */
export const createAssignment = createAction<CreateAssignmentInput, Assignment>(
  async (input, { supabase, user }) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        worker_id: input.workerId,
        position_id: input.positionId,
        start_at: input.startAt,
        end_at: input.endAt ?? null,
        created_by: user.id,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: createAssignmentSchema }
);

// ... getAssignment, getAssignments
```

## Success Criteria

### Measurable Goals
- [ ] All 5 position actions created and exported
- [ ] createAssignment, getAssignment, getAssignments actions created
- [ ] `pnpm tsc --noEmit` passes without errors
- [ ] Schema field mappings match database column names (camelCase -> snake_case)
- [ ] created_by populated from authenticated user
- [ ] Unit tests created in `services/positions/__tests__/actions.test.ts`
- [ ] Unit tests created in `services/assignments/__tests__/actions.test.ts`
- [ ] `pnpm test services/positions services/assignments` passes all tests
- [ ] Minimum 80% code coverage for both actions.ts files

### Validation Method
- Run TypeScript compiler to verify types
- Verify assignment creation uses user.id for created_by
- Confirm no overlap blocking logic (per PRD)
- Run `pnpm test:coverage` to verify coverage threshold

## Constraints

- DO NOT add overlap blocking logic - coordinators manage this manually
- DO NOT modify schemas except adding POSITION_SEARCHABLE_COLUMNS
- DO NOT implement endAssignment or cancelAssignment (separate US-009/US-010)
- PRESERVE JSDoc comments on all exported functions
- MAP camelCase input fields to snake_case database columns
- TESTS must be in respective `__tests__/actions.test.ts` files
- DO NOT use `beforeEach(() => { vi.clearAllMocks() })` - `restoreMocks: true` handles this
