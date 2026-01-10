import { z } from 'zod';

// ============================================================================
// Auth Schemas
// ============================================================================

/**
 * Schema for user sign in
 * Used by signIn server action
 */
export const signInSchema = z.object({
	email: z.email('Invalid email format'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Schema for user sign up (registration)
 * Used by signUp server action
 */
export const signUpSchema = z.object({
	email: z.email('Invalid email format'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
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
});

/**
 * Schema for sign out (no input required)
 * Used by signOut server action
 */
export const signOutSchema = z.void().optional();

/**
 * Schema for updating user profile
 * Used by updateProfile server action
 */
export const updateProfileSchema = z.object({
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
});

/**
 * Schema for getting current user (no input required)
 * Used by getCurrentUser server action
 */
export const getCurrentUserSchema = z.object({});

/**
 * Schema for password reset request
 * Used by resetPassword server action
 */
export const resetPasswordSchema = z.object({
	email: z.email('Invalid email format'),
});

/**
 * Schema for updating password
 * Used by updatePassword server action
 */
export const updatePasswordSchema = z.object({
	newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignOutInput = z.infer<typeof signOutSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GetCurrentUserInput = z.infer<typeof getCurrentUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
