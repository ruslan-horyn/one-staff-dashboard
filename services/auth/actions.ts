'use server';

import { env } from '@/lib/env';
import { createAction } from '@/services/shared/action-wrapper';
import type { AuthResponse, Profile, UserWithProfile } from '@/types/auth';
import {
	getCurrentUserSchema,
	type ResetPasswordInput,
	resetPasswordSchema,
	type SignInInput,
	type SignUpInput,
	signInSchema,
	signUpSchema,
	type UpdatePasswordInput,
	type UpdateProfileInput,
	updatePasswordSchema,
	updateProfileSchema,
} from './schemas';

/**
 * Signs in a user with email and password.
 *
 * @param input - Object with email and password
 * @returns Auth response with user and session
 *
 * @example
 * const result = await signIn({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 * });
 */
export const signIn = createAction<SignInInput, AuthResponse>(
	async (input, { supabase }) => {
		const { data, error } = await supabase.auth.signInWithPassword(input);
		if (error) throw error;
		return data;
	},
	{ schema: signInSchema, requireAuth: false }
);

/**
 * Registers a new user with email, password, profile data, and organization.
 * Data is stored in user_metadata and used by the database trigger
 * (handle_new_user) to create organization and profile records.
 *
 * @param input - Object with email, password, firstName, lastName, and organizationName
 * @returns Auth response with user (session may be null if email confirmation required)
 *
 * @example
 * const result = await signUp({
 *   email: 'newuser@example.com',
 *   password: 'securePassword123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   organizationName: 'My Company',
 * });
 */
export const signUp = createAction<SignUpInput, AuthResponse>(
	async (input, { supabase }) => {
		const siteUrl = env.NEXT_PUBLIC_SITE_URL;

		const { data, error } = await supabase.auth.signUp({
			email: input.email,
			password: input.password,
			options: {
				emailRedirectTo: `${siteUrl}/auth/callback?type=signup`,
				data: {
					first_name: input.firstName,
					last_name: input.lastName,
					organization_name: input.organizationName,
				},
			},
		});
		if (error) throw error;
		return data;
	},
	{ schema: signUpSchema, requireAuth: false }
);

/**
 * Signs out the current user.
 *
 * @returns Success indicator
 *
 * @example
 * const result = await signOut();
 */
export const signOut = createAction<{ success: boolean }>(
	async (_, { supabase }) => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		return { success: true };
	}
);

/**
 * Updates the current user's profile (first name and last name).
 *
 * @param input - Object with firstName and lastName
 * @returns Updated profile record
 *
 * @example
 * const result = await updateProfile({
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 * });
 */
export const updateProfile = createAction<UpdateProfileInput, Profile>(
	async (input, { supabase, user }) => {
		const { data, error } = await supabase
			.from('profiles')
			.update({
				first_name: input.firstName,
				last_name: input.lastName,
			})
			.eq('id', user!.id)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: updateProfileSchema }
);

/**
 * Retrieves the current authenticated user with their profile data.
 *
 * @returns User object with associated profile
 *
 * @example
 * const result = await getCurrentUser({});
 * if (isSuccess(result)) {
 *   console.log(result.data.profile.first_name);
 * }
 */
export const getCurrentUser = createAction<object, UserWithProfile>(
	async (_, { supabase, user }) => {
		const { data: profile, error } = await supabase
			.from('profiles')
			.select('*, organizations(name)')
			.eq('id', user!.id)
			.single();

		if (error) throw error;

		// Extract organization name from joined data
		const organization = profile.organizations as { name: string } | null;
		const profileWithOrg = {
			...profile,
			organization_name: organization?.name ?? 'Organization',
			organizations: undefined,
		};

		return { user: user!, profile: profileWithOrg };
	},
	{ schema: getCurrentUserSchema }
);

/**
 * Sends a password reset email to the specified email address.
 * Always returns success for security (to not reveal if email exists).
 *
 * @param input - Object with email address
 * @returns Success indicator (always true)
 *
 * @example
 * const result = await resetPassword({
 *   email: 'user@example.com',
 * });
 */
export const resetPassword = createAction<
	ResetPasswordInput,
	{ success: boolean }
>(
	async (input, { supabase }) => {
		const siteUrl = env.NEXT_PUBLIC_SITE_URL;

		const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
			redirectTo: `${siteUrl}/auth/callback?type=recovery`,
		});
		if (error && process.env.NODE_ENV === 'development') {
			console.error('[Reset Password Error]', error);
		}
		return { success: true };
	},
	{ schema: resetPasswordSchema, requireAuth: false }
);

/**
 * Updates the password for the current authenticated user.
 * Typically used after clicking a password reset link.
 *
 * @param input - Object with new password
 * @returns Success indicator
 *
 * @example
 * const result = await updatePassword({
 *   newPassword: 'newSecurePassword123',
 * });
 */
export const updatePassword = createAction<
	UpdatePasswordInput,
	{ success: boolean }
>(
	async (input, { supabase }) => {
		const { error } = await supabase.auth.updateUser({
			password: input.newPassword,
		});
		if (error) throw error;
		return { success: true };
	},
	{ schema: updatePasswordSchema }
);
