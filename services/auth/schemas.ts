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

// ============================================================================
// Type Exports
// ============================================================================

export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
