# TECH-002: Data Table Component

## Context

UI Planner task for One Staff Dashboard - a staffing agency MVP application.
Create a reusable data table component with sorting, pagination, and expandable rows.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, @tanstack/react-table
**Existing:** `components/ui/table.tsx` (shadcn table primitives)

## Source Files

### Primary (must read):
- `docs/ui-architecture.md` - Section 5.4 (Table components)
- `docs/prd.md` - US-006 (Worker list), US-003 (Client list)
- `components/ui/table.tsx` - Existing shadcn table primitives
- `services/shared/pagination.ts` - PaginatedResult, PaginationMeta types

### Reference:
- `docs/directory-architecture.md` - File placement
- `types/common.ts` - SortParams type

## Tasks

### Phase 1: Requirements Analysis

1. Read `docs/ui-architecture.md` section 5.4
2. Analyze existing `components/ui/table.tsx`
3. Read `services/shared/pagination.ts` for types
4. Document all table use cases (Clients, Workers, Locations, Users, Reports)

### Phase 2: Design Decisions

1. Choose @tanstack/react-table configuration
2. Design sorting UX (click headers, visual indicators)
3. Design pagination controls
4. Design expandable row behavior
5. Plan URL state synchronization

### Phase 3: Implementation Plan

1. Define component interfaces
2. Create implementation order
3. Specify hook dependencies
4. Create testing checklist

## Components Specification

### DataTable

| Property | Value |
|----------|-------|
| File | `components/ui/data-table.tsx` |
| Type | Client Component |
| Purpose | Generic table wrapper with all features |

**Props Interface:**
```typescript
interface DataTableProps<TData, TValue> {
  // Core
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Pagination (server-side)
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;

  // Sorting
  sorting?: { id: string; desc: boolean }[];
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;

  // Expandable rows
  expandable?: boolean;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;

  // Selection
  selectable?: boolean;
  onSelectionChange?: (rows: TData[]) => void;

  // States
  isLoading?: boolean;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
}
```

### DataTableHeader

| Property | Value |
|----------|-------|
| File | `components/ui/data-table-header.tsx` |
| Type | Client Component |
| Purpose | Sortable column header with indicators |

**Visual States:**
```
Name ▲    (ascending - filled arrow)
Name ▼    (descending - filled arrow)
Name ↕    (sortable, not sorted - on hover)
Name      (not sortable - no indicator)
```

### DataTablePagination

| Property | Value |
|----------|-------|
| File | `components/ui/data-table-pagination.tsx` |
| Type | Client Component |
| Purpose | Page navigation and size selector |

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ Showing 1-20 of 150 items    Rows per page: [20▾]   < 1 2 3 > │
└────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}
```

### DataTableSkeleton

| Property | Value |
|----------|-------|
| File | `components/ui/data-table-skeleton.tsx` |
| Type | Server Component |
| Purpose | Loading placeholder |

**Props:**
```typescript
interface DataTableSkeletonProps {
  columns: number;
  rows?: number; // default: 5
  showPagination?: boolean;
}
```

### EmptyState

| Property | Value |
|----------|-------|
| File | `components/ui/empty-state.tsx` |
| Type | Server Component |
| Purpose | No data message with optional CTA |

**Props:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

**Example Usage:**
```tsx
<EmptyState
  icon={<Users className="h-12 w-12" />}
  title="No workers yet"
  description="Get started by adding your first worker"
  action={<Button>Add Worker</Button>}
/>
```

## Features Detail

### Sorting

- Single column sorting (click to toggle asc → desc → none)
- Multi-column: Shift+click (optional, phase 2)
- URL sync: `?sortBy=name&sortOrder=asc`
- Visual: Arrow indicators in header

### Pagination

- Server-side (data fetched per page)
- Page size options: 10, 20, 50
- URL sync: `?page=1&pageSize=20`
- Controls: First, Prev, page numbers, Next, Last

### Expandable Rows

- Click row or chevron to expand
- Only one row expanded at a time (configurable)
- Smooth animation (height transition)
- Keyboard: Enter to toggle

### Selection

- Checkbox column (first column)
- Header checkbox for select all (current page)
- Indeterminate state when partial
- Returns selected row data

## URL State Hook

```typescript
// hooks/useDataTableState.ts
interface UseDataTableStateOptions {
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

interface DataTableState {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetState: () => void;
}
```

## Accessibility

- `role="grid"` on table
- `aria-sort="ascending|descending|none"` on sortable headers
- `aria-expanded` on expandable rows
- `aria-selected` on selectable rows
- Keyboard navigation: Arrow keys in table
- Focus management on expand/collapse

## Output Format

Generate 3 files in `docs/ui-sessions/data-table/`:

1. `01-requirements.md` - Use cases, data types, feature requirements
2. `02-design-decisions.md` - Visual design, interaction patterns
3. `03-implementation-plan.md` - Component specs, code examples, tests

## Success Criteria

- [ ] Generic DataTable works with any data type
- [ ] Column definitions support custom rendering
- [ ] Sorting with URL sync
- [ ] Server-side pagination with URL sync
- [ ] Expandable rows with custom content
- [ ] Optional row selection
- [ ] Loading skeleton
- [ ] Empty state with CTA
- [ ] Full keyboard accessibility
- [ ] Works with shadcn table primitives
