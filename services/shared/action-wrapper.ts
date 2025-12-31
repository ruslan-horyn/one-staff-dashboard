// ============================================================================
// Server Action Wrapper
// ============================================================================
// Provides a Higher-Order Function that wraps Server Actions with standardized
// error handling, optional authentication, and Zod validation.
//
// Note: This file does NOT have 'use server' directive because createAction
// is a factory function, not a server action itself. The returned function
// should be exported from files that have 'use server'.

import type { z, ZodError } from 'zod';
import type { SupabaseClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { tryCatch } from '@/utils';

import { type ActionResult, failure, success } from './result';
import { ErrorCodes, mapSupabaseError, mapAuthError, mapZodError } from './errors';
import { AuthenticationError } from './auth';

// ============================================================================
// Types
// ============================================================================

/**
 * Context passed to action handlers.
 */
export interface ActionContext {
  /** Supabase client instance (already created) */
  supabase: SupabaseClient<Database>;
  /** Authenticated user (null if requireAuth is false) */
  user: User | null;
}

/**
 * The actual action handler function signature.
 * Receives validated input and context, returns data or throws.
 */
export type ActionHandler<TInput, TOutput> = (
  input: TInput,
  context: ActionContext
) => Promise<TOutput>;

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
export interface ActionOptions<TInput> {
  /**
   * Zod schema for input validation.
   * If provided, input will be validated before handler is called.
   */
  schema?: z.ZodType<TInput>;

  /**
   * Whether authentication is required.
   * Default: true (most actions require auth)
   */
  requireAuth?: boolean;

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
function validateInput<TInput>(input: TInput, schema?: z.ZodType<TInput>): TInput {
  if (!schema) {
    return input;
  }

  return schema.parse(input);
}

/**
 * Authenticates the user if required.
 * Throws AuthenticationError if not authenticated (handled by handleActionError).
 *
 * @param supabase - Supabase client instance to use for authentication
 * @param requireAuth - Whether authentication is required
 */
async function authenticateUser(
  supabase: SupabaseClient<Database>,
  requireAuth: boolean
): Promise<User | null> {
  if (!requireAuth) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }
  
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
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
 * - Optional authentication check
 * - Supabase client creation
 * - Consistent ActionResult return type
 * - Development logging for errors
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
 *     const { data, error } = await supabase
 *       .from('temporary_workers')
 *       .insert({ ...input, created_by: user?.id })
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
 *   async (input, { supabase }) => {
 *     const { data, error } = await supabase.auth.signInWithPassword(input);
 *     if (error) throw error;
 *     return data;
 *   },
 *   { schema: signInSchema, requireAuth: false }
 * );
 */
export function createAction<TInput, TOutput>(
  handler: ActionHandler<TInput, TOutput>,
  options: ActionOptions<TInput> = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  const { schema, requireAuth = true, revalidatePaths } = options;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    const [result, error] = await tryCatch(async () => {
      // 1. Validate input (throws ZodError if invalid)
      const validatedInput = validateInput(input, schema);

      // 2. Create Supabase client
      const supabase = await createClient();

      // 3. Authenticate user (throws AuthenticationError if not authenticated)
      const user = await authenticateUser(supabase, requireAuth);

      // 4. Execute the handler
      return handler(validatedInput, { supabase, user });
    });

    if (error) {
      return handleActionError(error);
    }

    // 5. Revalidate paths after successful execution
    if (revalidatePaths?.length) {
      for (const { path, type } of revalidatePaths) {
        revalidatePath(path, type);
      }
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
function handleActionError<T>(error: unknown): ActionResult<T> {
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
 * Type guard for Supabase AuthError.
 */
function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '__isAuthError' in error &&
    (error as Record<string, unknown>).__isAuthError === true
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
