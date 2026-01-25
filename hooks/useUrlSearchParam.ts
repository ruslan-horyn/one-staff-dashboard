'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseUrlSearchParamOptions {
	/** Default value when param is not in URL */
	defaultValue?: string;
	/** Use replaceState vs pushState (default: true) */
	replace?: boolean;
}

export interface UseUrlSearchParamReturn {
	/** Current value from URL or state */
	value: string;
	/** Update the URL param value */
	setValue: (value: string) => void;
	/** Clear the URL param (remove from URL) */
	clearValue: () => void;
}

/**
 * Hook for syncing state with a URL search parameter.
 *
 * @example
 * // Basic usage
 * const { value, setValue, clearValue } = useUrlSearchParam('search');
 *
 * @example
 * // With default value
 * const { value, setValue } = useUrlSearchParam('filter', { defaultValue: 'all' });
 */
export function useUrlSearchParam(
	param: string,
	options: UseUrlSearchParamOptions = {}
): UseUrlSearchParamReturn {
	const { defaultValue = '', replace = true } = options;

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get initial value from URL
	const urlValue = searchParams.get(param) ?? defaultValue;

	const [value, setValue] = useState(urlValue);

	// Track internal changes to avoid sync loops
	const isInternalChangeRef = useRef(false);

	// Update URL with new value
	const updateUrl = useCallback(
		(newValue: string) => {
			isInternalChangeRef.current = true;

			const params = new URLSearchParams(searchParams.toString());

			if (newValue) {
				params.set(param, newValue);
			} else {
				params.delete(param);
			}

			const query = params.toString();
			const newUrl = `${pathname}${query ? `?${query}` : ''}`;

			if (replace) {
				router.replace(newUrl);
			} else {
				router.push(newUrl);
			}
		},
		[param, pathname, searchParams, replace]
	);

	// Public setValue that updates both state and URL
	const setValueAndUrl = useCallback(
		(newValue: string) => {
			setValue(newValue);
			updateUrl(newValue);
		},
		[updateUrl]
	);

	// Clear value (remove from URL)
	const clearValue = useCallback(() => {
		setValue('');
		updateUrl('');
	}, [updateUrl]);

	// Sync with URL changes from browser navigation (back/forward)
	useEffect(() => {
		if (isInternalChangeRef.current) {
			isInternalChangeRef.current = false;
			return;
		}

		const currentUrlValue = searchParams.get(param) ?? defaultValue;
		if (currentUrlValue !== value) {
			setValue(currentUrlValue);
		}
	}, [searchParams, param, defaultValue, value]);

	return {
		value,
		setValue: setValueAndUrl,
		clearValue,
	};
}
