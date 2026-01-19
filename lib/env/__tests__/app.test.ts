import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The app.ts module eagerly validates at import time, so we need to:
// 1. Set up valid environment BEFORE importing to allow module to load
// 2. Then modify env and call validateAppEnv again to test different scenarios

const VALID_ENV = {
	NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
	NEXT_PUBLIC_SITE_URL: 'https://myapp.com',
};

describe('validateAppEnv', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		// Set up valid env to allow module import to succeed
		process.env = { ...originalEnv, ...VALID_ENV };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe('with valid environment variables', () => {
		it('returns success with parsed data', async () => {
			const { validateAppEnv } = await import('../app');
			const result = validateAppEnv({ throwOnError: false });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.NEXT_PUBLIC_SUPABASE_URL).toBe(
					VALID_ENV.NEXT_PUBLIC_SUPABASE_URL
				);
				expect(result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).toBe(
					VALID_ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
				);
				expect(result.data.NEXT_PUBLIC_SITE_URL).toBe(
					VALID_ENV.NEXT_PUBLIC_SITE_URL
				);
			}
		});

		it('exports validated env object', async () => {
			const { env } = await import('../app');

			expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(
				VALID_ENV.NEXT_PUBLIC_SUPABASE_URL
			);
			expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).toBe(
				VALID_ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
			);
			expect(env.NEXT_PUBLIC_SITE_URL).toBe(VALID_ENV.NEXT_PUBLIC_SITE_URL);
		});
	});

	describe('with invalid environment variables', () => {
		it('returns errors when throwOnError is false', async () => {
			const { validateAppEnv } = await import('../app');

			// Clear all app env vars to create invalid state
			delete process.env.NEXT_PUBLIC_SUPABASE_URL;
			delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
			delete process.env.NEXT_PUBLIC_SITE_URL;

			const result = validateAppEnv({ throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});

		it('throws error when throwOnError is true', async () => {
			const { validateAppEnv } = await import('../app');

			// Clear all app env vars to create invalid state
			delete process.env.NEXT_PUBLIC_SUPABASE_URL;
			delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
			delete process.env.NEXT_PUBLIC_SITE_URL;

			expect(() => validateAppEnv({ throwOnError: true })).toThrow(
				'Invalid environment variables'
			);
		});

		it('validates URL format for NEXT_PUBLIC_SUPABASE_URL', async () => {
			const { validateAppEnv } = await import('../app');

			// Modify env to have invalid URL
			process.env = {
				...originalEnv,
				...VALID_ENV,
				NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
			};

			const result = validateAppEnv({ throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.errors.some((e) => e.includes('NEXT_PUBLIC_SUPABASE_URL'))
				).toBe(true);
			}
		});

		it('validates URL format for NEXT_PUBLIC_SITE_URL', async () => {
			const { validateAppEnv } = await import('../app');

			process.env = {
				...originalEnv,
				...VALID_ENV,
				NEXT_PUBLIC_SITE_URL: 'invalid-url',
			};

			const result = validateAppEnv({ throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.errors.some((e) => e.includes('NEXT_PUBLIC_SITE_URL'))
				).toBe(true);
			}
		});

		it('validates NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not empty', async () => {
			const { validateAppEnv } = await import('../app');

			process.env = {
				...originalEnv,
				...VALID_ENV,
				NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: '',
			};

			const result = validateAppEnv({ throwOnError: false });

			expect(result.success).toBe(false);
		});
	});

	describe('error prefix option', () => {
		it('uses custom error prefix when provided', async () => {
			const { validateAppEnv } = await import('../app');

			// Clear all app env vars to create invalid state
			delete process.env.NEXT_PUBLIC_SUPABASE_URL;
			delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
			delete process.env.NEXT_PUBLIC_SITE_URL;

			expect(() =>
				validateAppEnv({ errorPrefix: 'Custom error', throwOnError: true })
			).toThrow('Custom error');
		});
	});

	describe('module initialization', () => {
		it('throws when env validation fails at import time', async () => {
			vi.resetModules();
			// Clear all app env vars before import to create invalid state
			delete process.env.NEXT_PUBLIC_SUPABASE_URL;
			delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
			delete process.env.NEXT_PUBLIC_SITE_URL;

			// validateAppEnv uses throwOnError: true by default, so validateEnv throws first
			await expect(import('../app')).rejects.toThrow(
				'Invalid environment variables'
			);
		});
	});
});
