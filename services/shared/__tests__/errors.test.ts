import type { AuthError, PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
	createError,
	ErrorCodes,
	mapAuthError,
	mapSupabaseError,
	mapZodError,
} from '../errors';

describe('createError', () => {
	it('creates an error object with code and message', () => {
		const error = createError(ErrorCodes.NOT_FOUND, 'Resource not found');

		expect(error.code).toBe('NOT_FOUND');
		expect(error.message).toBe('Resource not found');
		expect(error.details).toBeUndefined();
	});

	it('creates an error object with details', () => {
		const error = createError(ErrorCodes.VALIDATION_ERROR, 'Invalid input', {
			field: 'name',
		});

		expect(error.code).toBe('VALIDATION_ERROR');
		expect(error.message).toBe('Invalid input');
		expect(error.details).toEqual({ field: 'name' });
	});

	it('handles empty details object', () => {
		const error = createError(ErrorCodes.NOT_FOUND, 'Not found', {});

		expect(error.details).toEqual({});
	});
});

describe('mapSupabaseError', () => {
	const createPostgrestError = (
		code: string,
		message: string,
		details = '',
		hint = ''
	): PostgrestError => ({
		name: 'PostgrestError',
		code,
		message,
		details,
		hint,
	});

	describe('PostgreSQL constraint violations', () => {
		it('maps unique violation (23505) to DUPLICATE_ENTRY', () => {
			const error = createPostgrestError(
				'23505',
				'duplicate key value violates unique constraint',
				'Key (phone)=(123456789) already exists'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
			expect(result.message).toContain('phone');
		});

		it('maps unique violation for email', () => {
			const error = createPostgrestError(
				'23505',
				'duplicate key value violates unique constraint',
				'Key (email)=(test@example.com) already exists'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
			expect(result.message).toContain('email');
		});

		it('maps unique violation for name', () => {
			const error = createPostgrestError(
				'23505',
				'duplicate key value violates unique constraint',
				'Key (name)=(Test) already exists'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
			expect(result.message).toContain('name');
		});

		it('maps unique violation with generic message when field unknown', () => {
			const error = createPostgrestError(
				'23505',
				'duplicate key value violates unique constraint',
				'Key (some_field)=(value) already exists'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
			expect(result.message).toBe('A record with this value already exists');
		});

		it('maps foreign key violation (23503) to HAS_DEPENDENCIES', () => {
			const error = createPostgrestError(
				'23503',
				'update or delete on table violates foreign key constraint'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.HAS_DEPENDENCIES);
			expect(result.message).toContain('cannot be deleted');
		});

		it('maps NOT NULL violation (23502) to VALIDATION_ERROR', () => {
			const error = createPostgrestError(
				'23502',
				'null value in column "first_name" violates not-null constraint'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
			expect(result.message).toBe('A required field is missing');
			expect(result.details?.field).toBe('first_name');
		});

		it('maps check violation (23514) to VALIDATION_ERROR', () => {
			const error = createPostgrestError(
				'23514',
				'new row violates check constraint'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
			expect(result.message).toContain('does not meet requirements');
		});

		it('maps insufficient privilege (42501) to FORBIDDEN', () => {
			const error = createPostgrestError(
				'42501',
				'permission denied for table users'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('permission');
		});
	});

	describe('PostgREST errors', () => {
		it('maps no rows returned (PGRST116) to NOT_FOUND', () => {
			const error = createPostgrestError(
				'PGRST116',
				'The result contains 0 rows'
			);

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.NOT_FOUND);
			expect(result.message).toContain('not found');
		});

		it('maps JWT expired (PGRST301) to SESSION_EXPIRED', () => {
			const error = createPostgrestError('PGRST301', 'JWT expired');

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
			expect(result.message).toContain('session');
		});

		it('maps JWT invalid (PGRST302) to SESSION_EXPIRED', () => {
			const error = createPostgrestError('PGRST302', 'JWT invalid');

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
			expect(result.message).toContain('session');
		});
	});

	describe('unknown errors', () => {
		it('maps unknown error to DATABASE_ERROR', () => {
			const error = createPostgrestError('UNKNOWN', 'Something went wrong');

			const result = mapSupabaseError(error);

			expect(result.code).toBe(ErrorCodes.DATABASE_ERROR);
			expect(result.details?.originalCode).toBe('UNKNOWN');
		});
	});
});

describe('mapAuthError', () => {
	const createAuthError = (code: string, message: string): AuthError =>
		({
			name: 'AuthApiError',
			message,
			status: 400,
			code,
		}) as AuthError;

	describe('credential errors', () => {
		it('maps invalid_credentials to INVALID_CREDENTIALS', () => {
			const error = createAuthError('invalid_credentials', 'Invalid login');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.INVALID_CREDENTIALS);
			expect(result.message).toContain('Invalid email or password');
		});
	});

	describe('email/phone confirmation', () => {
		it('maps email_not_confirmed to FORBIDDEN', () => {
			const error = createAuthError(
				'email_not_confirmed',
				'Email not confirmed'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('confirm your email');
		});

		it('maps phone_not_confirmed to FORBIDDEN', () => {
			const error = createAuthError(
				'phone_not_confirmed',
				'Phone not confirmed'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('confirm your phone');
		});
	});

	describe('session/JWT errors', () => {
		it('maps session_expired to SESSION_EXPIRED', () => {
			const error = createAuthError('session_expired', 'Session expired');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
		});

		it('maps refresh_token_not_found to SESSION_EXPIRED', () => {
			const error = createAuthError(
				'refresh_token_not_found',
				'Token not found'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
		});

		it('maps refresh_token_already_used to SESSION_EXPIRED', () => {
			const error = createAuthError('refresh_token_already_used', 'Token used');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
		});

		it('maps bad_jwt to SESSION_EXPIRED', () => {
			const error = createAuthError('bad_jwt', 'Bad JWT');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
		});
	});

	describe('OTP errors', () => {
		it('maps otp_expired to SESSION_EXPIRED', () => {
			const error = createAuthError('otp_expired', 'OTP expired');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.SESSION_EXPIRED);
			expect(result.message).toContain('verification code has expired');
		});

		it('maps otp_disabled to FORBIDDEN', () => {
			const error = createAuthError('otp_disabled', 'OTP disabled');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});
	});

	describe('password errors', () => {
		it('maps weak_password to VALIDATION_ERROR', () => {
			const error = createAuthError('weak_password', 'Password too short');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
			expect(result.message).toContain('security requirements');
		});

		it('maps same_password to VALIDATION_ERROR', () => {
			const error = createAuthError('same_password', 'Same password');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
			expect(result.message).toContain('different from current');
		});
	});

	describe('rate limiting', () => {
		it('maps over_request_rate_limit to FORBIDDEN', () => {
			const error = createAuthError('over_request_rate_limit', 'Rate limited');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('Too many requests');
		});

		it('maps over_email_send_rate_limit to FORBIDDEN', () => {
			const error = createAuthError(
				'over_email_send_rate_limit',
				'Email rate limited'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});

		it('maps over_sms_send_rate_limit to FORBIDDEN', () => {
			const error = createAuthError(
				'over_sms_send_rate_limit',
				'SMS rate limited'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});
	});

	describe('user existence', () => {
		it('maps user_not_found to NOT_FOUND', () => {
			const error = createAuthError('user_not_found', 'User not found');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.NOT_FOUND);
			expect(result.message).toContain('No account found');
		});

		it('maps user_already_exists to DUPLICATE_ENTRY', () => {
			const error = createAuthError('user_already_exists', 'User exists');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
		});

		it('maps email_exists to DUPLICATE_ENTRY', () => {
			const error = createAuthError('email_exists', 'Email exists');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
		});
	});

	describe('validation', () => {
		it('maps validation_failed to VALIDATION_ERROR', () => {
			const error = createAuthError('validation_failed', 'Invalid input');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
		});
	});

	describe('provider disabled', () => {
		it('maps signup_disabled to FORBIDDEN', () => {
			const error = createAuthError('signup_disabled', 'Signup disabled');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('disabled');
		});

		it('maps email_provider_disabled to FORBIDDEN', () => {
			const error = createAuthError(
				'email_provider_disabled',
				'Email disabled'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});

		it('maps phone_provider_disabled to FORBIDDEN', () => {
			const error = createAuthError(
				'phone_provider_disabled',
				'Phone disabled'
			);

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});

		it('maps provider_disabled to FORBIDDEN', () => {
			const error = createAuthError('provider_disabled', 'Provider disabled');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
		});
	});

	describe('user banned', () => {
		it('maps user_banned to FORBIDDEN', () => {
			const error = createAuthError('user_banned', 'User banned');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.FORBIDDEN);
			expect(result.message).toContain('suspended');
		});
	});

	describe('unknown auth errors', () => {
		it('maps unknown auth error to NOT_AUTHENTICATED', () => {
			const error = createAuthError('unknown_error', 'Unknown error');

			const result = mapAuthError(error);

			expect(result.code).toBe(ErrorCodes.NOT_AUTHENTICATED);
			expect(result.details?.code).toBe('unknown_error');
		});
	});
});

describe('mapZodError', () => {
	it('maps single field error', () => {
		const error = new ZodError([
			{
				code: 'too_small',
				minimum: 1,
				origin: 'string',
				inclusive: true,
				exact: false,
				message: 'String must contain at least 1 character(s)',
				path: ['name'],
			},
		]);

		const result = mapZodError(error);

		expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
		expect(result.message).toContain('name');
		expect(result.details?.fieldErrors).toEqual({
			name: ['String must contain at least 1 character(s)'],
		});
	});

	it('maps multiple field errors', () => {
		const error = new ZodError([
			{
				code: 'too_small',
				minimum: 1,
				origin: 'string',
				inclusive: true,
				exact: false,
				message: 'Required',
				path: ['firstName'],
			},
			{
				code: 'too_small',
				minimum: 1,
				origin: 'string',
				inclusive: true,
				exact: false,
				message: 'Required',
				path: ['lastName'],
			},
		]);

		const result = mapZodError(error);

		expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
		expect(result.details?.fieldErrors).toHaveProperty('firstName');
		expect(result.details?.fieldErrors).toHaveProperty('lastName');
	});

	it('maps nested path errors', () => {
		const error = new ZodError([
			{
				code: 'invalid_type',
				expected: 'string',
				message: 'Required',
				path: ['address', 'street'],
			},
		]);

		const result = mapZodError(error);

		expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
		expect(result.message).toContain('address.street');
	});

	it('maps root level errors', () => {
		const error = new ZodError([
			{
				code: 'invalid_type',
				expected: 'object',
				message: 'Expected object, received undefined',
				path: [],
			},
		]);

		const result = mapZodError(error);

		expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
		expect(result.details?.fieldErrors).toHaveProperty('_root');
	});

	it('aggregates multiple errors for the same field', () => {
		const error = new ZodError([
			{
				code: 'too_small',
				minimum: 3,
				origin: 'string',
				inclusive: true,
				exact: false,
				message: 'Too short',
				path: ['password'],
			},
			{
				code: 'custom',
				message: 'Must contain a number',
				path: ['password'],
			},
		]);

		const result = mapZodError(error);

		const fieldErrors = result.details?.fieldErrors as Record<string, string[]>;
		expect(fieldErrors.password).toHaveLength(2);
		expect(fieldErrors.password).toContain('Too short');
		expect(fieldErrors.password).toContain('Must contain a number');
	});

	it('includes issues array in details', () => {
		const error = new ZodError([
			{
				code: 'invalid_type',
				expected: 'string',
				message: 'Expected string',
				path: ['field'],
			},
		]);

		const result = mapZodError(error);

		expect(result.details?.issues).toBeDefined();
		expect(Array.isArray(result.details?.issues)).toBe(true);
	});
});
