export function isSafeInternalRedirect(value: unknown): value is string {
	if (typeof value !== 'string' || value.length === 0) return false;
	if (!value.startsWith('/')) return false;
	if (value.startsWith('//')) return false;
	if (value.startsWith('/\\')) return false;
	return true;
}
