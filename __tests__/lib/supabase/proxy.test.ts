import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
	env: {
		NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:5101',
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
		NEXT_PUBLIC_SITE_URL: 'http://localhost:5100',
	},
}));

import { isPublicPathname } from '@/lib/supabase/proxy';

describe('isPublicPathname', () => {
	it('accepts marketing root and privacy paths', () => {
		expect(isPublicPathname('/')).toBe(true);
		expect(isPublicPathname('/privacy')).toBe(true);
	});

	it('accepts whitelisted static asset paths', () => {
		expect(isPublicPathname('/favicon.ico')).toBe(true);
		expect(isPublicPathname('/landing-script.js')).toBe(true);
	});

	it('accepts marketing RSC data routes', () => {
		expect(isPublicPathname('/_next/data/abc123/index.json')).toBe(true);
		expect(isPublicPathname('/_next/data/build-hash/privacy.json')).toBe(true);
	});

	it('rejects RSC data routes for protected pages', () => {
		expect(isPublicPathname('/_next/data/abc123/board.json')).toBe(false);
		expect(isPublicPathname('/_next/data/abc123/workers.json')).toBe(false);
	});

	it('rejects routes that look like marketing prefixes but are not', () => {
		expect(isPublicPathname('/privacy-internal')).toBe(false);
		expect(isPublicPathname('/privacysettings')).toBe(false);
		expect(isPublicPathname('/landing-scriptevil')).toBe(false);
	});

	it('rejects dashboard paths', () => {
		expect(isPublicPathname('/board')).toBe(false);
		expect(isPublicPathname('/workers')).toBe(false);
		expect(isPublicPathname('/clients')).toBe(false);
		expect(isPublicPathname('/login')).toBe(false);
	});

	it('rejects unrelated _next paths', () => {
		expect(isPublicPathname('/_next/server-action')).toBe(false);
	});
});
