/**
 * Test user credentials for E2E tests
 * Uses seeded user from supabase/seed.sql (created by `supabase db reset`)
 */
export const testUser = {
	email: process.env.E2E_TEST_USER_EMAIL || 'admin@test.com',
	password: process.env.E2E_TEST_USER_PASSWORD || 'password123',
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
