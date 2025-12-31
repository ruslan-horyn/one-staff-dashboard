// ============================================================================
// Try-Catch Utility with Result Type
// ============================================================================
// Provides a type-safe wrapper for async/sync operations that returns a tuple
// instead of throwing exceptions. Inspired by Go's error handling pattern.

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a successful result as a tuple [data, null].
 */
export type SuccessResult<T> = readonly [T, null];

/**
 * Represents an error result as a tuple [null, error].
 */
export type ErrorResult<E = Error> = readonly [null, E];

/**
 * Discriminated union of success and error results.
 *
 * @example
 * const [data, error] = await tryCatch(fetchUser());
 * if (error) {
 *   console.error(error.message);
 *   return;
 * }
 * // TypeScript knows data is not null here
 * console.log(data.name);
 */
export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

// ============================================================================
// Main Function (Unified: Promise | Function)
// ============================================================================

/**
 * Wraps an async/sync operation in a try-catch and returns a Result tuple.
 * Accepts either a Promise or a function (sync/async).
 *
 * @param handler - Promise or function to execute
 * @returns A tuple of [data, null] on success or [null, error] on failure
 *
 * @example
 * // With Promise
 * const [user, error] = await tryCatch(fetchUser(id));
 *
 * @example
 * // With async function
 * const [data, error] = await tryCatch(async () => {
 *   const user = await fetchUser(id);
 *   const profile = await fetchProfile(user.id);
 *   return { user, profile };
 * });
 *
 * @example
 * // With sync function
 * const [parsed, error] = await tryCatch(() => JSON.parse(jsonString));
 *
 * @example
 * // With Supabase query
 * const [data, error] = await tryCatch(
 *   supabase.from('users').select().single()
 * );
 */
export async function tryCatch<T, E = Error>(
	handler: Promise<T> | (() => T | Promise<T>)
): Promise<Result<T, E>> {
	try {
		const data =
			typeof handler === 'function' ? await handler() : await handler;
		return [data, null] as const;
	} catch (error) {
		return [null, error as E] as const;
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Type guard to check if result is successful.
 *
 * @example
 * const result = await tryCatch(fetchData());
 * if (isOk(result)) {
 *   const [data] = result;
 *   console.log(data);
 * }
 */
export function isOk<T, E>(result: Result<T, E>): result is SuccessResult<T> {
	return result[1] === null;
}

/**
 * Type guard to check if result is an error.
 *
 * @example
 * const result = await tryCatch(fetchData());
 * if (isErr(result)) {
 *   const [, error] = result;
 *   console.error(error.message);
 * }
 */
export function isErr<T, E>(result: Result<T, E>): result is ErrorResult<E> {
	return result[1] !== null;
}

/**
 * Unwraps a successful result or throws the error.
 *
 * @example
 * const result = await tryCatch(fetchData());
 * const data = unwrap(result); // throws if error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
	if (isErr(result)) {
		throw result[1];
	}
	return result[0];
}

/**
 * Unwraps a successful result or returns a default value.
 *
 * @example
 * const result = await tryCatch(fetchUser(id));
 * const user = unwrapOr(result, null);
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
	if (isErr(result)) {
		return defaultValue;
	}
	return result[0];
}
