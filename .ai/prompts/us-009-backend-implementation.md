# US-009: End Assignment - Backend Implementation

## Context

Senior TypeScript/Next.js developer implementing the `endAssignment` server action for completing active assignments. This action uses the existing `end_assignment` PostgreSQL RPC function which handles status transitions and audit logging.

**Project Stack:**
- Next.js 16 (App Router, Server Actions)
- TypeScript 5
- Supabase (PostgreSQL + RLS + RPC functions)
- Zod 4 (validation)

## Source Files

### Primary (must read):
- `services/assignments/schemas.ts` - Existing `endAssignmentSchema` and types
- `types/database.ts` - `end_assignment` RPC function signature
- `types/assignment.ts` - Assignment entity types

### Reference (read as needed):
- `services/shared/action-wrapper.ts` - `createAction()` HOF wrapper
- `docs/server-actions-plan.md` - Full action specifications (endAssignment section)

## Tasks

### Phase 1: Analysis

1. Read `types/database.ts` to understand the `end_assignment` RPC:
   ```typescript
   end_assignment: {
     Args: { p_assignment_id: string; p_end_at?: string };
     Returns: Assignment; // Full assignment row
   }
   ```

2. Review PRD US-009 acceptance criteria:
   - "End Work" action for active assignments (without end date)
   - Modal to confirm/edit end datetime
   - Status changes to "completed"
   - Recorded in audit log (handled by RPC)

3. Understand the RPC behavior:
   - Sets `end_at` to provided value or `NOW()`
   - Sets `ended_by` to current user
   - Changes `status` to 'completed'
   - Creates audit log entry automatically

### Phase 2: Implementation

Add `endAssignment` action to `services/assignments/actions.ts`:

#### endAssignment
- **Input:** `EndAssignmentInput` (assignmentId, endAt?)
- **Output:** `Assignment`
- **Logic:**
  - Call `end_assignment` RPC with parameters
  - RPC handles: status change, ended_by, audit log
  - Throw error if assignment not found or already ended
- **Schema:** `endAssignmentSchema`

```typescript
/**
 * Ends an active assignment by setting end datetime.
 * Uses database RPC which handles:
 * - Setting end_at (defaults to NOW if not provided)
 * - Setting ended_by to current user
 * - Changing status to 'completed'
 * - Creating audit log entry
 *
 * @param input - Object with assignmentId and optional endAt datetime
 * @returns Updated assignment record
 *
 * @example
 * // End with current time
 * const result = await endAssignment({ assignmentId: 'uuid' });
 *
 * // End with specific time
 * const result = await endAssignment({
 *   assignmentId: 'uuid',
 *   endAt: '2024-01-15T17:30:00Z'
 * });
 */
export const endAssignment = createAction<EndAssignmentInput, Assignment>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .rpc('end_assignment', {
        p_assignment_id: input.assignmentId,
        p_end_at: input.endAt,
      })
      .single();

    if (error) throw error;
    return data;
  },
  { schema: endAssignmentSchema }
);
```

### Phase 3: Error Handling Considerations

The RPC may return errors for:
- Assignment not found → `NOT_FOUND`
- Assignment already has end_at → `VALIDATION_ERROR` (already ended)
- Assignment status is 'cancelled' → `VALIDATION_ERROR`

These are handled automatically by `createAction` wrapper's error mapping.

### Phase 4: Finalization

1. Ensure `endAssignment` is exported from `services/assignments/index.ts`
2. Verify TypeScript compilation with `pnpm tsc --noEmit`
3. Verify the RPC call uses correct parameter names (`p_assignment_id`, `p_end_at`)

### Phase 5: Unit Testing

Add tests for `endAssignment` to `services/assignments/__tests__/actions.test.ts`.

#### Test Setup for RPC Mocking

```typescript
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '@/services/shared/errors';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase client with RPC support
const mockRpc = vi.fn();
const mockSingle = vi.fn();

const mockRpcChain = {
  single: mockSingle,
};

mockRpc.mockReturnValue(mockRpcChain);

const mockGetUser = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  rpc: mockRpc,
  from: vi.fn(), // For other queries if needed
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

const mockEndedAssignment = {
  id: 'assignment-123',
  worker_id: 'worker-456',
  position_id: 'position-789',
  start_at: '2024-01-15T08:00:00Z',
  end_at: '2024-01-15T17:00:00Z',
  status: 'completed',
  created_by: 'user-111',
  ended_by: 'user-123',
  cancelled_by: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T17:00:00Z',
};
```

#### Test Cases for endAssignment

**Success scenarios:**
- Returns success when ending with specific endAt
- Returns success when ending without endAt (uses NOW())
- Assignment status changes to 'completed'
- ended_by is set (handled by RPC)

**Error scenarios:**
- Returns NOT_AUTHENTICATED when user not logged in
- Returns VALIDATION_ERROR for invalid assignmentId format
- Returns NOT_FOUND when assignment doesn't exist
- Returns VALIDATION_ERROR when assignment already ended
- Returns VALIDATION_ERROR when assignment is cancelled

**RPC parameter verification:**
- Calls RPC with correct function name 'end_assignment'
- Passes p_assignment_id parameter
- Passes p_end_at parameter when provided
- Omits p_end_at when not provided

#### Example Test Implementation

```typescript
describe('endAssignment', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRpc.mockClear();
    mockSingle.mockClear();
    mockRpc.mockReturnValue(mockRpcChain);
  });

  it('ends assignment with specific endAt', async () => {
    mockSingle.mockResolvedValue({ data: mockEndedAssignment, error: null });

    const result = await endAssignment({
      assignmentId: 'assignment-123',
      endAt: '2024-01-15T17:00:00Z',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('completed');
      expect(result.data.end_at).toBe('2024-01-15T17:00:00Z');
    }

    // Verify RPC called with correct parameters
    expect(mockRpc).toHaveBeenCalledWith('end_assignment', {
      p_assignment_id: 'assignment-123',
      p_end_at: '2024-01-15T17:00:00Z',
    });
  });

  it('ends assignment without endAt (uses NOW)', async () => {
    mockSingle.mockResolvedValue({ data: mockEndedAssignment, error: null });

    const result = await endAssignment({
      assignmentId: 'assignment-123',
    });

    expect(result.success).toBe(true);

    // Verify RPC called with undefined p_end_at
    expect(mockRpc).toHaveBeenCalledWith('end_assignment', {
      p_assignment_id: 'assignment-123',
      p_end_at: undefined,
    });
  });

  it('returns NOT_AUTHENTICATED when user not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await endAssignment({
      assignmentId: 'assignment-123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED);
    }
  });

  it('returns VALIDATION_ERROR for invalid UUID', async () => {
    const result = await endAssignment({
      assignmentId: 'not-a-valid-uuid',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });

  it('returns NOT_FOUND when assignment not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const result = await endAssignment({
      assignmentId: '00000000-0000-0000-0000-000000000000',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
    }
  });

  it('handles RPC error for already ended assignment', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        code: '23514', // CHECK_VIOLATION
        message: 'Assignment already ended',
      },
    });

    const result = await endAssignment({
      assignmentId: 'assignment-123',
    });

    expect(result.success).toBe(false);
  });
});
```

## Output Format

### Updated assignments/actions.ts

```typescript
'use server';

import type { Assignment } from '@/types';
import { createAction } from '../shared/action-wrapper';
import {
  type CreateAssignmentInput,
  type EndAssignmentInput,
  createAssignmentSchema,
  endAssignmentSchema,
} from './schemas';

// ... existing createAssignment action

/**
 * Ends an active assignment by setting end datetime.
 * Uses database RPC for atomic status change and audit logging.
 */
export const endAssignment = createAction<EndAssignmentInput, Assignment>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .rpc('end_assignment', {
        p_assignment_id: input.assignmentId,
        p_end_at: input.endAt,
      })
      .single();

    if (error) throw error;
    return data;
  },
  { schema: endAssignmentSchema }
);
```

## Success Criteria

### Measurable Goals
- [ ] `endAssignment` action created and exported
- [ ] Uses `supabase.rpc('end_assignment', ...)` correctly
- [ ] Parameter names match RPC signature (p_assignment_id, p_end_at)
- [ ] `pnpm tsc --noEmit` passes without errors
- [ ] JSDoc documents RPC behavior (audit log, status change)
- [ ] Unit tests added to `services/assignments/__tests__/actions.test.ts`
- [ ] `pnpm test services/assignments` passes all tests
- [ ] Tests verify RPC is called with correct parameters

### Validation Method
- Run TypeScript compiler to verify types
- Compare parameter names with `types/database.ts` RPC definition
- Verify schema import matches schemas.ts exports
- Run `pnpm test:coverage` to verify coverage

## Constraints

- DO NOT implement audit logging manually - RPC handles it
- DO NOT validate end_at > start_at manually - RPC validates
- DO NOT implement cancelAssignment in this task (separate US-010)
- USE `.single()` after RPC call to get typed return value
- PRESERVE JSDoc comments explaining RPC behavior
- TESTS must be in `services/assignments/__tests__/actions.test.ts`
- DO NOT use `beforeEach(() => { vi.clearAllMocks() })` - `restoreMocks: true` handles this
