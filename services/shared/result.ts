// ============================================================================
// ActionResult Type and Helpers
// ============================================================================
// Provides a unified response format for all Server Actions.
// Uses discriminated union for proper TypeScript type narrowing.

/**
 * Structured error object returned on failure.
 */
export interface ActionError {
	/** Machine-readable error code (e.g., 'NOT_AUTHENTICATED') */
	code: string;
	/** Human-readable error message for UI display */
	message: string;
	/** Optional additional context (field errors, constraint names, etc.) */
	details?: Record<string, unknown>;
}

/**
 * Discriminated union for Server Action responses.
 * Uses `success` boolean as discriminator for type narrowing.
 *
 * @example
 * const result: ActionResult<Worker> = await createWorker(input);
 * if (result.success) {
 *   console.log(result.data.id); // TypeScript knows data exists
 * } else {
 *   console.log(result.error.message); // TypeScript knows error exists
 * }
 */
export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: ActionError };

/**
 * Creates a successful ActionResult with data.
 *
 * @param data - The data to return on success
 * @returns ActionResult with success: true and data
 *
 * @example
 * return success({ id: '123', name: 'John' });
 */
export function success<T>(data: T): ActionResult<T> {
	return { success: true, data };
}

/**
 * Creates a failed ActionResult with error details.
 *
 * @param code - Machine-readable error code
 * @param message - Human-readable error message
 * @param details - Optional additional context
 * @returns ActionResult with success: false and error
 *
 * @example
 * return failure('NOT_FOUND', 'Worker not found');
 * return failure('VALIDATION_ERROR', 'Invalid input', { fieldErrors: { name: ['Required'] } });
 */
export function failure<T = never>(
	code: string,
	message: string,
	details?: Record<string, unknown>
): ActionResult<T> {
	return {
		success: false,
		error: { code, message, ...(details && { details }) },
	};
}

/**
 * Type guard to check if result is successful.
 * Enables TypeScript narrowing in consumers.
 *
 * @param result - ActionResult to check
 * @returns true if result is successful
 *
 * @example
 * if (isSuccess(result)) {
 *   console.log(result.data); // TypeScript knows data exists
 * }
 */
export function isSuccess<T>(
	result: ActionResult<T>
): result is { success: true; data: T } {
	return result.success === true;
}

/**
 * Type guard to check if result is a failure.
 *
 * @param result - ActionResult to check
 * @returns true if result is a failure
 *
 * @example
 * if (isFailure(result)) {
 *   console.log(result.error.message); // TypeScript knows error exists
 * }
 */
export function isFailure<T>(
	result: ActionResult<T>
): result is { success: false; error: ActionError } {
	return result.success === false;
}
