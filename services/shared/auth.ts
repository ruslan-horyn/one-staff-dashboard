// ============================================================================
// Session Checking Utilities
// ============================================================================
// Provides helpers to check and retrieve the current user session from Supabase.
// Uses getUser() for security (validates JWT with server), then fetches
// role and organization from profiles table.

import type { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/common';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of session check - user, role and organization from profiles table.
 */
export interface SessionResult {
	user: User | null;
	role: UserRole | null;
	organizationName: string | null;
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
 * Retrieves the current authenticated user, role and organization from Supabase.
 *
 * Uses getUser() for security (validates JWT with server),
 * then fetches role and organization name from profiles table (with join).
 *
 * @returns SessionResult with user, role and organizationName, or nulls if not authenticated
 *
 * @example
 * const { user, role, organizationName } = await getSession();
 * if (!user) {
 *   redirect('/login');
 * }
 * if (role === 'admin') {
 *   // Admin-only logic
 * }
 * console.log(`Welcome to ${organizationName}`);
 */
export async function getSession(): Promise<SessionResult> {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		// No session is expected on public routes - return gracefully without logging
		return { user: null, role: null, organizationName: null };
	}

	// Fetch role and organization name from profiles table
	const { data: profile } = await supabase
		.from('profiles')
		.select('role, organizations(name)')
		.eq('id', user.id)
		.single()
		.throwOnError();

	return {
		user,
		role: profile.role,
		organizationName: profile.organizations.name,
	};
}

/**
 * Result of requireSession - authenticated user with role and organization.
 */
export interface AuthenticatedSession {
	user: User;
	role: UserRole;
	organizationName: string;
}

/**
 * Retrieves the current user or throws if not authenticated.
 * Use this in actions that require authentication.
 *
 * @returns AuthenticatedSession with user, role and organizationName
 * @throws AuthenticationError if user is not authenticated
 *
 * @example
 * const { user, role, organizationName } = await requireSession();
 * // Proceed knowing user is authenticated
 */
export async function requireSession(): Promise<AuthenticatedSession> {
	const { user, role, organizationName } = await getSession();

	if (!user || !role || !organizationName) {
		throw new AuthenticationError('User is not authenticated');
	}

	return { user, role, organizationName };
}
