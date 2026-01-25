'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';

const DEFAULT_DEBOUNCE_MS = 300;

export interface UseSearchInputOptions {
	defaultValue?: string;
	debounceMs?: number;
	onSearch?: (value: string) => void;
	/** Minimum characters required before onSearch triggers (default: 0). Empty string always triggers. */
	minChars?: number;
}

export interface UseSearchInputReturn {
	/** Current input value (immediate) */
	value: string;
	/** Debounced search value */
	searchValue: string;
	onChange: (value: string) => void;
	/** Set value externally (e.g., for URL sync from parent) */
	setValue: (value: string) => void;
	clear: () => void;
	isDebouncing: boolean;
}

/**
 * Hook for search input with debouncing.
 *
 * URL synchronization should be handled by the parent component
 * using useUrlSearchParam and the setValue function.
 *
 * @example
 * // Basic usage
 * const { value, searchValue, onChange } = useSearchInput({
 *   onSearch: (query) => fetchData(query),
 * });
 *
 * @example
 * // With URL sync in parent
 * const urlSync = useUrlSearchParam('search');
 * const { value, setValue, searchValue, onChange, clear } = useSearchInput({
 *   defaultValue: urlSync.value,
 *   onSearch: (query) => {
 *     urlSync.setValue(query);
 *     refreshData();
 *   },
 * });
 *
 * // Handle back/forward navigation
 * useEffect(() => {
 *   if (urlSync.value !== searchValue) {
 *     setValue(urlSync.value);
 *   }
 * }, [urlSync.value]);
 *
 * @example
 * // With minChars validation in parent
 * const { value, searchValue, onChange } = useSearchInput({
 *   onSearch: (query) => {
 *     if (query.length >= 3 || query === '') {
 *       fetchData(query);
 *     }
 *   },
 * });
 */
export function useSearchInput(
	options: UseSearchInputOptions = {}
): UseSearchInputReturn {
	const {
		defaultValue = '',
		debounceMs = DEFAULT_DEBOUNCE_MS,
		onSearch,
		minChars = 0,
	} = options;

	const [inputValue, setInputValue] = useState(defaultValue);

	const { debouncedValue, isPending, cancel } = useDebounce(inputValue, {
		delay: debounceMs,
	});

	// Track processed value to avoid duplicate callbacks
	const lastProcessedRef = useRef(defaultValue);

	// Handle debounced value changes
	useEffect(() => {
		if (debouncedValue === lastProcessedRef.current) return;
		// Skip if doesn't meet minimum chars (but always allow empty for clear)
		if (
			minChars > 0 &&
			debouncedValue.length > 0 &&
			debouncedValue.length < minChars
		) {
			return;
		}
		lastProcessedRef.current = debouncedValue;
		onSearch?.(debouncedValue);
	}, [debouncedValue, onSearch, minChars]);

	const onChange = useCallback((value: string) => {
		setInputValue(value);
	}, []);

	// setValue for external sync (e.g., browser back/forward)
	const setValue = useCallback((value: string) => {
		setInputValue(value);
		lastProcessedRef.current = value;
	}, []);

	const clear = useCallback(() => {
		setInputValue('');
		lastProcessedRef.current = '';
		cancel();
		onSearch?.('');
	}, [cancel, onSearch]);

	return {
		value: inputValue,
		searchValue: debouncedValue,
		onChange,
		setValue,
		clear,
		isDebouncing: isPending,
	};
}
