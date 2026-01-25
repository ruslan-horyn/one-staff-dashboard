// ============================================================================
// Client Error Handlers
// ============================================================================
// Centralized error handling utilities for client-related operations.
// Provides consistent error messages and classification.

import type { ActionError } from '@/services/shared/result';

/**
 * User-friendly error messages for client operations.
 * Keys correspond to error codes from ActionError.
 */
export const CLIENT_ERROR_MESSAGES: Record<string, string> = {
	DUPLICATE_ENTRY: 'A client with this email already exists',
	HAS_DEPENDENCIES:
		'This client cannot be deleted because it has associated work locations. Please remove or reassign them first.',
	NOT_FOUND: 'Client not found. It may have already been deleted.',
	FORBIDDEN: 'You do not have permission to delete this client.',
	VALIDATION_ERROR: 'Please check the form for errors.',
	DATABASE_ERROR: 'A database error occurred. Please try again.',
	INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Blocking errors keep the dialog open and display inline.
 * Non-blocking errors close the dialog and show a toast.
 */
const BLOCKING_ERROR_CODES = new Set(['HAS_DEPENDENCIES']);

/**
 * Determines if an error should block the dialog from closing.
 * Blocking errors are displayed inline in the dialog.
 *
 * @param code - Error code from ActionError
 * @returns true if the error should keep the dialog open
 */
export function isBlockingError(code: string): boolean {
	return BLOCKING_ERROR_CODES.has(code);
}

/**
 * Gets a user-friendly error message for a given error.
 * Falls back to the error's message if no mapping exists.
 *
 * @param error - ActionError object
 * @returns User-friendly error message
 */
export function getClientErrorMessage(error: ActionError): string {
	return CLIENT_ERROR_MESSAGES[error.code] ?? error.message;
}

/**
 * Gets the field name from a DUPLICATE_ENTRY error.
 * Used to set form field errors on duplicate validation.
 *
 * @param error - ActionError object
 * @returns Field name if available, defaults to 'email'
 */
export function getDuplicateField(error: ActionError): string {
	return (error.details as { field?: string } | undefined)?.field ?? 'email';
}
