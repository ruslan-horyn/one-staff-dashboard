import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { ErrorCodes, mapAuthError } from '@/services/shared/errors';
import { type ActionResult, failure, success } from '@/services/shared/result';

// =============================================================================
// TYPES
// =============================================================================

type OtpType = 'recovery' | 'email' | 'signup' | 'invite';

// =============================================================================
// AUTH HANDLERS (Single Responsibility)
// =============================================================================

/**
 * Handle PKCE code exchange (OAuth-style flow)
 * Used when Supabase sends ?code=xxx parameter
 */
async function handleCodeExchange(code: string): Promise<ActionResult<void>> {
	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		const mappedError = mapAuthError(error);
		return failure(mappedError.code, mappedError.message, mappedError.details);
	}

	return success(undefined);
}

/**
 * Handle OTP token verification (email magic link flow)
 * Used when Supabase sends ?token_hash=xxx&type=xxx parameters
 */
async function handleTokenVerification(
	tokenHash: string,
	type: OtpType
): Promise<ActionResult<void>> {
	const supabase = await createClient();
	const { error } = await supabase.auth.verifyOtp({
		type,
		token_hash: tokenHash,
	});

	if (error) {
		const mappedError = mapAuthError(error);
		return failure(mappedError.code, mappedError.message, mappedError.details);
	}

	return success(undefined);
}

// =============================================================================
// REDIRECT HELPERS (Single Responsibility)
// =============================================================================

/**
 * Validate and sanitize the next parameter to prevent open redirect attacks
 */
function sanitizeNextParam(next: string | null): string {
	if (!next) return '/';
	return next.startsWith('/') ? next : '/';
}

/**
 * Determine success redirect URL based on auth type
 */
function getSuccessRedirectUrl(
	origin: string,
	type: OtpType | null,
	next: string
): string {
	if (type === 'recovery') {
		return `${origin}/reset-password`;
	}
	if (type === 'signup') {
		return `${origin}/login?message=email_verified`;
	}
	return `${origin}${next}`;
}

const destinationMap: Record<OtpType, string> = {
	recovery: '/forgot-password',
	signup: '/login',
	email: '/login',
	invite: '/login',
};

/**
 * Create error redirect URL with error code based on auth type
 */
function getErrorRedirectUrl(
	origin: string,
	type: OtpType | null,
	errorCode: string
): string {
	const destination = destinationMap[type ?? 'signup'];
	return `${origin}${destination}?error=${encodeURIComponent(errorCode)}`;
}

// =============================================================================
// MAIN ROUTE HANDLER
// =============================================================================

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);

	const code = searchParams.get('code');
	const tokenHash = searchParams.get('token_hash');
	const type = searchParams.get('type') as OtpType | null;
	const next = sanitizeNextParam(searchParams.get('next'));

	// Strategy 1: PKCE code exchange (higher priority)
	if (code) {
		const result = await handleCodeExchange(code);

		if (result.success) {
			return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
		}

		return NextResponse.redirect(
			getErrorRedirectUrl(origin, type, result.error.code)
		);
	}

	// Strategy 2: Token hash verification (email OTP flow)
	if (tokenHash && type) {
		const result = await handleTokenVerification(tokenHash, type);

		if (result.success) {
			return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
		}

		return NextResponse.redirect(
			getErrorRedirectUrl(origin, type, result.error.code)
		);
	}

	// No valid auth parameters provided
	return NextResponse.redirect(
		getErrorRedirectUrl(origin, null, ErrorCodes.VALIDATION_ERROR)
	);
}
