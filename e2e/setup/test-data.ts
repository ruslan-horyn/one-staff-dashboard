import { LOCAL_DEFAULTS } from '@/lib/env/e2e';

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

/**
 * Generate unique client data for create tests
 */
export const createClientTestData = () => {
	const timestamp = Date.now();
	return {
		name: `E2E Client ${timestamp}`,
		email: `e2e-${timestamp}@test.com`,
		phone: '+48123456789',
		address: '123 Test Street, Warsaw',
	};
};

/**
 * Generate client data with minimum required fields only
 */
export const createMinimalClientTestData = () => {
	const timestamp = Date.now();
	return {
		name: `Min Client ${timestamp}`,
		email: `min-${timestamp}@test.com`,
		phone: '+48111111111',
		address: 'A',
	};
};

/**
 * Generate client data with maximum length fields
 */
export const createMaxLengthClientTestData = () => {
	const timestamp = Date.now();
	return {
		name: 'A'.repeat(255), // Max 255 chars
		email: `max-${timestamp}@test.com`,
		phone: '+48 (123) 456-7890', // 20 chars with formatting
		address: 'B'.repeat(500), // Max 500 chars
	};
};

/**
 * Invalid email formats for validation testing
 */
export const invalidEmailFormats = [
	'not-an-email',
	'missing-at-sign.com',
	'@missing-local.com',
	'missing-domain@',
	'spaces in@email.com',
	'double..dots@test.com',
] as const;

/**
 * Invalid phone formats for validation testing
 * Note: PhoneInput normalizes input (strips non-digits except leading +)
 * so we test formats that remain invalid after normalization
 */
export const invalidPhoneFormats = [
	'123', // Too short (< 9 chars) - normalized to '123'
	'12345678', // Still too short (8 chars) - normalized to '12345678'
	'abc', // Letters only - normalized to '' (empty, fails min length)
] as const;

/**
 * Special characters for search testing
 */
export const specialSearchChars = [
	"O'Brien & Sons",
	'Test "Quote" Client',
	'Client <special>',
] as const;
