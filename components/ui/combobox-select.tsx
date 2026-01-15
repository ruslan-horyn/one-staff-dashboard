'use client';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/cn';

export interface ComboboxSelectProps<T> {
	value?: T;
	onChange: (value: T | undefined) => void;
	options: T[];
	getOptionLabel: (option: T) => string;
	getOptionValue: (option: T) => string;
	getOptionDisabled?: (option: T) => boolean;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	searchable?: boolean;
	isLoading?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
}

const DEFAULT_PLACEHOLDER = 'Select...';
const DEFAULT_SEARCH_PLACEHOLDER = 'Search...';
const DEFAULT_EMPTY_MESSAGE = 'No results found.';

/**
 * Combobox/Select component with search functionality.
 * Generic over option type T for type safety.
 *
 * @example
 * <Controller
 *   name="clientId"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <ComboboxSelect
 *       value={clients.find((c) => c.id === field.value)}
 *       onChange={(client) => field.onChange(client?.id)}
 *       options={clients}
 *       getOptionLabel={(c) => c.name}
 *       getOptionValue={(c) => c.id}
 *       placeholder="Select client..."
 *       error={fieldState.error?.message}
 *     />
 *   )}
 * />
 */
export function ComboboxSelect<T>({
	value,
	onChange,
	options,
	getOptionLabel,
	getOptionValue,
	getOptionDisabled,
	placeholder = DEFAULT_PLACEHOLDER,
	searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
	emptyMessage = DEFAULT_EMPTY_MESSAGE,
	searchable = true,
	isLoading = false,
	disabled = false,
	error,
	className,
}: ComboboxSelectProps<T>) {
	const id = useId();
	const errorId = `${id}-error`;

	const [isOpen, setIsOpen] = useState(false);

	const selectedLabel = useMemo(() => {
		if (!value) return null;
		return getOptionLabel(value);
	}, [value, getOptionLabel]);

	const selectedValue = useMemo(() => {
		if (!value) return null;
		return getOptionValue(value);
	}, [value, getOptionValue]);

	const handleSelect = useCallback(
		(optionValue: string) => {
			const option = options.find((o) => getOptionValue(o) === optionValue);
			if (option && selectedValue === optionValue) {
				// Deselect if clicking the same option
				onChange(undefined);
			} else {
				onChange(option);
			}
			setIsOpen(false);
		},
		[options, getOptionValue, selectedValue, onChange]
	);

	return (
		<div className={cn('w-full', className)}>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						role="combobox"
						aria-expanded={isOpen}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
						disabled={disabled}
						className={cn(
							'h-9 w-full justify-between font-normal',
							!selectedLabel && 'text-muted-foreground',
							error &&
								'border-destructive ring-destructive/20 dark:ring-destructive/40'
						)}
					>
						<span className="truncate">{selectedLabel ?? placeholder}</span>
						{isLoading ? (
							<Loader2 className="ml-2 size-4 shrink-0 animate-spin opacity-50" />
						) : (
							<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[--radix-popover-trigger-width] p-0"
					align="start"
				>
					<Command>
						{searchable && <CommandInput placeholder={searchPlaceholder} />}
						<CommandList>
							{isLoading ? (
								<div className="flex items-center justify-center py-6">
									<Loader2 className="size-4 animate-spin text-muted-foreground" />
								</div>
							) : (
								<>
									<CommandEmpty>{emptyMessage}</CommandEmpty>
									<CommandGroup>
										{options.map((option) => {
											const optionValue = getOptionValue(option);
											const optionLabel = getOptionLabel(option);
											const isSelected = selectedValue === optionValue;
											const isDisabled = getOptionDisabled?.(option) ?? false;

											return (
												<CommandItem
													key={optionValue}
													value={optionLabel}
													onSelect={() => handleSelect(optionValue)}
													disabled={isDisabled}
												>
													<Check
														className={cn(
															'mr-2 size-4',
															isSelected ? 'opacity-100' : 'opacity-0'
														)}
													/>
													{optionLabel}
												</CommandItem>
											);
										})}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{error && (
				<p id={errorId} className="mt-1.5 text-destructive text-sm">
					{error}
				</p>
			)}
		</div>
	);
}
