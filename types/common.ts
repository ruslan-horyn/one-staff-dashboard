import type { Enums } from './database';

// ============================================================================
// Enum Types
// ============================================================================

/** User role enum: 'admin' | 'coordinator' */
export type UserRole = Enums<'user_role'>;

/** Assignment status enum: 'scheduled' | 'active' | 'completed' | 'cancelled' */
export type AssignmentStatus = Enums<'assignment_status'>;

// ============================================================================
// Pagination Types
// ============================================================================

/** Pagination parameters for list queries */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Sort parameters for list queries */
export interface SortParams<T extends string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

/** Date range filter parameters */
export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
