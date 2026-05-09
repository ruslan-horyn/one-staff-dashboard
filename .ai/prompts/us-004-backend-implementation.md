# US-004: Work Location Management - Backend Implementation

## Context

Senior TypeScript/Next.js developer implementing server actions for the Work Location Management module. This module provides CRUD operations for work locations linked to clients, following the established patterns from the Clients module.

**Project Stack:**
- Next.js 16 (App Router, Server Actions)
- TypeScript 5
- Supabase (PostgreSQL + RLS)
- Zod 4 (validation)

## Source Files

### Primary (must read):
- `services/clients/actions.ts` - Reference implementation pattern
- `services/work-locations/schemas.ts` - Existing Zod schemas (already defined)
- `types/database.ts` - Database types (`work_locations` table structure)
- `types/work-location.ts` - Entity types and DTOs

### Reference (read as needed):
- `services/shared/action-wrapper.ts` - `createAction()` HOF wrapper
- `services/shared/pagination.ts` - Pagination helpers
- `services/shared/query-helpers.ts` - Search, sort, soft-delete helpers
- `services/shared/schemas.ts` - Shared validation schemas
- `docs/server-actions-plan.md` - Full action specifications

## Tasks

### Phase 1: Analysis

1. Read `services/clients/actions.ts` to understand the established pattern for CRUD actions
2. Read `services/work-locations/schemas.ts` to verify existing schema definitions
3. Read `types/database.ts` to understand the `work_locations` table structure:
   - `id`, `name`, `address`, `email` (nullable), `phone` (nullable)
   - `client_id` (FK to clients), `created_at`, `updated_at`, `deleted_at`
4. Confirm RLS policies scope data to user's organization via `client_id` -> `clients.organization_id`

### Phase 2: Implementation

Create `services/work-locations/actions.ts` with these server actions:

#### 1. createWorkLocation
- **Input:** `CreateWorkLocationInput` (clientId, name, address, email?, phone?)
- **Output:** `WorkLocation`
- **Logic:**
  - Validate client exists and is not deleted
  - Insert work location with provided clientId
  - RLS handles organization scoping through client relationship
- **Schema:** `createWorkLocationSchema`

#### 2. getWorkLocation
- **Input:** `WorkLocationIdInput` (id)
- **Output:** `WorkLocation`
- **Logic:**
  - Select by ID where `deleted_at` is null
  - Return NOT_FOUND if missing
- **Schema:** `workLocationIdSchema`

#### 3. getWorkLocations
- **Input:** `WorkLocationFilter` (page, pageSize, search, clientId?, sortBy, sortOrder, includeDeleted)
- **Output:** `PaginatedResult<WorkLocation>`
- **Logic:**
  - Build count and data queries in parallel
  - Apply soft-delete filter, search filter (name, address, email, phone), client filter
  - Apply sorting and pagination
- **Schema:** `workLocationFilterSchema`

#### 4. updateWorkLocation
- **Input:** `UpdateWorkLocationInput` (id, name?, address?, email?, phone?)
- **Output:** `WorkLocation`
- **Logic:**
  - Filter undefined values from update payload
  - Update where `deleted_at` is null
  - Return NOT_FOUND if missing
- **Schema:** `updateWorkLocationSchema`

#### 5. deleteWorkLocation
- **Input:** `DeleteWorkLocationInput` (id)
- **Output:** `WorkLocation`
- **Logic:**
  - Soft delete by setting `deleted_at` timestamp
  - Only delete if not already deleted
  - Return deleted record
- **Schema:** `deleteWorkLocationSchema`

### Phase 3: Finalization

1. Add searchable columns constant: `WORK_LOCATION_SEARCHABLE_COLUMNS = ['name', 'address', 'email', 'phone']` to schemas.ts
2. Update `services/work-locations/index.ts` to export from actions.ts
3. Verify TypeScript compilation with `pnpm tsc --noEmit`

### Phase 4: Unit Testing

Create `services/work-locations/__tests__/actions.test.ts` with comprehensive tests.

#### Test Setup

```typescript
import type { PostgrestError, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@/services/shared/errors';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase client
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

// Chain methods return the query object
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

const mockWorkLocation = {
  id: 'location-123',
  client_id: 'client-456',
  name: 'Main Office',
  address: '123 Main St',
  email: 'office@example.com',
  phone: '+48 123 456 789',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};
```

#### Test Cases for Each Action

**createWorkLocation:**
- Returns success when valid input provided
- Returns VALIDATION_ERROR for missing required fields
- Returns VALIDATION_ERROR for invalid clientId format
- Returns NOT_FOUND when client doesn't exist (FK violation)
- Returns DUPLICATE_ENTRY for duplicate name within client

**getWorkLocation:**
- Returns work location when found
- Returns NOT_FOUND when ID doesn't exist
- Returns NOT_FOUND when work location is soft-deleted
- Returns VALIDATION_ERROR for invalid UUID

**getWorkLocations:**
- Returns paginated results with default pagination
- Applies search filter across searchable columns
- Filters by clientId when provided
- Applies sorting correctly
- Excludes soft-deleted by default
- Includes soft-deleted when includeDeleted=true

**updateWorkLocation:**
- Updates only provided fields
- Returns NOT_FOUND for non-existent ID
- Returns NOT_FOUND for soft-deleted work location
- Handles null values for optional fields (email, phone)

**deleteWorkLocation:**
- Soft deletes by setting deleted_at
- Returns NOT_FOUND for non-existent ID
- Returns NOT_FOUND for already deleted work location

#### Example Test Implementation

```typescript
describe('createWorkLocation', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // Reset all query mocks
    Object.values(mockSupabaseQuery).forEach((mock) => mock.mockClear());
    Object.values(mockSupabaseQuery).forEach((mock) =>
      mock.mockReturnValue(mockSupabaseQuery)
    );
  });

  it('returns success when valid input provided', async () => {
    mockSingle.mockResolvedValue({ data: mockWorkLocation, error: null });

    const result = await createWorkLocation({
      clientId: 'client-456',
      name: 'Main Office',
      address: '123 Main St',
      email: 'office@example.com',
      phone: '+48 123 456 789',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Main Office');
      expect(result.data.client_id).toBe('client-456');
    }
  });

  it('returns NOT_AUTHENTICATED when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await createWorkLocation({
      clientId: 'client-456',
      name: 'Main Office',
      address: '123 Main St',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED);
    }
  });

  it('returns VALIDATION_ERROR for missing name', async () => {
    const result = await createWorkLocation({
      clientId: 'client-456',
      name: '',
      address: '123 Main St',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });
});

describe('getWorkLocations', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    Object.values(mockSupabaseQuery).forEach((mock) => mock.mockClear());
    Object.values(mockSupabaseQuery).forEach((mock) =>
      mock.mockReturnValue(mockSupabaseQuery)
    );
  });

  it('returns paginated results', async () => {
    // Mock count query
    mockSupabaseQuery.select.mockImplementationOnce(() => ({
      ...mockSupabaseQuery,
      // First call is for count
    }));

    // Setup for parallel queries
    mockRange.mockResolvedValueOnce({ count: 25, error: null });
    mockRange.mockResolvedValueOnce({
      data: [mockWorkLocation],
      error: null
    });

    const result = await getWorkLocations({ page: 1, pageSize: 20 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pagination.totalItems).toBe(25);
      expect(result.data.data).toHaveLength(1);
    }
  });
});
```

## Output Format

### actions.ts Structure

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
import type { WorkLocation } from '@/types';
import { createAction } from '../shared/action-wrapper';
import {
  WORK_LOCATION_SEARCHABLE_COLUMNS,
  type CreateWorkLocationInput,
  type DeleteWorkLocationInput,
  type UpdateWorkLocationInput,
  type WorkLocationFilter,
  type WorkLocationIdInput,
  createWorkLocationSchema,
  deleteWorkLocationSchema,
  updateWorkLocationSchema,
  workLocationFilterSchema,
  workLocationIdSchema,
} from './schemas';

/**
 * Creates a new work location linked to a client.
 */
export const createWorkLocation = createAction<CreateWorkLocationInput, WorkLocation>(
  async (input, { supabase }) => {
    // Implementation following clients pattern
  },
  { schema: createWorkLocationSchema }
);

// ... remaining actions
```

### index.ts Update

```typescript
// Barrel exports for work-locations services

export * from './actions';
export * from './schemas';
```

## Success Criteria

### Measurable Goals
- [ ] All 5 server actions created and exported
- [ ] `pnpm tsc --noEmit` passes without errors
- [ ] Actions follow exact pattern from `clients/actions.ts`
- [ ] Soft-delete logic matches clients implementation
- [ ] Pagination uses `paginateResult()` helper
- [ ] Unit tests created in `__tests__/actions.test.ts`
- [ ] `pnpm test services/work-locations` passes all tests
- [ ] Minimum 80% code coverage for actions.ts

### Validation Method
- Run TypeScript compiler to verify types
- Compare action signatures with server-actions-plan.md specifications
- Verify schema types match database columns
- Run `pnpm test:coverage` to verify coverage threshold

## Constraints

- DO NOT modify `schemas.ts` except adding `WORK_LOCATION_SEARCHABLE_COLUMNS`
- DO NOT add organization_id lookup - RLS handles scoping via client relationship
- PRESERVE JSDoc comments on all exported functions
- USE exact import paths matching clients/actions.ts pattern
- TESTS must be in `services/work-locations/__tests__/actions.test.ts`
- DO NOT use `beforeEach(() => { vi.clearAllMocks() })` - `restoreMocks: true` handles this
