import type { z } from 'zod';

/**
 * Result type for environment validation
 * Follows the same pattern as ActionResult for consistency
 */
export type EnvValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: string[] };

/**
 * Options for environment validation functions
 */
export interface ValidateEnvOptions {
	/** Prefix for error messages (default: 'Environment validation failed') */
	errorPrefix?: string;
	/** Whether to throw on validation failure (default: true) */
	throwOnError?: boolean;
}

/**
 * Generic environment validation function
 * Validates values against a Zod schema with consistent error handling
 *
 * @param schema - Zod schema to validate against
 * @param values - Values to validate
 * @param options - Validation options
 * @returns Validation result with typed data or errors
 */
export function validateEnv<T>(
	schema: z.ZodType<T>,
	values: unknown,
	options: ValidateEnvOptions = {}
): EnvValidationResult<T> {
	const { errorPrefix = 'Environment validation failed', throwOnError = true } =
		options;

	const parsed = schema.safeParse(values);

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
