import { z } from 'zod';

import {
	baseFilterSchema,
	sortOrderSchema,
	uuidSchema,
} from '@/services/shared/schemas';

// ============================================================================
// Position Schemas
// ============================================================================

/**
 * Schema for creating a new position
 * Used by createPosition server action
 */
export const createPositionSchema = z.object({
	workLocationId: uuidSchema,
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters'),
});

/**
 * Schema for updating an existing position
 * All fields except id are optional
 */
export const updatePositionSchema = z.object({
	id: uuidSchema,
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(255, 'Name must be at most 255 characters')
		.optional(),
	isActive: z.boolean().optional(),
});

/**
 * Schema for deleting a position
 * Used by deletePosition server action
 */
export const deletePositionSchema = z.object({
	id: uuidSchema,
});

/**
 * Schema for position ID parameter
 */
export const positionIdSchema = z.object({
	id: uuidSchema,
});

/** Allowed sort fields for positions */
export const positionSortBySchema = z
	.enum(['name', 'created_at'])
	.optional()
	.default('name');

/**
 * Schema for filtering positions list
 * Used by getPositions query
 */
export const positionFilterSchema = baseFilterSchema.extend({
	workLocationId: uuidSchema.optional(),
	isActive: z.boolean().optional(),
	sortBy: positionSortBySchema,
	sortOrder: sortOrderSchema,
	includeDeleted: z.boolean().optional().default(false),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type DeletePositionInput = z.infer<typeof deletePositionSchema>;
export type PositionIdInput = z.infer<typeof positionIdSchema>;
export type PositionSortBy = z.infer<typeof positionSortBySchema>;
export type PositionFilter = z.infer<typeof positionFilterSchema>;
