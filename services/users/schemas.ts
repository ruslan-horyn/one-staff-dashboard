import { z } from 'zod';

import {
	baseFilterSchema,
	emailSchema,
	sortOrderSchema,
	uuidSchema,
} from '@/services/shared/schemas';

// ============================================================================
// User Schemas
// ============================================================================

/**
 * Schema for inviting a coordinator to the organization
 */
export const inviteCoordinatorSchema = z.object({
	email: emailSchema,
	firstName: z.string().trim().min(1, 'First name is required').max(100),
	lastName: z.string().trim().min(1, 'Last name is required').max(100),
});

/**
 * Schema for deactivating or reactivating a user
 */
export const deactivateUserSchema = z.object({
	userId: uuidSchema,
});

/**
 * Schema for filtering the users list
 */
export const userFilterSchema = baseFilterSchema.extend({
	sortBy: z.enum(['name', 'created_at']).optional().default('name'),
	sortOrder: sortOrderSchema,
});

/**
 * Schema for updating a user profile
 */
export const updateProfileSchema = z
	.object({
		firstName: z.string().trim().min(1).max(100).optional(),
		lastName: z.string().trim().min(1).max(100).optional(),
	})
	.refine((data) => data.firstName || data.lastName, {
		message: 'At least one field is required',
	});

// ============================================================================
// Type Exports
// ============================================================================

export type InviteCoordinatorInput = z.infer<typeof inviteCoordinatorSchema>;
export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>;
export type UserFilter = z.infer<typeof userFilterSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
