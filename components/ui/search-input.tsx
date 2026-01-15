'use client';

import { Loader2, Search, X } from 'lucide-react';
import { forwardRef, useId } from 'react';
import {
	type UseSearchInputOptions,
	useSearchInput,
} from '@/hooks/useSearchInput';
import { cn } from '@/lib/utils/cn';

export interface SearchInputProps
	extends Omit<UseSearchInputOptions, 'defaultValue'> {
	placeholder?: string;
	isLoading?: boolean;
	className?: string;
	defaultValue?: string;
}

/**
 * Search input with debouncing, optional URL sync, and loading state.
 *
 * @example
 * // Basic usage with callback
 * <SearchInput
 *   placeholder="Search workers..."
 *   onSearch={(query) => setFilter({ search: query })}
 * />
 *
 * @example
 * // With URL synchronization
 * <SearchInput
 *   placeholder="Search..."
 *   syncWithUrl
 *   urlParam="q"
 * />
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
	(
		{
			placeholder = 'Search...',
			isLoading = false,
			className,
			defaultValue,
			debounceMs,
			syncWithUrl,
			urlParam,
			onSearch,
		},
		ref
	) => {
		const id = useId();

		const { value, onChange, clear, isDebouncing } = useSearchInput({
			defaultValue,
			debounceMs,
			syncWithUrl,
			urlParam,
			onSearch,
		});

		const showLoading = isLoading || isDebouncing;
		const showClear = value.length > 0 && !showLoading;

		return (
			<div className={cn('relative', className)}>
				<Search
					className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<input
					ref={ref}
					id={id}
					type="search"
					data-slot="input"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					aria-busy={showLoading}
					className={cn(
						'h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-9 pl-9 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
						'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
					)}
				/>
				{showLoading && (
					<Loader2
						className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
						aria-hidden="true"
					/>
				)}
				{showClear && (
					<button
						type="button"
						onClick={clear}
						aria-label="Clear search"
						className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<X className="size-4" />
					</button>
				)}
			</div>
		);
	}
);

SearchInput.displayName = 'SearchInput';
