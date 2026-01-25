import { describe, expect, it } from 'vitest';

import { getSuccessMessage, getUrlErrorMessage } from './getUrlMessages';

describe('getUrlMessages', () => {
	describe('getSuccessMessage', () => {
		it('returns message for confirm_email', () => {
			const result = getSuccessMessage('confirm_email');

			expect(result).toContain('Check your email');
		});

		it('returns message for email_verified', () => {
			const result = getSuccessMessage('email_verified');

			expect(result).toContain('Email verified successfully');
		});

		it('returns null for unknown message key', () => {
			const result = getSuccessMessage('unknown_key');

			expect(result).toBeNull();
		});

		it('returns null for undefined', () => {
			const result = getSuccessMessage(undefined);

			expect(result).toBeNull();
		});
	});

	describe('getUrlErrorMessage', () => {
		it('returns message for Supabase otp_expired error', () => {
			const result = getUrlErrorMessage('otp_expired', undefined, undefined);

			expect(result).toContain('verification link has expired');
		});

		it('returns message for Supabase otp_disabled error', () => {
			const result = getUrlErrorMessage('otp_disabled', undefined, undefined);

			expect(result).toContain('verification method is not available');
		});

		it('returns message for Supabase access_denied error', () => {
			const result = getUrlErrorMessage('access_denied', undefined, undefined);

			expect(result).toContain('Access denied');
		});

		it('falls back to error_description for unknown Supabase error', () => {
			const result = getUrlErrorMessage(
				'unknown_code',
				'Custom+error+message',
				undefined
			);

			expect(result).toBe('Custom error message');
		});

		it('returns default message for unknown Supabase error without description', () => {
			const result = getUrlErrorMessage('unknown_code', undefined, undefined);

			expect(result).toBe('An error occurred. Please try again.');
		});

		it('returns message for app SESSION_EXPIRED error', () => {
			const result = getUrlErrorMessage(
				undefined,
				undefined,
				'SESSION_EXPIRED'
			);

			expect(result).toContain('verification link has expired');
		});

		it('returns message for app VALIDATION_ERROR error', () => {
			const result = getUrlErrorMessage(
				undefined,
				undefined,
				'VALIDATION_ERROR'
			);

			expect(result).toContain('Invalid verification link');
		});

		it('returns message for app NOT_AUTHENTICATED error', () => {
			const result = getUrlErrorMessage(
				undefined,
				undefined,
				'NOT_AUTHENTICATED'
			);

			expect(result).toContain('Authentication failed');
		});

		it('returns default message for unknown app error', () => {
			const result = getUrlErrorMessage(undefined, undefined, 'UNKNOWN_ERROR');

			expect(result).toBe('An error occurred. Please try again.');
		});

		it('prioritizes Supabase error over app error', () => {
			const result = getUrlErrorMessage(
				'otp_expired',
				undefined,
				'NOT_AUTHENTICATED'
			);

			expect(result).toContain('verification link has expired');
		});

		it('returns null when no errors provided', () => {
			const result = getUrlErrorMessage(undefined, undefined, undefined);

			expect(result).toBeNull();
		});
	});
});
