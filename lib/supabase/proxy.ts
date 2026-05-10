import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/types/database';
import { env } from '../env';
import { routes } from '../routes';

const PUBLIC_MARKETING_PATHS = new Set<string>([routes.home, routes.privacy]);
const PUBLIC_ASSET_PREFIXES = ['/_next', '/favicon', '/landing-script'];

function normalizePathname(pathname: string): string {
	try {
		return new URL(pathname, 'http://x').pathname;
	} catch {
		return pathname;
	}
}

function isPublicMarketingPathname(pathname: string): boolean {
	const normalized = normalizePathname(pathname);
	if (PUBLIC_MARKETING_PATHS.has(normalized)) return true;
	return PUBLIC_ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export async function updateSession(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (isPublicMarketingPathname(pathname)) {
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

	// Do not add logic between createServerClient and getUser — Supabase guidance.
	const {
		data: { user },
	} = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

	const publicAuthRoutes = [
		routes.login,
		routes.register,
		routes.forgotPassword,
		routes.resetPassword,
		'/auth',
		'/signup',
	];
	const isPublicAuthRoute = publicAuthRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (!user && !isPublicAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.login;
		return NextResponse.redirect(url);
	}

	if (user && isPublicAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = routes.board;
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
