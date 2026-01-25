import { ErrorCodes } from '@/services/shared/errors';

const SUCCESS_MESSAGES: Record<string, string> = {
	confirm_email:
		'Check your email and click the confirmation link to complete registration.',
	email_verified: 'Email verified successfully! You can now log in.',
};

const ERROR_MESSAGES: Record<string, string> = {
	[ErrorCodes.SESSION_EXPIRED]:
		'The verification link has expired. Please register again.',
	[ErrorCodes.VALIDATION_ERROR]: 'Invalid verification link. Please try again.',
	[ErrorCodes.NOT_AUTHENTICATED]: 'Authentication failed. Please try again.',
};

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
	otp_expired: 'The verification link has expired. Please register again.',
	otp_disabled: 'This verification method is not available.',
	access_denied: 'Access denied. Please try again.',
};

const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';

export const getSuccessMessage = (messageKey?: string): string | null => {
	if (!messageKey) return null;
	return SUCCESS_MESSAGES[messageKey] ?? null;
};

export const getUrlErrorMessage = (
	supabaseErrorCode?: string,
	supabaseErrorDescription?: string,
	appErrorCode?: string
): string | null => {
	if (supabaseErrorCode) {
		return (
			SUPABASE_ERROR_MESSAGES[supabaseErrorCode] ??
			supabaseErrorDescription?.replace(/\+/g, ' ') ??
			DEFAULT_ERROR_MESSAGE
		);
	}

	if (appErrorCode) {
		return ERROR_MESSAGES[appErrorCode] ?? DEFAULT_ERROR_MESSAGE;
	}

	return null;
};
