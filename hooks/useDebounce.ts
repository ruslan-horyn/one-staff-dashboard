'use client';

import { debounce } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseDebounceOptions {
	/** Debounce delay in milliseconds */
	delay: number;
	/** Fire on leading edge (default: false) */
	leading?: boolean;
}

export interface UseDebounceReturn<T> {
	/** The debounced value */
	debouncedValue: T;
	/** True while waiting for debounce to complete */
	isPending: boolean;
	/** Immediately apply pending value */
	flush: () => void;
	/** Cancel pending update, keep current debounced value */
	cancel: () => void;
}

/**
 * Generic debounce hook that returns a debounced version of a value.
 * Uses lodash debounce under the hood.
 *
 * @example

 * const { debouncedValue, isPending } = useDebounce(searchTerm, { delay: 300 });
 *
 * @example
 * // With flush and cancel
 * const { debouncedValue, flush, cancel } = useDebounce(value, { delay: 500 });
 * // flush() - immediately apply pending value
 * // cancel() - cancel pending update
 */
export function useDebounce<T>(
	value: T,
	options: UseDebounceOptions
): UseDebounceReturn<T> {
	const { delay, leading = false } = options;

	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	const [isPending, setIsPending] = useState(false);
	const isFirstRenderRef = useRef(true);

	const debouncedSetValue = useMemo(
		() =>
			debounce(
				(newValue: T) => {
					setDebouncedValue(newValue);
					setIsPending(false);
				},
				delay,
				{ leading, trailing: true }
			),
		[delay, leading]
	);
	useEffect(() => {
		return () => {
			debouncedSetValue.cancel();
		};
	}, [debouncedSetValue]);

	useEffect(() => {
		if (isFirstRenderRef.current) {
			isFirstRenderRef.current = false;
			return;
		}

		if (value === debouncedValue) {
			setIsPending(false);
			return;
		}

		if (delay === 0) {
			setDebouncedValue(value);
			setIsPending(false);
			return;
		}

		setIsPending(true);
		debouncedSetValue(value);
	}, [value, delay, debouncedValue, debouncedSetValue]);

	const cancel = useCallback(() => {
		debouncedSetValue.cancel();
		setIsPending(false);
	}, [debouncedSetValue]);

	const flush = useCallback(() => {
		debouncedSetValue.flush();
	}, [debouncedSetValue]);

	return {
		debouncedValue,
		isPending,
		flush,
		cancel,
	};
}
