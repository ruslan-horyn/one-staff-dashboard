'use client';

import { useCallback, useEffect, useRef } from 'react';
import { type UseSearchInputReturn, useSearchInput } from './useSearchInput';
import { useUrlSearchParam } from './useUrlSearchParam';

export interface UseSearchInputUrlOptions {
	urlParam: string;
	debounceMs?: number;
	onSearch?: (value: string) => void;
	minChars?: number;
}

/**
 * Hook for search input with URL synchronization.
 *
 * Composes useSearchInput and useUrlSearchParam to provide
 * seamless URL sync with debouncing and minChars validation.
 *
 * @example
 * const { value, onChange, clear } = useSearchInputUrl({
 *   urlParam: 'search',
 *   onSearch: (query) => refreshData(),
 *   minChars: 3,
 * });
 */
export function useSearchInputUrl(
	options: UseSearchInputUrlOptions
): UseSearchInputReturn {
	const { urlParam, debounceMs, onSearch, minChars = 0 } = options;

	const urlSync = useUrlSearchParam(urlParam);

	// Refs for stable callbacks
	const urlSyncRef = useRef(urlSync);
	urlSyncRef.current = urlSync;

	const onSearchRef = useRef(onSearch);
	onSearchRef.current = onSearch;

	const minCharsRef = useRef(minChars);
	minCharsRef.current = minChars;

	const prevUrlValueRef = useRef(urlSync.value);

	// Handle search with minChars validation and URL update
	const handleSearch = useCallback((query: string) => {
		const min = minCharsRef.current;

		if (min > 0 && query.length > 0 && query.length < min) {
			prevUrlValueRef.current = '';
			urlSyncRef.current.clearValue();
			return;
		}

		prevUrlValueRef.current = query;
		urlSyncRef.current.setValue(query);
		onSearchRef.current?.(query);
	}, []);

	const { value, searchValue, onChange, setValue, clear, isDebouncing } =
		useSearchInput({
			defaultValue: urlSync.value,
			debounceMs,
			onSearch: handleSearch,
		});

	// Sync with URL changes from browser navigation (back/forward)
	useEffect(() => {
		const prevUrlValue = prevUrlValueRef.current;
		prevUrlValueRef.current = urlSync.value;

		if (urlSync.value !== prevUrlValue) {
			setValue(urlSync.value);
			onSearchRef.current?.(urlSync.value);
		}
	}, [urlSync.value, setValue]);

	// Override clear to also clear URL
	const handleClear = useCallback(() => {
		prevUrlValueRef.current = '';
		clear();
		urlSyncRef.current.clearValue();
	}, [clear]);

	return {
		value,
		searchValue,
		onChange,
		setValue,
		clear: handleClear,
		isDebouncing,
	};
}
