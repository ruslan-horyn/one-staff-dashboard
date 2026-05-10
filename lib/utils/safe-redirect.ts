function hasControlCharacter(value: string): boolean {
	for (let i = 0; i < value.length; i++) {
		const charCode = value.charCodeAt(i);
		if (charCode <= 0x1f || charCode === 0x7f) return true;
	}
	return false;
}

export function isSafeInternalRedirect(value: unknown): value is string {
	if (typeof value !== 'string' || value.length === 0) return false;
	if (hasControlCharacter(value)) return false;
	if (value.includes('\\')) return false;
	if (!value.startsWith('/')) return false;
	if (value.startsWith('//')) return false;

	let decoded: string;
	try {
		decoded = decodeURIComponent(value);
	} catch {
		return false;
	}
	if (decoded.includes('\\')) return false;
	if (decoded.startsWith('//')) return false;

	return true;
}
