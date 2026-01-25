'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useId } from 'react';
import { useSearchInput } from '@/hooks/useSearchInput';
import { useSearchInputUrl } from '@/hooks/useSearchInputUrl';
import { cn } from '@/lib/utils/cn';

export interface SearchInputProps {
	syncWithUrlParam?: string;
	placeholder?: string;
	isLoading?: boolean;
	className?: string;
	defaultValue?: string;
	debounceMs?: number;
	onSearch?: (value: string) => void;
	minChars?: number;
}

const SearchInputUI = ({
	id,
	value,
	onChange,
	onClear,
	placeholder,
	showLoading,
	showClear,
	className,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
	placeholder: string;
	showLoading: boolean;
	showClear: boolean;
	className?: string;
}) => (
	<div className={cn('relative', className)}>
		<Search
			className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			aria-hidden="true"
		/>
		<input
			id={id}
			type="search"
			name="search"
			autoComplete="off"
			data-slot="input"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-busy={showLoading}
			className={cn(
				'h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-9 pl-9 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
				'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
				'[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
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
				onClick={onClear}
				aria-label="Clear search"
				className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<X className="size-4" />
			</button>
		)}
	</div>
);

/**
 * Search input with debouncing and loading state.
 *
 * @example
 * // Basic usage with callback
 * <SearchInput
 *   placeholder="Search workers..."
 *   onSearch={(query) => setFilter({ search: query })}
 * />
 *
 * @example
 * // With URL sync - automatically syncs with URL and handles back/forward
 * <SearchInput
 *   placeholder="Search clients..."
 *   syncWithUrlParam="search"
 *   onSearch={(query) => {
 *     if (query.length >= 3 || query === '') {
 *       refreshData();
 *     }
 *   }}
 * />
 */
export const SearchInput = ({
	syncWithUrlParam,
	placeholder = 'Search...',
	isLoading = false,
	className,
	defaultValue = '',
	debounceMs,
	onSearch,
	minChars,
}: SearchInputProps) => {
	const id = useId();

	const basicResult = useSearchInput({
		defaultValue,
		debounceMs,
		onSearch,
		minChars,
	});

	const urlResult = useSearchInputUrl({
		urlParam: syncWithUrlParam ?? '',
		debounceMs,
		onSearch,
		minChars,
	});

	const { value, onChange, clear, isDebouncing } = syncWithUrlParam
		? urlResult
		: basicResult;

	const showLoading = isLoading || isDebouncing;
	const showClear = value.length > 0 && !showLoading;

	return (
		<SearchInputUI
			id={id}
			value={value}
			onChange={onChange}
			onClear={clear}
			placeholder={placeholder}
			showLoading={showLoading}
			showClear={showClear}
			className={className}
		/>
	);
};

SearchInput.displayName = 'SearchInput';
