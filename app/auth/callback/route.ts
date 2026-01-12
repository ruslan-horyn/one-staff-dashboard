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
		console.log('🚀 ~ handleCodeExchange ~ error:', error);
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
	type: string | null,
	next: string
): string {
	if (type === 'recovery') {
		return `${origin}/reset-password`;
	}
	return `${origin}${next}`;
}

/**
 * Create error redirect URL with error code
 */
function getErrorRedirectUrl(origin: string, errorCode: string): string {
	return `${origin}/forgot-password?error=${encodeURIComponent(errorCode)}`;
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
		console.log('🚀 ~ GET ~ result:', result);

		if (result.success) {
			return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
		}

		return NextResponse.redirect(
			getErrorRedirectUrl(origin, result.error.code)
		);
	}

	// Strategy 2: Token hash verification (email OTP flow)
	if (tokenHash && type) {
		const result = await handleTokenVerification(tokenHash, type);

		if (result.success) {
			return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
		}

		return NextResponse.redirect(
			getErrorRedirectUrl(origin, result.error.code)
		);
	}

	// No valid auth parameters provided
	return NextResponse.redirect(
		getErrorRedirectUrl(origin, ErrorCodes.VALIDATION_ERROR)
	);
}
