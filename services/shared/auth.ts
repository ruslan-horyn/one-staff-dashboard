// ============================================================================
// Session Checking Utilities
// ============================================================================
// Provides helpers to check and retrieve the current user session from Supabase.
// Uses getUser() instead of getSession() for security (validates JWT with server).

import type { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of session check - either authenticated user or null.
 */
export interface SessionResult {
  user: User | null;
}

// ============================================================================
// Custom Error Class
// ============================================================================

/**
 * Custom error class for authentication failures.
 * Used internally by action wrapper to detect auth errors.
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ============================================================================
// Session Helpers
// ============================================================================

/**
 * Retrieves the current authenticated user from Supabase.
 *
 * Uses getUser() instead of getSession() for security:
 * - getUser() validates the JWT with Supabase Auth server
 * - getSession() only decodes locally (can be spoofed)
 *
 * @returns SessionResult with user object if authenticated, null otherwise
 *
 * @example
 * const { user } = await getSession();
 * if (!user) {
 *   return failure(ErrorCodes.NOT_AUTHENTICATED, 'Please log in');
 * }
 */
export async function getSession(): Promise<SessionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Log auth errors in development
  if (error && process.env.NODE_ENV === 'development') {
    console.error('[Auth Session Error]', error.message);
  }

  return { user: error ? null : user };
}

/**
 * Retrieves the current user or throws if not authenticated.
 * Use this in actions that require authentication.
 *
 * @returns User object (never null)
 * @throws AuthenticationError if user is not authenticated
 *
 * @example
 * const user = await requireSession();
 * // Proceed knowing user is authenticated
 */
export async function requireSession(): Promise<User> {
  const { user } = await getSession();

  if (!user) {
    throw new AuthenticationError('User is not authenticated');
  }

  return user;
}
