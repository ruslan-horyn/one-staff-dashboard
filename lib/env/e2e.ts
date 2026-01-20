import { z } from 'zod';
import type { EnvValidationResult, ValidateEnvOptions } from './types';

/**
 * E2E environment validation options
 */
export interface ValidateE2EEnvOptions extends ValidateEnvOptions {
	/** Allow default values for local development (default: false) */
	allowDefaults?: boolean;
}

/**
 * Resolves Supabase env vars using standard names
 */
function resolveSupabaseUrl(): string | undefined {
	return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function resolveSupabaseKey(): string | undefined {
	return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
}

function resolveSiteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Schema for E2E environment variables
 */
const e2eEnvSchema = z.object({
	SUPABASE_URL: z.url().min(1),
	SUPABASE_KEY: z.string().min(1),
	TEST_USER_EMAIL: z.email().min(1),
	TEST_USER_PASSWORD: z.string().min(1),
});

export type E2EEnvData = z.infer<typeof e2eEnvSchema>;

/**
 * Default test user credentials for local development
 */
export const LOCAL_DEFAULTS = {
	TEST_USER_EMAIL: 'admin@test.com',
	TEST_USER_PASSWORD: 'password123',
};

/**
 * Validates E2E environment variables
 *
 * @param options - Validation options
 * @returns Validation result with typed data or errors
 */
export function validateE2EEnv(
	options: ValidateE2EEnvOptions = {}
): EnvValidationResult<E2EEnvData> {
	const {
		errorPrefix = 'E2E environment validation failed',
		throwOnError = true,
		allowDefaults = false,
	} = options;

	const resolvedEnv = {
		SUPABASE_URL: resolveSupabaseUrl(),
		SUPABASE_KEY: resolveSupabaseKey(),
		...(allowDefaults
			? LOCAL_DEFAULTS
			: {
					TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
					TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
				}),
	};

	const parsed = e2eEnvSchema.safeParse(resolvedEnv);

	if (!parsed.success) {
		const errors = parsed.error.issues.map(
			(issue) => `${issue.path.join('.')}: ${issue.message}`
		);

		if (throwOnError) {
			throw new Error(`${errorPrefix}:\n  ${errors.join('\n  ')}`);
		}

		return { success: false, errors };
	}

	return { success: true, data: parsed.data };
}

/**
 * Gets Supabase configuration for E2E tests
 * Used by playwright.config.ts
 */
export function getE2ESupabaseConfig() {
	return {
		supabaseUrl: resolveSupabaseUrl(),
		supabaseKey: resolveSupabaseKey(),
		siteUrl: resolveSiteUrl(),
	};
}
