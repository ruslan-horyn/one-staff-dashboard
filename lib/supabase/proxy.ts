import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/types/database';
import { env } from '../env';
import { routes } from '../routes';

// Public marketing pages — exact match (per spec) so we never accidentally expose
// neighbouring routes like /privacy-internal or /privacysettings.
const MARKETING_PATHS = new Set<string>(['/', '/privacy']);

// Static asset prefixes that always bypass auth (Next.js internals + landing JS).
const ASSET_PREFIXES = ['/_next', '/favicon', '/landing-script'];

function normalizePath(pathname: string): string {
	try {
		return new URL(pathname, 'http://x').pathname;
	} catch {
		return pathname;
	}
}

function isMarketingPath(pathname: string): boolean {
	const normalized = normalizePath(pathname);
	if (MARKETING_PATHS.has(normalized)) return true;
	return ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * Updates the Supabase session by refreshing the auth token.
 * This function should be called in the proxy to keep sessions alive.
 *
 * What it does:
 * 1. Bypasses entirely for public marketing paths (/, /privacy) and static assets
 * 2. Creates a Supabase client with cookie access from the request
 * 3. Calls getUser() to validate and refresh the JWT token
 * 4. Redirects unauthenticated users to /login for protected routes
 * 5. Redirects authenticated users away from public auth pages
 * 6. Returns response with updated cookies
 */
export async function updateSession(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (isMarketingPath(pathname)) {
		return NextResponse.next();
	}

	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	// IMPORTANT: Do not add logic between createServerClient and getUser()
	// A simple mistake could make it hard to debug random logouts
	const {
		data: { user },
	} = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

	// Auth flow pages — authenticated users are redirected away, but session is still refreshed
	// Use routes as single source of truth; /auth and /signup are Supabase callback paths
	const publicRoutes = [
		routes.login,
		routes.register,
		routes.forgotPassword,
		routes.resetPassword,
		'/auth',
		'/signup',
	];
	const isPublicRoute = publicRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	// Redirect to login if user is not authenticated and route is protected
	if (!user && !isPublicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.login;
		return NextResponse.redirect(url);
	}

	// Redirect authenticated users away from auth pages
	if (user && isPublicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.board;
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
