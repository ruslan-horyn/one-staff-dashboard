'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export interface UseUrlSearchParamOptions {
	/** Default value when param is not in URL */
	defaultValue?: string;
	/** Use replaceState vs pushState (default: true) */
	replace?: boolean;
}

export interface UseUrlSearchParamReturn {
	/** Current value from URL */
	value: string;
	/** Update the URL param value */
	setValue: (value: string) => void;
	/** Clear the URL param (remove from URL) */
	clearValue: () => void;
}

export function useUrlSearchParam(
	param: string,
	options: UseUrlSearchParamOptions = {}
): UseUrlSearchParamReturn {
	const { defaultValue = '', replace = true } = options;

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// URL is the single source of truth — no local state needed
	const value = searchParams.get(param) ?? defaultValue;

	const updateUrl = useCallback(
		(newValue: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (newValue) {
				params.set(param, newValue);
			} else {
				params.delete(param);
			}

			const query = params.toString();
			const newUrl = `${pathname}${query ? `?${query}` : ''}`;

			if (replace) {
				router.replace(newUrl as Route);
			} else {
				router.push(newUrl as Route);
			}
		},
		[param, pathname, searchParams, replace, router]
	);

	const setValue = useCallback(
		(newValue: string) => updateUrl(newValue),
		[updateUrl]
	);

	const clearValue = useCallback(() => updateUrl(''), [updateUrl]);

	return { value, setValue, clearValue };
}
