import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/types/database';
import { env } from '../env';
import { routes } from '../routes';

const PUBLIC_MARKETING_PATHS = new Set<string>([routes.home, routes.privacy]);
const PUBLIC_STATIC_PATHS = new Set<string>([
	'/favicon.ico',
	'/landing-script.js',
]);

function normalizePathname(pathname: string): string {
	try {
		return new URL(pathname, 'http://x').pathname;
	} catch {
		return pathname;
	}
}

function isPublicMarketingDataPathname(pathname: string): boolean {
	return /^\/_next\/data\/[^/]+\/(index|privacy)\.json$/.test(pathname);
}

function isPublicPathname(pathname: string): boolean {
	const normalized = normalizePathname(pathname);
	if (PUBLIC_MARKETING_PATHS.has(normalized)) return true;
	if (PUBLIC_STATIC_PATHS.has(normalized)) return true;
	if (isPublicMarketingDataPathname(normalized)) return true;
	return false;
}

function isPublicAuthRoutePathname(pathname: string): boolean {
	const publicAuthRoutes = [
		routes.login,
		routes.register,
		routes.forgotPassword,
		routes.resetPassword,
		'/auth',
		'/signup',
	];
	return publicAuthRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);
}

export async function updateSession(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (isPublicPathname(pathname)) {
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

	const {
		data: { user },
	} = await supabase.auth.getUser().catch((error) => {
		if (process.env.NODE_ENV === 'development') {
			console.error('[Proxy] supabase.auth.getUser() failed:', error);
		}
		return { data: { user: null } };
	});

	const onPublicAuthRoute = isPublicAuthRoutePathname(pathname);

	if (!user && !onPublicAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.login;
		return NextResponse.redirect(url);
	}

	if (user && onPublicAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.board;
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
