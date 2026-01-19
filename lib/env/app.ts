import { z } from 'zod';
import type { EnvValidationResult, ValidateEnvOptions } from './types';
import { validateEnv } from './types';

/**
 * Schema for application environment variables
 * Used by the Next.js app at runtime
 */
const appEnvSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.url().min(1),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
	NEXT_PUBLIC_SITE_URL: z.url().min(1),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

/**
 * Validates application environment variables using Zod schema
 */
export function validateAppEnv(
	options: ValidateEnvOptions = {}
): EnvValidationResult<AppEnv> {
	const values = {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
	};

	return validateEnv(appEnvSchema, values, {
		errorPrefix: 'Invalid environment variables',
		...options,
	});
}

/**
 * Eagerly validated environment variables
 * Throws at import time if validation fails
 */
const result = validateAppEnv();
if (!result.success) {
	throw new Error('App env validation failed');
}

export const env = result.data;
