import { z } from 'zod';

import {
  uuidSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
  baseFilterSchema,
  sortOrderSchema,
} from '@/services/shared/schemas';

// ============================================================================
// Work Location Schemas
// ============================================================================

/**
 * Schema for creating a new work location
 * Used by createWorkLocation server action
 */
export const createWorkLocationSchema = z.object({
  clientId: uuidSchema,
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters'),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
});

/**
 * Schema for updating an existing work location
 * All fields except id are optional
 */
export const updateWorkLocationSchema = z.object({
  id: uuidSchema,
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters')
    .optional(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
});

/**
 * Schema for deleting a work location
 * Used by deleteWorkLocation server action
 */
export const deleteWorkLocationSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema for work location ID parameter
 */
export const workLocationIdSchema = z.object({
  id: uuidSchema,
});

/** Allowed sort fields for work locations */
export const workLocationSortBySchema = z.enum(['name', 'created_at']).optional().default('name');

/**
 * Schema for filtering work locations list
 * Used by getWorkLocations query
 */
export const workLocationFilterSchema = baseFilterSchema.extend({
  clientId: uuidSchema.optional(),
  sortBy: workLocationSortBySchema,
  sortOrder: sortOrderSchema,
  includeDeleted: z.boolean().optional().default(false),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateWorkLocationInput = z.infer<typeof createWorkLocationSchema>;
export type UpdateWorkLocationInput = z.infer<typeof updateWorkLocationSchema>;
export type DeleteWorkLocationInput = z.infer<typeof deleteWorkLocationSchema>;
export type WorkLocationIdInput = z.infer<typeof workLocationIdSchema>;
export type WorkLocationSortBy = z.infer<typeof workLocationSortBySchema>;
export type WorkLocationFilter = z.infer<typeof workLocationFilterSchema>;
