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

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

import { type ActionResult, failure, success } from './result';
import { ErrorCodes, mapSupabaseError, mapAuthError, mapZodError } from './errors';
import { getSession, AuthenticationError } from './auth';

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
  const { schema, requireAuth = true } = options;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // Step 1: Validate input if schema provided
      let validatedInput = input;
      if (schema) {
        const parseResult = schema.safeParse(input);
        if (!parseResult.success) {
          return {
            success: false,
            error: mapZodError(parseResult.error),
          };
        }
        validatedInput = parseResult.data;
      }

      // Step 2: Create Supabase client
      const supabase = await createClient();

      // Step 3: Check authentication if required
      let user: User | null = null;
      if (requireAuth) {
        const { user: sessionUser } = await getSession();
        if (!sessionUser) {
          return failure(
            ErrorCodes.NOT_AUTHENTICATED,
            'You must be logged in to perform this action'
          );
        }
        user = sessionUser;
      }

      // Step 4: Execute the action handler
      const result = await handler(validatedInput, { supabase, user });

      // Step 5: Return success
      return success(result);
    } catch (error) {
      // Handle known error types
      return handleActionError(error);
    }
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
    return {
      success: false,
      error: mapSupabaseError(error),
    };
  }

  // Supabase AuthError (from auth operations)
  if (isAuthError(error)) {
    return {
      success: false,
      error: mapAuthError(error),
    };
  }

  // Zod validation error (if thrown manually)
  if (isZodError(error)) {
    return {
      success: false,
      error: mapZodError(error),
    };
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
