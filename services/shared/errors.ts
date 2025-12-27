// ============================================================================
// Error Codes and Supabase Error Mapping
// ============================================================================
// Provides consistent error handling across all Server Actions.
// Maps Supabase/Zod errors to user-friendly ActionErrors.

import type { ZodError } from 'zod';
import type { PostgrestError, AuthError } from '@supabase/supabase-js';

import type { ActionError } from './result';

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Application error codes as const object for type safety.
 * Organized by category for maintainability.
 */
export const ErrorCodes = {
  // Authentication Errors (user identity)
  /** User is not logged in or session is missing */
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  /** Login credentials are incorrect */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  /** JWT token has expired */
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization Errors (user permissions)
  /** User lacks permission for this action */
  FORBIDDEN: 'FORBIDDEN',

  // Validation Errors (input data)
  /** Input data failed Zod schema validation */
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resource Errors (database entities)
  /** Requested resource does not exist */
  NOT_FOUND: 'NOT_FOUND',
  /** Unique constraint violation (e.g., duplicate phone) */
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  /** Cannot delete due to foreign key references */
  HAS_DEPENDENCIES: 'HAS_DEPENDENCIES',

  // Business Logic Errors (domain rules)
  /** End date/time is before start date/time */
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  // System Errors (infrastructure)
  /** Unexpected error in application code */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Database operation failed unexpectedly */
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/** Type representing any valid error code */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================================================
// Error Creation Helper
// ============================================================================

/**
 * Creates a structured ActionError object.
 *
 * @param code - Machine-readable error code from ErrorCodes
 * @param message - Human-readable message for UI
 * @param details - Optional additional context
 * @returns ActionError object
 *
 * @example
 * createError(ErrorCodes.NOT_FOUND, 'Worker not found', { id: workerId })
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ActionError {
  return { code, message, ...(details && { details }) };
}

// ============================================================================
// PostgreSQL and PostgREST Error Codes
// ============================================================================

/**
 * PostgreSQL error codes that we handle specifically.
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INSUFFICIENT_PRIVILEGE: '42501',
} as const;

/**
 * PostgREST-specific error codes.
 * @see https://postgrest.org/en/stable/references/errors.html
 */
const POSTGREST_ERROR_CODES = {
  NO_ROWS_RETURNED: 'PGRST116',
  JWT_EXPIRED: 'PGRST301',
  JWT_INVALID: 'PGRST302',
} as const;

// ============================================================================
// Supabase PostgrestError Mapping
// ============================================================================

/**
 * Maps Supabase PostgrestError to application ActionError.
 * Handles common database and PostgREST errors with user-friendly messages.
 *
 * @param error - PostgrestError from Supabase client
 * @returns ActionError with appropriate code and message
 *
 * @example
 * const { data, error } = await supabase.from('workers').insert(...)
 * if (error) {
 *   return { success: false, error: mapSupabaseError(error) };
 * }
 */
export function mapSupabaseError(error: PostgrestError): ActionError {
  // Handle PostgreSQL constraint violations
  switch (error.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      return createError(
        ErrorCodes.DUPLICATE_ENTRY,
        extractDuplicateFieldMessage(error.details),
        { constraint: error.details, hint: error.hint }
      );

    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return createError(
        ErrorCodes.HAS_DEPENDENCIES,
        'This record cannot be deleted because other records depend on it',
        { constraint: error.details }
      );

    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      return createError(
        ErrorCodes.VALIDATION_ERROR,
        'A required field is missing',
        { field: extractFieldFromError(error.message) }
      );

    case PG_ERROR_CODES.CHECK_VIOLATION:
      return createError(
        ErrorCodes.VALIDATION_ERROR,
        'The provided value does not meet requirements',
        { constraint: error.details }
      );

    case PG_ERROR_CODES.INSUFFICIENT_PRIVILEGE:
      return createError(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to perform this action'
      );
  }

  // Handle PostgREST errors
  switch (error.code) {
    case POSTGREST_ERROR_CODES.NO_ROWS_RETURNED:
      return createError(
        ErrorCodes.NOT_FOUND,
        'The requested resource was not found'
      );

    case POSTGREST_ERROR_CODES.JWT_EXPIRED:
    case POSTGREST_ERROR_CODES.JWT_INVALID:
      return createError(
        ErrorCodes.SESSION_EXPIRED,
        'Your session has expired. Please log in again.'
      );
  }

  // Log unexpected errors in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[Supabase Error]', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  // Default fallback for unhandled errors
  return createError(
    ErrorCodes.DATABASE_ERROR,
    'An unexpected database error occurred. Please try again.',
    { originalCode: error.code, originalMessage: error.message }
  );
}

// ============================================================================
// Supabase AuthError Mapping
// ============================================================================

/**
 * Maps Supabase AuthError to application ActionError.
 * Handles authentication-specific errors.
 *
 * @param error - AuthError from Supabase auth methods
 * @returns ActionError with appropriate code and message
 */
export function mapAuthError(error: AuthError): ActionError {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Auth Error]', {
      name: error.name,
      message: error.message,
      status: error.status,
    });
  }

  const message = error.message.toLowerCase();

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid email or password')
  ) {
    return createError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  if (message.includes('email not confirmed')) {
    return createError(
      ErrorCodes.FORBIDDEN,
      'Please confirm your email address before logging in'
    );
  }

  if (message.includes('user not found') || message.includes('no user found')) {
    return createError(ErrorCodes.NOT_FOUND, 'No account found with this email address');
  }

  if (
    error.status === 401 ||
    message.includes('session') ||
    message.includes('jwt')
  ) {
    return createError(
      ErrorCodes.SESSION_EXPIRED,
      'Your session has expired. Please log in again.'
    );
  }

  // Default auth error
  return createError(
    ErrorCodes.INTERNAL_ERROR,
    'An authentication error occurred. Please try again.',
    { originalMessage: error.message }
  );
}

// ============================================================================
// Zod Validation Error Formatting
// ============================================================================

/**
 * Formats Zod validation errors into ActionError.
 * Extracts field-level errors for form display.
 *
 * @param error - ZodError from schema.safeParse()
 * @returns ActionError with field-level error details
 */
export function mapZodError(error: ZodError): ActionError {
  // Convert Zod issues to a field -> message map
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  // Get first error message for the main message
  const firstIssue = error.issues[0];
  const mainMessage = firstIssue
    ? `${firstIssue.path.join('.') || 'Input'}: ${firstIssue.message}`
    : 'Invalid input data';

  return createError(ErrorCodes.VALIDATION_ERROR, mainMessage, {
    fieldErrors,
    issues: error.issues,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts a user-friendly message for duplicate entry errors.
 * Attempts to identify which field caused the conflict.
 */
function extractDuplicateFieldMessage(details: string | null): string {
  if (details?.includes('phone')) {
    return 'A record with this phone number already exists';
  }
  if (details?.includes('email')) {
    return 'A record with this email already exists';
  }
  if (details?.includes('name')) {
    return 'A record with this name already exists';
  }

  return 'A record with this value already exists';
}

/**
 * Attempts to extract field name from NOT NULL violation message.
 */
function extractFieldFromError(message: string): string | undefined {
  // PostgreSQL format: 'null value in column "field_name" violates not-null constraint'
  const match = message.match(/column "([^"]+)"/);
  return match?.[1];
}
