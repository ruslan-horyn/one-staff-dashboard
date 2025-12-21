import type { Tables } from './database';

// ============================================================================
// Base Entity Type
// ============================================================================

/** User profile entity from database */
export type Profile = Tables<'profiles'>;

// ============================================================================
// Command Models (Input Types)
// ============================================================================

/** Input for user sign in */
export interface SignInInput {
  email: string;
  password: string;
}

/** Input for updating user profile */
export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
}
