'use client';

import { debounce } from 'lodash-es';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseSearchInputOptions {
	defaultValue?: string;
	debounceMs?: number;
	syncWithUrl?: boolean;
	urlParam?: string;
	onSearch?: (value: string) => void;
}

export interface UseSearchInputReturn {
	value: string;
	debouncedValue: string;
	onChange: (value: string) => void;
	clear: () => void;
	isDebouncing: boolean;
}

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_URL_PARAM = 'search';

/**
 * Hook for search input with debouncing and optional URL synchronization.
 *
 * @example
 * // Basic usage
 * const { value, debouncedValue, onChange, clear } = useSearchInput({
 *   onSearch: (query) => console.log('Search:', query),
 * });
 *
 * @example
 * // With URL sync
 * const { value, onChange } = useSearchInput({
 *   syncWithUrl: true,
 *   urlParam: 'q',
 * });
 */
export function useSearchInput(
	options: UseSearchInputOptions = {}
): UseSearchInputReturn {
	const {
		defaultValue = '',
		debounceMs = DEFAULT_DEBOUNCE_MS,
		syncWithUrl = false,
		urlParam = DEFAULT_URL_PARAM,
		onSearch,
	} = options;

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get initial value from URL if sync enabled
	const initialValue = syncWithUrl
		? (searchParams.get(urlParam) ?? defaultValue)
		: defaultValue;

	const [value, setValue] = useState(initialValue);
	const [debouncedValue, setDebouncedValue] = useState(initialValue);
	const [isDebouncing, setIsDebouncing] = useState(false);

	// Helper to sync value with URL (DRY)
	const updateUrl = useCallback(
		(newValue: string) => {
			if (!syncWithUrl) return;
			const params = new URLSearchParams(searchParams.toString());
			if (newValue) {
				params.set(urlParam, newValue);
			} else {
				params.delete(urlParam);
			}
			const query = params.toString();
			router.replace(`${pathname}${query ? `?${query}` : ''}`);
		},
		[syncWithUrl, searchParams, urlParam, pathname, router]
	);

	// Create stable debounced handler
	const debouncedHandler = useMemo(
		() =>
			debounce((newValue: string) => {
				setDebouncedValue(newValue);
				setIsDebouncing(false);
				onSearch?.(newValue);
				updateUrl(newValue);
			}, debounceMs),
		[debounceMs, onSearch, updateUrl]
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedHandler.cancel();
		};
	}, [debouncedHandler]);

	// Sync with URL changes (e.g., browser back/forward)
	useEffect(() => {
		if (syncWithUrl) {
			const urlValue = searchParams.get(urlParam) ?? '';
			if (urlValue !== value) {
				setValue(urlValue);
				setDebouncedValue(urlValue);
			}
		}
	}, [syncWithUrl, searchParams, urlParam, value]);

	const onChange = useCallback(
		(newValue: string) => {
			setValue(newValue);
			// When debounceMs is 0, execute immediately without debouncing
			if (debounceMs === 0) {
				setDebouncedValue(newValue);
				onSearch?.(newValue);
				updateUrl(newValue);
			} else {
				setIsDebouncing(true);
				debouncedHandler(newValue);
			}
		},
		[debounceMs, debouncedHandler, onSearch, updateUrl]
	);

	const clear = useCallback(() => {
		setValue('');
		setDebouncedValue('');
		setIsDebouncing(false);
		debouncedHandler.cancel();
		onSearch?.('');
		updateUrl('');
	}, [debouncedHandler, onSearch, updateUrl]);

	return {
		value,
		debouncedValue,
		onChange,
		clear,
		isDebouncing,
	};
}
