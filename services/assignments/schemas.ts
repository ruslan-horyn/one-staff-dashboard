import { z } from 'zod';

import {
	baseFilterSchema,
	sortOrderSchema,
	uuidSchema,
} from '@/services/shared/schemas';
import { ASSIGNMENT_STATUS_VALUES } from '@/types/common';

// ============================================================================
// Assignment Status Enum
// ============================================================================

/** Assignment status enum matching database */
export const assignmentStatusSchema = z.enum(ASSIGNMENT_STATUS_VALUES);

// ============================================================================
// Assignment Schemas
// ============================================================================

/**
 * Schema for creating a new assignment
 * Used by createAssignment server action
 */
export const createAssignmentSchema = z
	.object({
		workerId: uuidSchema,
		positionId: uuidSchema,
		startAt: z.iso.datetime({ message: 'Invalid start datetime format' }),
		endAt: z.iso
			.datetime({ message: 'Invalid end datetime format' })
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			if (data.endAt) {
				return new Date(data.startAt) < new Date(data.endAt);
			}
			return true;
		},
		{
			message: 'End datetime must be after start datetime',
			path: ['endAt'],
		}
	);

/**
 * Schema for ending an assignment
 * Used by endAssignment server action (via RPC)
 */
export const endAssignmentSchema = z.object({
	assignmentId: uuidSchema,
	endAt: z.iso.datetime({ message: 'Invalid end datetime format' }).optional(),
});

/**
 * Schema for cancelling an assignment
 * Used by cancelAssignment server action (via RPC)
 */
export const cancelAssignmentSchema = z.object({
	assignmentId: uuidSchema,
});

/**
 * Schema for assignment ID parameter
 */
export const assignmentIdSchema = z.object({
	id: uuidSchema,
});

/** Allowed sort fields for assignments */
export const assignmentSortBySchema = z
	.enum(['start_at', 'created_at'])
	.optional()
	.default('start_at');

/**
 * Schema for filtering assignments list
 * Used by getAssignments query
 */
export const assignmentFilterSchema = baseFilterSchema.extend({
	workerId: uuidSchema.optional(),
	positionId: uuidSchema.optional(),
	status: z.array(assignmentStatusSchema).optional(),
	dateFrom: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
	dateTo: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
	sortBy: assignmentSortBySchema,
	sortOrder: sortOrderSchema,
});

/**
 * Schema for getting worker assignments (expanded row view)
 * Used by getWorkerWithAssignments query
 */
export const workerAssignmentsFilterSchema = z.object({
	id: uuidSchema,
	assignmentStatus: z.array(assignmentStatusSchema).optional(),
	dateFrom: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
	dateTo: z.iso.datetime({ message: 'Invalid datetime format' }).optional(),
});

/**
 * Schema for audit log query parameters
 */
export const auditLogFilterSchema = z.object({
	assignmentId: uuidSchema,
	page: z.coerce.number().int().min(1).optional().default(1),
	pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type EndAssignmentInput = z.infer<typeof endAssignmentSchema>;
export type CancelAssignmentInput = z.infer<typeof cancelAssignmentSchema>;
export type AssignmentIdInput = z.infer<typeof assignmentIdSchema>;
export type AssignmentSortBy = z.infer<typeof assignmentSortBySchema>;
export type AssignmentFilter = z.infer<typeof assignmentFilterSchema>;
export type WorkerAssignmentsFilter = z.infer<
	typeof workerAssignmentsFilterSchema
>;
export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
