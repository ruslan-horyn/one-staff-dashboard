import type { Session, User } from '@supabase/supabase-js';

import type { Tables } from './database';

// ============================================================================
// Base Entity Type
// ============================================================================

/** User profile entity from database */
export type Profile = Tables<'profiles'>;

/** Profile with organization name, for dashboard display */
export type ProfileWithOrganization = Profile & {
	organization_name: string;
};

// ============================================================================
// Auth DTOs
// ============================================================================

/**
 * User with associated profile data from the profiles table.
 * Used by getCurrentUser action.
 */
export interface UserWithProfile {
	user: User;
	profile: ProfileWithOrganization;
}

/**
 * Response from Supabase auth operations (signIn, signUp).
 * User may be null for signUp if already exists.
 * Session may be null if email confirmation is required.
 */
export interface AuthResponse {
	user: User | null;
	session: Session | null;
}
