import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getE2ESupabaseConfig, LOCAL_DEFAULTS, validateE2EEnv } from '../e2e';

const VALID_ENV = {
	NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
	TEST_USER_EMAIL: 'test@example.com',
	TEST_USER_PASSWORD: 'password123',
};

describe('validateE2EEnv', () => {
	beforeEach(() => {
		vi.stubGlobal('process', {
			env: {},
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('with valid environment variables', () => {
		it('returns success with parsed data', () => {
			vi.stubGlobal('process', { env: VALID_ENV });

			const result = validateE2EEnv({ throwOnError: false });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.SUPABASE_URL).toBe(
					VALID_ENV.NEXT_PUBLIC_SUPABASE_URL
				);
				expect(result.data.SUPABASE_KEY).toBe(
					VALID_ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
				);
				expect(result.data.TEST_USER_EMAIL).toBe(VALID_ENV.TEST_USER_EMAIL);
				expect(result.data.TEST_USER_PASSWORD).toBe(
					VALID_ENV.TEST_USER_PASSWORD
				);
			}
		});
	});

	describe('allowDefaults option', () => {
		it('uses LOCAL_DEFAULTS when allowDefaults is true', () => {
			vi.stubGlobal('process', {
				env: {
					NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
					NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
				},
			});

			const result = validateE2EEnv({
				throwOnError: false,
				allowDefaults: true,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.TEST_USER_EMAIL).toBe(
					LOCAL_DEFAULTS.TEST_USER_EMAIL
				);
				expect(result.data.TEST_USER_PASSWORD).toBe(
					LOCAL_DEFAULTS.TEST_USER_PASSWORD
				);
			}
		});

		it('fails validation when allowDefaults is false and credentials missing', () => {
			vi.stubGlobal('process', {
				env: {
					NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
					NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
				},
			});

			const result = validateE2EEnv({
				throwOnError: false,
				allowDefaults: false,
			});

			expect(result.success).toBe(false);
		});
	});

	describe('error handling', () => {
		it('throws error when throwOnError is true (default)', () => {
			vi.stubGlobal('process', { env: {} });

			expect(() => validateE2EEnv()).toThrow(
				'E2E environment validation failed'
			);
		});

		it('returns errors when throwOnError is false', () => {
			vi.stubGlobal('process', { env: {} });

			const result = validateE2EEnv({ throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});

		it('uses custom error prefix', () => {
			vi.stubGlobal('process', { env: {} });

			expect(() => validateE2EEnv({ errorPrefix: 'Custom error' })).toThrow(
				'Custom error'
			);
		});
	});
});

describe('getE2ESupabaseConfig', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns resolved Supabase configuration', () => {
		vi.stubGlobal('process', {
			env: {
				NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
				NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
				NEXT_PUBLIC_SITE_URL: 'https://myapp.com',
			},
		});

		const config = getE2ESupabaseConfig();

		expect(config.supabaseUrl).toBe('https://test.supabase.co');
		expect(config.supabaseKey).toBe('test-key');
		expect(config.siteUrl).toBe('https://myapp.com');
	});

	it('uses default siteUrl when not specified', () => {
		vi.stubGlobal('process', { env: {} });

		const config = getE2ESupabaseConfig();

		expect(config.siteUrl).toBe('http://localhost:3000');
	});

	it('returns undefined for missing Supabase config', () => {
		vi.stubGlobal('process', { env: {} });

		const config = getE2ESupabaseConfig();

		expect(config.supabaseUrl).toBeUndefined();
		expect(config.supabaseKey).toBeUndefined();
	});
});

describe('LOCAL_DEFAULTS', () => {
	it('contains expected default values', () => {
		expect(LOCAL_DEFAULTS.TEST_USER_EMAIL).toBe('admin@test.com');
		expect(LOCAL_DEFAULTS.TEST_USER_PASSWORD).toBe('password123');
	});
});
