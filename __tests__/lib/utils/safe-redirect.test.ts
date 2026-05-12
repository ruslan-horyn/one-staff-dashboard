import { describe, expect, it } from 'vitest';

import { isSafeInternalRedirect } from '@/lib/utils/safe-redirect';

describe('isSafeInternalRedirect', () => {
	it('accepts standard internal paths', () => {
		expect(isSafeInternalRedirect('/board')).toBe(true);
		expect(isSafeInternalRedirect('/workers/123')).toBe(true);
		expect(isSafeInternalRedirect('/?query=value')).toBe(true);
		expect(isSafeInternalRedirect('/path?a=1&b=2#section')).toBe(true);
	});

	it('rejects empty or non-string values', () => {
		expect(isSafeInternalRedirect('')).toBe(false);
		expect(isSafeInternalRedirect(undefined)).toBe(false);
		expect(isSafeInternalRedirect(null)).toBe(false);
		expect(isSafeInternalRedirect(123)).toBe(false);
		expect(isSafeInternalRedirect({})).toBe(false);
	});

	it('rejects absolute URLs', () => {
		expect(isSafeInternalRedirect('https://evil.com')).toBe(false);
		expect(isSafeInternalRedirect('http://evil.com/path')).toBe(false);
		expect(isSafeInternalRedirect('javascript:alert(1)')).toBe(false);
	});

	it('rejects protocol-relative URLs', () => {
		expect(isSafeInternalRedirect('//evil.com')).toBe(false);
		expect(isSafeInternalRedirect('//evil.com/foo')).toBe(false);
	});

	it('rejects backslashes anywhere in the path', () => {
		expect(isSafeInternalRedirect('/\\evil.com')).toBe(false);
		expect(isSafeInternalRedirect('/path\\evil')).toBe(false);
		expect(isSafeInternalRedirect('\\\\evil.com')).toBe(false);
	});

	it('rejects control characters anywhere in the path', () => {
		expect(isSafeInternalRedirect('\r\n//evil.com')).toBe(false);
		expect(isSafeInternalRedirect('\t/path')).toBe(false);
		expect(isSafeInternalRedirect('/path\nfoo')).toBe(false);
		expect(isSafeInternalRedirect(`/path${String.fromCharCode(0)}foo`)).toBe(
			false
		);
		expect(isSafeInternalRedirect(`/path${String.fromCharCode(0x7f)}`)).toBe(
			false
		);
	});

	it('rejects URL-encoded protocol-relative URLs', () => {
		expect(isSafeInternalRedirect('/%2F%2Fevil.com')).toBe(false);
		expect(isSafeInternalRedirect('/%2f%2fevil.com')).toBe(false);
	});

	it('rejects URL-encoded backslash', () => {
		expect(isSafeInternalRedirect('/%5Cevil.com')).toBe(false);
		expect(isSafeInternalRedirect('/%5cevil.com')).toBe(false);
	});

	it('rejects malformed percent-encoding', () => {
		expect(isSafeInternalRedirect('/%ZZ')).toBe(false);
	});

	it('rejects relative paths without leading slash', () => {
		expect(isSafeInternalRedirect('board')).toBe(false);
		expect(isSafeInternalRedirect('./board')).toBe(false);
		expect(isSafeInternalRedirect('../board')).toBe(false);
	});
});
