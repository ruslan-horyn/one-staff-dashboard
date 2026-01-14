/**
 * SSR-safe window accessor.
 * Returns window object in browser, undefined in SSR.
 */
export const getWindow = (): Window | undefined =>
	typeof window !== 'undefined' ? window : undefined;
