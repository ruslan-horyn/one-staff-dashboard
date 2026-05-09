# US-011: Hours Report Generation - Backend Implementation

## Context

Senior TypeScript/Next.js developer implementing server actions for the Reports module. This module generates worked hours reports using the existing `get_hours_report` PostgreSQL RPC function and provides CSV export functionality.

**Project Stack:**
- Next.js 16 (App Router, Server Actions)
- TypeScript 5
- Supabase (PostgreSQL + RLS + RPC functions)
- Zod 4 (validation)

## Source Files

### Primary (must read):
- `services/reports/schemas.ts` - Existing `hoursReportFilterSchema` and `exportReportSchema`
- `types/database.ts` - `get_hours_report` RPC function signature
- `types/report.ts` - `HoursReportData` type

### Reference (read as needed):
- `services/shared/action-wrapper.ts` - `createAction()` HOF wrapper
- `docs/server-actions-plan.md` - Full action specifications (Reports section)

## Tasks

### Phase 1: Analysis

1. Read `types/database.ts` to understand the `get_hours_report` RPC:
   ```typescript
   get_hours_report: {
     Args: {
       p_start_date: string;  // ISO date (YYYY-MM-DD)
       p_end_date: string;    // ISO date (YYYY-MM-DD)
       p_client_id?: string;  // Optional client filter
     };
     Returns: {
       worker_id: string;
       worker_name: string;
       work_location_name: string;
       client_name: string;
       total_hours: number;
     }[];
   }
   ```

2. Review PRD US-011 acceptance criteria:
   - Select date range for report
   - Optional filter by client/location
   - Summary grouped by workers and locations
   - Export to CSV and Excel formats

3. Review existing schemas in `services/reports/schemas.ts`:
   - `hoursReportFilterSchema` - startDate, endDate, clientId?
   - `exportReportSchema` - same structure

### Phase 2: Implementation

Create `services/reports/actions.ts` with these server actions:

#### 1. generateHoursReport
- **Input:** `HoursReportFilter` (startDate, endDate, clientId?)
- **Output:** `HoursReportData[]`
- **Logic:**
  - Call `get_hours_report` RPC with parameters
  - Returns array of report rows
- **Schema:** `hoursReportFilterSchema`

#### 2. exportReportToCsv
- **Input:** `ExportReportInput` (startDate, endDate, clientId?)
- **Output:** `{ csv: string; filename: string }`
- **Logic:**
  - Call `get_hours_report` RPC to get data
  - Transform data to CSV string format
  - Generate filename with date range
- **Schema:** `exportReportSchema`

### Phase 3: CSV Generation

Implement CSV generation helper:

```typescript
/**
 * Converts report data to CSV string format.
 * Handles special characters and escaping.
 */
function generateCsvString(data: HoursReportData[]): string {
  const headers = ['Worker Name', 'Client', 'Work Location', 'Total Hours'];
  const rows = data.map(row => [
    escapeCsvField(row.worker_name),
    escapeCsvField(row.client_name),
    escapeCsvField(row.work_location_name),
    row.total_hours.toFixed(2),
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Escapes a CSV field value.
 * Wraps in quotes if contains comma, quote, or newline.
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

### Phase 4: Finalization

1. Create `services/reports/index.ts` with barrel exports
2. Verify TypeScript compilation with `pnpm tsc --noEmit`
3. Verify RPC parameter names match database function

## Output Format

### reports/actions.ts Structure

```typescript
'use server';

import type { HoursReportData } from '@/types';
import { createAction } from '../shared/action-wrapper';
import {
  type ExportReportInput,
  type HoursReportFilter,
  exportReportSchema,
  hoursReportFilterSchema,
} from './schemas';

// ============================================================================
// CSV Helpers
// ============================================================================

/**
 * Escapes a CSV field value.
 * Wraps in quotes if contains comma, quote, or newline.
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts report data to CSV string format.
 */
function generateCsvString(data: HoursReportData[]): string {
  const headers = ['Worker Name', 'Client', 'Work Location', 'Total Hours'];
  const rows = data.map((row) => [
    escapeCsvField(row.worker_name),
    escapeCsvField(row.client_name),
    escapeCsvField(row.work_location_name),
    row.total_hours.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Generates filename for report export.
 */
function generateReportFilename(startDate: string, endDate: string): string {
  return `hours-report_${startDate}_${endDate}.csv`;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Generates a worked hours report for a date range.
 * Optionally filters by client.
 *
 * @param input - Report filter (startDate, endDate, clientId?)
 * @returns Array of report data rows grouped by worker and location
 *
 * @example
 * const result = await generateHoursReport({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   clientId: 'optional-client-uuid',
 * });
 */
export const generateHoursReport = createAction<HoursReportFilter, HoursReportData[]>(
  async (input, { supabase }) => {
    const { data, error } = await supabase.rpc('get_hours_report', {
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_client_id: input.clientId ?? undefined,
    });

    if (error) throw error;
    return data ?? [];
  },
  { schema: hoursReportFilterSchema }
);

/**
 * Exports hours report data to CSV format.
 *
 * @param input - Report filter (startDate, endDate, clientId?)
 * @returns Object with CSV string and suggested filename
 *
 * @example
 * const { csv, filename } = await exportReportToCsv({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 * });
 * // Download using: new Blob([csv], { type: 'text/csv' })
 */
export const exportReportToCsv = createAction<
  ExportReportInput,
  { csv: string; filename: string }
>(
  async (input, { supabase }) => {
    const { data, error } = await supabase.rpc('get_hours_report', {
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_client_id: input.clientId ?? undefined,
    });

    if (error) throw error;

    const csv = generateCsvString(data ?? []);
    const filename = generateReportFilename(input.startDate, input.endDate);

    return { csv, filename };
  },
  { schema: exportReportSchema }
);
```

### reports/index.ts

```typescript
// Barrel exports for reports services

export * from './actions';
export * from './schemas';
```

### Phase 5: Unit Testing

Create `services/reports/__tests__/actions.test.ts` with comprehensive tests.

#### Test Setup

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

const mockGetUser = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  rpc: mockRpc,
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

const mockReportData = [
  {
    worker_id: 'worker-1',
    worker_name: 'John Doe',
    work_location_name: 'Main Office',
    client_name: 'Acme Corp',
    total_hours: 40.5,
  },
  {
    worker_id: 'worker-2',
    worker_name: 'Jane Smith',
    work_location_name: 'Branch Office',
    client_name: 'Acme Corp',
    total_hours: 35.25,
  },
];
```

#### Test Cases for generateHoursReport

**Success scenarios:**
- Returns report data for valid date range
- Returns empty array when no data
- Filters by clientId when provided
- Handles clientId as null/undefined

**Error scenarios:**
- Returns NOT_AUTHENTICATED when user not logged in
- Returns VALIDATION_ERROR for invalid date format
- Returns VALIDATION_ERROR when endDate before startDate
- Returns NOT_FOUND when clientId doesn't exist

**RPC parameter verification:**
- Calls RPC with correct function name 'get_hours_report'
- Passes p_start_date, p_end_date, p_client_id parameters

#### Test Cases for exportReportToCsv

**Success scenarios:**
- Returns CSV string with headers and data
- Returns CSV with only headers when no data
- Filename includes date range
- Handles special characters in data (commas, quotes, newlines)

**CSV format verification:**
- Headers are correct: 'Worker Name,Client,Work Location,Total Hours'
- Data rows are comma-separated
- Total hours formatted to 2 decimal places
- Fields with commas are quoted
- Fields with quotes are escaped with double quotes

#### Example Test Implementation

```typescript
describe('generateHoursReport', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRpc.mockClear();
  });

  it('returns report data for valid date range', async () => {
    mockRpc.mockResolvedValue({ data: mockReportData, error: null });

    const result = await generateHoursReport({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].worker_name).toBe('John Doe');
      expect(result.data[0].total_hours).toBe(40.5);
    }

    expect(mockRpc).toHaveBeenCalledWith('get_hours_report', {
      p_start_date: '2024-01-01',
      p_end_date: '2024-01-31',
      p_client_id: undefined,
    });
  });

  it('filters by clientId when provided', async () => {
    mockRpc.mockResolvedValue({ data: mockReportData, error: null });

    await generateHoursReport({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      clientId: 'client-123',
    });

    expect(mockRpc).toHaveBeenCalledWith('get_hours_report', {
      p_start_date: '2024-01-01',
      p_end_date: '2024-01-31',
      p_client_id: 'client-123',
    });
  });

  it('returns empty array when no data', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const result = await generateHoursReport({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns VALIDATION_ERROR when endDate before startDate', async () => {
    const result = await generateHoursReport({
      startDate: '2024-01-31',
      endDate: '2024-01-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    }
  });
});

describe('exportReportToCsv', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRpc.mockClear();
  });

  it('returns CSV with headers and data', async () => {
    mockRpc.mockResolvedValue({ data: mockReportData, error: null });

    const result = await exportReportToCsv({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const lines = result.data.csv.split('\n');
      expect(lines[0]).toBe('Worker Name,Client,Work Location,Total Hours');
      expect(lines[1]).toBe('John Doe,Acme Corp,Main Office,40.50');
      expect(lines[2]).toBe('Jane Smith,Acme Corp,Branch Office,35.25');
    }
  });

  it('generates correct filename with date range', async () => {
    mockRpc.mockResolvedValue({ data: mockReportData, error: null });

    const result = await exportReportToCsv({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filename).toBe('hours-report_2024-01-01_2024-01-31.csv');
    }
  });

  it('returns CSV with only headers when no data', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const result = await exportReportToCsv({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.csv).toBe('Worker Name,Client,Work Location,Total Hours');
    }
  });

  it('escapes fields with commas', async () => {
    const dataWithCommas = [{
      ...mockReportData[0],
      client_name: 'Acme, Inc.',
    }];
    mockRpc.mockResolvedValue({ data: dataWithCommas, error: null });

    const result = await exportReportToCsv({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const lines = result.data.csv.split('\n');
      expect(lines[1]).toContain('"Acme, Inc."');
    }
  });

  it('escapes fields with quotes', async () => {
    const dataWithQuotes = [{
      ...mockReportData[0],
      worker_name: 'John "Johnny" Doe',
    }];
    mockRpc.mockResolvedValue({ data: dataWithQuotes, error: null });

    const result = await exportReportToCsv({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const lines = result.data.csv.split('\n');
      expect(lines[1]).toContain('"John ""Johnny"" Doe"');
    }
  });
});
```

## Success Criteria

### Measurable Goals
- [ ] `generateHoursReport` action created and exported
- [ ] `exportReportToCsv` action created and exported
- [ ] CSV generation handles special characters (commas, quotes, newlines)
- [ ] `pnpm tsc --noEmit` passes without errors
- [ ] RPC parameter names match database function signature
- [ ] Unit tests created in `services/reports/__tests__/actions.test.ts`
- [ ] `pnpm test services/reports` passes all tests
- [ ] Minimum 80% code coverage for actions.ts

### Validation Method
- Run TypeScript compiler to verify types
- Verify CSV escaping logic handles edge cases
- Compare RPC parameters with `types/database.ts` definition
- Test CSV output format matches expected structure
- Run `pnpm test:coverage` to verify coverage threshold

## Constraints

- DO NOT implement Excel export (CSV only for MVP, Excel can be added later)
- DO NOT add pagination to reports (single response with all data)
- DO NOT store generated reports - generate on demand
- USE ISO date format (YYYY-MM-DD) for date parameters
- HANDLE empty results gracefully (return empty array/CSV with headers only)
- TESTS must be in `services/reports/__tests__/actions.test.ts`
- DO NOT use `beforeEach(() => { vi.clearAllMocks() })` - `restoreMocks: true` handles this

## Future Enhancements (Out of Scope)

- Excel export (`exportReportToExcel`) - can use libraries like `xlsx`
- Report caching for performance
- Async report generation for large date ranges
- PDF export with formatted layout
