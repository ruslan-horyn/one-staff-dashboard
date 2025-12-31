import { z } from 'zod';

import {
	baseFilterSchema,
	phoneSchema,
	sortOrderSchema,
	uuidSchema,
} from '@/services/shared/schemas';

// ============================================================================
// Worker Schemas
// ============================================================================

/**
 * Schema for creating a new temporary worker
 * Used by createWorker server action
 */
export const createWorkerSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, 'First name is required')
		.max(100, 'First name must be at most 100 characters'),
	lastName: z
		.string()
		.trim()
		.min(1, 'Last name is required')
		.max(100, 'Last name must be at most 100 characters'),
	phone: phoneSchema,
});

/**
 * Schema for updating an existing worker
 * All fields except id are optional
 */
export const updateWorkerSchema = z.object({
	id: uuidSchema,
	firstName: z
		.string()
		.trim()
		.min(1, 'First name is required')
		.max(100, 'First name must be at most 100 characters')
		.optional(),
	lastName: z
		.string()
		.trim()
		.min(1, 'Last name is required')
		.max(100, 'Last name must be at most 100 characters')
		.optional(),
	phone: phoneSchema.optional(),
});

/**
 * Schema for deleting a worker
 * Used by deleteWorker server action
 */
export const deleteWorkerSchema = z.object({
	id: uuidSchema,
});

/**
 * Schema for worker ID parameter
 */
export const workerIdSchema = z.object({
	id: uuidSchema,
});

/**
 * Schema for checking worker availability
 * Used by checkWorkerAvailability query
 */
export const checkWorkerAvailabilitySchema = z.object({
	workerId: uuidSchema,
	checkDatetime: z.iso.datetime({ message: 'Invalid datetime format' }),
});

/** Allowed sort fields for workers */
export const workerSortBySchema = z
	.enum(['name', 'total_hours', 'created_at'])
	.optional()
	.default('name');

/**
 * Schema for filtering workers list (Main Board View)
 * Used by getWorkers query
 */
export const workerFilterSchema = baseFilterSchema.extend({
	availableAt: z.iso
		.datetime({ message: 'Invalid datetime format' })
		.optional(),
	sortBy: workerSortBySchema,
	sortOrder: sortOrderSchema,
	includeDeleted: z.boolean().optional().default(false),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type DeleteWorkerInput = z.infer<typeof deleteWorkerSchema>;
export type WorkerIdInput = z.infer<typeof workerIdSchema>;
export type CheckWorkerAvailabilityInput = z.infer<
	typeof checkWorkerAvailabilitySchema
>;
export type WorkerSortBy = z.infer<typeof workerSortBySchema>;
export type WorkerFilter = z.infer<typeof workerFilterSchema>;
