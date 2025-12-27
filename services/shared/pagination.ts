// ============================================================================
// Pagination Helpers
// ============================================================================
// Provides utilities for paginating Server Actions and Queries.
// All functions are pure with no side effects.

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/types/common';

// Re-export constants for convenience
export { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };

// ============================================================================
// Types
// ============================================================================

/**
 * Pagination metadata returned with paginated results.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Wrapper for paginated query results.
 *
 * @example
 * const result: PaginatedResult<Worker> = await getWorkers({ page: 1, pageSize: 20 });
 * console.log(result.data); // Worker[]
 * console.log(result.pagination.totalPages); // number
 */
export interface PaginatedResult<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Parameters for creating pagination metadata.
 */
export interface CreatePaginationMetaParams {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates the offset for SQL/Supabase queries based on page and pageSize.
 *
 * @param page - Current page number (1-indexed). Values < 1 are treated as 1.
 * @param pageSize - Number of items per page
 * @returns The offset to use in the query
 *
 * @example
 * calculateOffset(1, 20); // 0
 * calculateOffset(2, 20); // 20
 * calculateOffset(3, 10); // 20
 * calculateOffset(0, 20); // 0 (page < 1 treated as 1)
 */
export function calculateOffset(page: number, pageSize: number): number {
  const safePage = Math.max(1, page);
  return (safePage - 1) * pageSize;
}

/**
 * Calculates the total number of pages based on total items and page size.
 *
 * @param totalItems - Total number of items
 * @param pageSize - Number of items per page
 * @returns Total number of pages (0 if no items)
 *
 * @example
 * calculateTotalPages(100, 20); // 5
 * calculateTotalPages(101, 20); // 6
 * calculateTotalPages(0, 20);   // 0
 * calculateTotalPages(5, 20);   // 1
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 0;
  return Math.ceil(totalItems / pageSize);
}

/**
 * Creates a complete pagination metadata object.
 *
 * @param params - Parameters containing page, pageSize, and totalItems
 * @returns PaginationMeta object with all computed values
 *
 * @example
 * createPaginationMeta({ page: 2, pageSize: 20, totalItems: 100 });
 * // { page: 2, pageSize: 20, totalItems: 100, totalPages: 5, hasNextPage: true, hasPreviousPage: true }
 */
export function createPaginationMeta(params: CreatePaginationMetaParams): PaginationMeta {
  const { page, pageSize, totalItems } = params;
  const safePage = Math.max(1, page);
  const totalPages = calculateTotalPages(totalItems, pageSize);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

/**
 * Wraps data array in a PaginatedResult with computed pagination metadata.
 *
 * @param data - Array of items for the current page
 * @param totalItems - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns PaginatedResult containing data and pagination metadata
 *
 * @example
 * const workers = await fetchWorkers();
 * const count = await countWorkers();
 * return paginateResult(workers, count, 1, 20);
 */
export function paginateResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    data,
    pagination: createPaginationMeta({ page, pageSize, totalItems }),
  };
}

/**
 * Type for Supabase query builders that support range operations.
 * Uses generic interface to avoid tight coupling with Supabase types.
 */
interface RangeableQuery<T> {
  range(from: number, to: number): T;
}

/**
 * Applies pagination to a Supabase query builder using .range().
 *
 * @param query - Supabase query builder with range support
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns The query with range applied
 *
 * @example
 * const query = supabase.from('workers').select('*');
 * const paginatedQuery = applyPaginationToQuery(query, 1, 20);
 * // Equivalent to: query.range(0, 19)
 */
export function applyPaginationToQuery<T extends RangeableQuery<T>>(
  query: T,
  page: number,
  pageSize: number
): T {
  const offset = calculateOffset(page, pageSize);
  return query.range(offset, offset + pageSize - 1);
}
