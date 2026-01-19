import { LOCAL_DEFAULTS } from '@/lib/env';

/**
 * Test user credentials for E2E tests
 * Uses seeded user from supabase/seed.sql (created by `supabase db reset`)
 */
export const testUser = {
	email: process.env.TEST_USER_EMAIL || LOCAL_DEFAULTS.TEST_USER_EMAIL,
	password: process.env.TEST_USER_PASSWORD || LOCAL_DEFAULTS.TEST_USER_PASSWORD,
} as const;

/**
 * Invalid credentials for testing failed login scenarios
 */
export const invalidCredentials = {
	email: 'invalid@example.com',
	password: 'WrongPassword123!',
} as const;

/**
 * Validation test data
 */
export const validationTestData = {
	invalidEmail: 'not-an-email',
	shortPassword: 'abc',
	validEmail: 'test@example.com',
	validPassword: 'ValidPassword123!',
} as const;
