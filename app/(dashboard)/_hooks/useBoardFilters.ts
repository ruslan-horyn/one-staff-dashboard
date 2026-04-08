'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Returns the current board search filter value from the URL.
 * Search is synced via SearchInput component using the 'search' URL param.
 */
export function useBoardFilters() {
	const searchParams = useSearchParams();
	const search = searchParams.get('search') ?? undefined;
	return { search };
}
