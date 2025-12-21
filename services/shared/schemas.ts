import { z } from 'zod';

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, USER_ROLE_VALUES } from '@/types/common';

// ============================================================================
// Reusable Field Schemas (Zod 4 API)
// ============================================================================

/** UUID validation with custom error message */
export const uuidSchema = z.uuid('Invalid ID format');

/** Phone number validation: digits, spaces, dashes, parentheses, plus sign */
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone format')
  .min(9, 'Phone must be at least 9 characters')
  .max(20, 'Phone must be at most 20 characters');

/** Optional phone schema that allows null */
export const optionalPhoneSchema = phoneSchema.optional().nullable();

/** Email validation with custom error message */
export const emailSchema = z.email('Invalid email format');

/** Optional email schema that allows null */
export const optionalEmailSchema = emailSchema.optional().nullable();

/** Optional search string (trimmed) */
export const searchSchema = z.string().trim().optional();

/** User role enum matching database */
export const userRoleSchema = z.enum(USER_ROLE_VALUES);

// ============================================================================
// Pagination Schemas
// ============================================================================

/** Pagination parameters schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .optional()
    .default(DEFAULT_PAGE_SIZE),
});

/** Sort order schema */
export const sortOrderSchema = z.enum(['asc', 'desc']).optional().default('asc');

/** Base sort schema (to be extended with specific sortBy fields) */
export const baseSortSchema = z.object({
  sortOrder: sortOrderSchema,
});

// ============================================================================
// Date Range Schemas
// ============================================================================

/** Date range parameters schema with validation (ISO datetime) */
export const dateRangeSchema = z
  .object({
    dateFrom: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
    dateTo: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['dateTo'],
    }
  );

/** Date-only range schema (for reports) */
export const dateOnlyRangeSchema = z
  .object({
    startDate: z.iso.date({ message: 'Invalid date format (expected YYYY-MM-DD)' }),
    endDate: z.iso.date({ message: 'Invalid date format (expected YYYY-MM-DD)' }),
  })
  .refine(
    (data) => {
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

// ============================================================================
// Common Filter Schema
// ============================================================================

/** Base filter schema with pagination and search */
export const baseFilterSchema = paginationSchema.extend({
  search: searchSchema,
});

// ============================================================================
// Type Exports
// ============================================================================

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type DateOnlyRangeInput = z.infer<typeof dateOnlyRangeSchema>;
export type BaseFilterInput = z.infer<typeof baseFilterSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;
