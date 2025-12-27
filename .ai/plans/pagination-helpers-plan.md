# Implementation Plan: Pagination Helpers Module

## Overview

Create `/services/shared/pagination.ts` with pagination utilities for Server Actions and Queries.

## Files to Create/Modify

### 1. Create: `/services/shared/pagination.ts`

**Types:**

```typescript
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CreatePaginationMetaParams {
  page: number;
  pageSize: number;
  totalItems: number;
}
```

**Functions:**

| Function | Description |
|----------|-------------|
| `calculateOffset(page, pageSize)` | Returns `(Math.max(1, page) - 1) * pageSize` |
| `calculateTotalPages(totalItems, pageSize)` | Returns `Math.ceil(totalItems / pageSize)` or 0 if empty |
| `createPaginationMeta(params)` | Builds full PaginationMeta object |
| `paginateResult<T>(data, totalItems, page, pageSize)` | Wraps data in PaginatedResult |
| `applyPaginationToQuery(query, page, pageSize)` | Adds `.range()` to Supabase query |

**Edge Cases:**

- `page < 1` → treat as page 1 (offset = 0)
- `totalItems = 0` → totalPages = 0, hasNextPage/hasPreviousPage = false
- `pageSize > totalItems` → totalPages = 1

**Re-exports:**

```typescript
export { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/types/common';
```

### 2. Modify: `/services/shared/index.ts`

Add barrel export:

```typescript
export * from './pagination';
```

## Implementation Steps

1. [ ] Create `/services/shared/pagination.ts` with types and all helper functions
2. [ ] Update `/services/shared/index.ts` with barrel export

## Technical Notes

- All functions must be pure (no side effects)
- Follow existing JSDoc pattern from `result.ts` and `errors.ts`
- Use TypeScript generics for type-safe `PaginatedResult<T>`
- `applyPaginationToQuery` uses Supabase's `PostgrestFilterBuilder` type from `@supabase/supabase-js`
