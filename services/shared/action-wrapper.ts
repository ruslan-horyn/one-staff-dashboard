// ============================================================================
// Server Action Wrapper
// ============================================================================
// Provides a Higher-Order Function that wraps Server Actions with standardized
// error handling, optional authentication, and Zod validation.
//
// Note: This file does NOT have 'use server' directive because createAction
// is a factory function, not a server action itself. The returned function
// should be exported from files that have 'use server'.

import {
	isAuthError,
	type PostgrestError,
	type SupabaseClient,
	type User,
} from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { ZodError, z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { tryCatch } from '@/utils';
import { AuthenticationError } from './auth';
import {
	ErrorCodes,
	mapAuthError,
	mapSupabaseError,
	mapZodError,
} from './errors';
import {
	type ActionResult,
	type FailedActionResult,
	failure,
	success,
} from './result';

// ============================================================================
// Types
// ============================================================================

/**
 * Context passed to action handlers.
 * Type of `user` depends on `requireAuth` option:
 * - `requireAuth: true` (default) → `user: User`
 * - `requireAuth: false` → `user: null`
 */
export interface ActionContext<RequireAuth extends boolean = true> {
	/** Supabase client instance (already created) */
	supabase: SupabaseClient<Database>;
	/** Authenticated user (User when requireAuth=true, null when requireAuth=false) */
	user: RequireAuth extends true ? User : null;
}

/**
 * The actual action handler function signature.
 * Receives validated input and context, returns data or throws.
 */
export type ActionHandler<
	TInput,
	TOutput,
	RequireAuth extends boolean = true,
> = (input: TInput, context: ActionContext<RequireAuth>) => Promise<TOutput>;

/**
 * Configuration for a single path to revalidate.
 *
 * @example
 * { path: '/profile' }
 * { path: '/dashboard/[id]', type: 'layout' }
 */
export type RevalidatePathConfig = {
	path: string;
	type?: 'page' | 'layout';
};

/**
 * Configuration options for the action wrapper.
 */
export interface ActionOptions<TInput, RequireAuth extends boolean = true> {
	/**
	 * Zod schema for input validation.
	 * If provided, input will be validated before handler is called.
	 */
	schema?: z.ZodType<TInput>;

	/**
	 * Whether authentication is required.
	 * Default: true (most actions require auth)
	 */
	requireAuth?: RequireAuth;

	/**
	 * Paths to revalidate after successful action execution.
	 * Uses Next.js revalidatePath() to invalidate cached data.
	 *
	 * @example
	 * revalidatePaths: [
	 *   { path: '/profile' },
	 *   { path: '/dashboard/[id]', type: 'layout' },  // revalidates layout + all nested pages
	 *   { path: '/blog/[slug]', type: 'page' }        // revalidates only that page
	 * ]
	 */
	revalidatePaths?: RevalidatePathConfig[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates input against a Zod schema.
 * Throws ZodError if validation fails (handled by handleActionError).
 */
function validateInput<TInput>(
	input: TInput,
	schema?: z.ZodType<TInput>
): TInput {
	if (!schema) {
		return input;
	}

	return schema.parse(input);
}

/**
 * Authenticates the user if required.
 * Throws AuthenticationError if not authenticated (handled by handleActionError).
 */
async function authenticateUser(
	supabase: SupabaseClient<Database>,
	requireAuth: boolean
): Promise<User | null> {
	if (!requireAuth) return null;

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) throw error;
	if (!user) {
		throw new AuthenticationError(
			'You must be logged in to perform this action'
		);
	}

	return user;
}

// ============================================================================
// Action Wrapper Implementation
// ============================================================================

/**
 * Creates a wrapped Server Action with standardized error handling.
 *
 * Features:
 * - Optional Zod schema validation
 * - Optional authentication check (default: true)
 * - Supabase client creation
 * - Consistent ActionResult return type
 * - Development logging for errors
 * - Type-safe user context based on requireAuth option
 *
 * @param handler - The action logic function
 * @param options - Configuration options
 * @returns Async function that returns ActionResult (use in 'use server' files)
 *
 * @example
 * // /services/workers/actions.ts
 * 'use server';
 *
 * import { createAction } from '@/services/shared';
 * import { createWorkerSchema } from './schemas';
 *
 * export const createWorker = createAction(
 *   async (input, { supabase, user }) => {
 *     // user.id is guaranteed (no optional chaining needed)
 *     const { data, error } = await supabase
 *       .from('temporary_workers')
 *       .insert({ ...input, created_by: user.id })
 *       .select()
 *       .single();
 *
 *     if (error) throw error; // Will be mapped by wrapper
 *     return data;
 *   },
 *   { schema: createWorkerSchema }
 * );
 *
 * @example
 * // Without auth (e.g., sign in)
 * export const signIn = createAction(
 *   async (input, { supabase, user }) => {
 *     // user is null when requireAuth: false
 *     const { data, error } = await supabase.auth.signInWithPassword(input);
 *     if (error) throw error;
 *     return data;
 *   },
 *   { schema: signInSchema, requireAuth: false }
 * );
 */

// Overload: void input, requireAuth: false - no input required, user is null
export function createAction<TOutput>(
	handler: ActionHandler<void, TOutput, false>,
	options: Omit<ActionOptions<void, false>, 'schema'> & { requireAuth: false }
): () => Promise<ActionResult<TOutput>>;

// Overload: void input, requireAuth: true (default) - no input required, user is guaranteed
export function createAction<TOutput>(
	handler: ActionHandler<void, TOutput, true>,
	options?: Omit<ActionOptions<void, true>, 'schema'>
): () => Promise<ActionResult<TOutput>>;

// Overload: requireAuth: false - user is null
export function createAction<TInput, TOutput>(
	handler: ActionHandler<TInput, TOutput, false>,
	options: ActionOptions<TInput, false> & { requireAuth: false }
): (input: TInput) => Promise<ActionResult<TOutput>>;

// Overload: requireAuth: true (default) - user is guaranteed
export function createAction<TInput, TOutput>(
	handler: ActionHandler<TInput, TOutput, true>,
	options?: ActionOptions<TInput, true>
): (input: TInput) => Promise<ActionResult<TOutput>>;

// Implementation
export function createAction<TInput, TOutput>(
	handler: ActionHandler<TInput, TOutput, boolean>,
	options: ActionOptions<TInput, boolean> = {}
): (input?: TInput) => Promise<ActionResult<TOutput>> {
	const { schema, requireAuth = true, revalidatePaths = [] } = options;

	return async (input?: TInput): Promise<ActionResult<TOutput>> => {
		const [result, error] = await tryCatch(async () => {
			const validatedInput = validateInput(input as TInput, schema);

			const supabase = await createClient();

			const user = await authenticateUser(supabase, requireAuth);

			return handler(validatedInput, {
				supabase,
				user,
			});
		});

		if (error) {
			return handleActionError(error);
		}

		// Revalidate paths after successful execution

		for (const { path, type } of revalidatePaths) {
			revalidatePath(path, type);
		}

		return success(result);
	};
}

// ============================================================================
// Error Handler
// ============================================================================

/**
 * Handles errors thrown by action handlers.
 * Maps various error types to ActionResult failures.
 */
function handleActionError(error: unknown): FailedActionResult {
	// Authentication errors (from requireSession or manual throws)
	if (error instanceof AuthenticationError) {
		return failure(ErrorCodes.NOT_AUTHENTICATED, error.message);
	}

	// Supabase PostgrestError (from database operations)
	if (isPostgrestError(error)) {
		const mapped = mapSupabaseError(error);
		return failure(mapped.code, mapped.message, mapped.details);
	}

	// Supabase AuthError (from auth operations)
	if (isAuthError(error)) {
		const mapped = mapAuthError(error);
		return failure(mapped.code, mapped.message, mapped.details);
	}

	// Zod validation error (thrown by validateInput)
	if (isZodError(error)) {
		const mapped = mapZodError(error);
		return failure(mapped.code, mapped.message, mapped.details);
	}

	// Standard Error with message
	if (error instanceof Error) {
		// Log in development
		if (process.env.NODE_ENV === 'development') {
			console.error('[Action Error]', error);
		}

		return failure(
			ErrorCodes.INTERNAL_ERROR,
			error.message || 'An unexpected error occurred'
		);
	}

	// Unknown error type
	if (process.env.NODE_ENV === 'development') {
		console.error('[Unknown Action Error]', error);
	}

	return failure(
		ErrorCodes.INTERNAL_ERROR,
		'An unexpected error occurred. Please try again.'
	);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for Supabase PostgrestError.
 */
function isPostgrestError(error: unknown): error is PostgrestError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error &&
		'details' in error &&
		typeof (error as Record<string, unknown>).code === 'string'
	);
}

/**
 * Type guard for Zod validation errors.
 */
function isZodError(error: unknown): error is ZodError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'issues' in error &&
		Array.isArray((error as Record<string, unknown>).issues)
	);
}

/**
 * Type guard for Next.js router errors (redirect, notFound).
 * These errors should be re-thrown, not handled as application errors.
 */
export function isNextRouterError(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) return false;
	const digest = (error as { digest?: string }).digest;
	return (
		typeof digest === 'string' &&
		(digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND'))
	);
}
