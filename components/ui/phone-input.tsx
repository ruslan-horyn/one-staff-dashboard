'use client';

import type { InputHTMLAttributes } from 'react';
import { forwardRef, useCallback, useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface PhoneInputProps
	extends Omit<
		InputHTMLAttributes<HTMLInputElement>,
		'onChange' | 'value' | 'type'
	> {
	value?: string;
	onChange: (value: string) => void;
	error?: string;
}

/**
 * Normalize phone input to digits only (preserving leading +).
 */
function normalizePhone(input: string): string {
	const hasPlus = input.startsWith('+');
	const digits = input.replace(/\D/g, '');
	return hasPlus ? `+${digits}` : digits;
}

/**
 * Format phone number for display (Polish format).
 * - 123456789 → 123 456 789
 * - +48123456789 → +48 123 456 789
 */
function formatPhone(value: string): string {
	if (!value) return '';

	const normalized = normalizePhone(value);
	const hasPlus = normalized.startsWith('+');
	const digits = hasPlus ? normalized.slice(1) : normalized;

	// Handle Polish numbers with country code
	if (hasPlus && digits.startsWith('48') && digits.length > 2) {
		const countryCode = digits.slice(0, 2);
		const number = digits.slice(2);
		const formatted = formatDigits(number);
		return `+${countryCode} ${formatted}`;
	}

	// Handle numbers with other country codes (generic international)
	if (hasPlus && digits.length > 3) {
		// Assume 1-3 digit country code
		const countryCodeLength =
			digits.length > 10 ? Math.min(3, digits.length - 9) : 1;
		const countryCode = digits.slice(0, countryCodeLength);
		const number = digits.slice(countryCodeLength);
		const formatted = formatDigits(number);
		return `+${countryCode} ${formatted}`;
	}

	// Default: format as XXX XXX XXX
	return hasPlus ? `+${formatDigits(digits)}` : formatDigits(digits);
}

/**
 * Format digits into groups of 3.
 */
function formatDigits(digits: string): string {
	const groups: string[] = [];
	for (let i = 0; i < digits.length; i += 3) {
		groups.push(digits.slice(i, i + 3));
	}
	return groups.join(' ');
}

/**
 * Phone input with automatic formatting.
 * Stores normalized digits, displays formatted.
 *
 * @example
 * <Controller
 *   name="phone"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <PhoneInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       error={fieldState.error?.message}
 *     />
 *   )}
 * />
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	(
		{ className, value = '', onChange, error, id: providedId, ...props },
		ref
	) => {
		const generatedId = useId();
		const id = providedId ?? generatedId;
		const errorId = `${id}-error`;

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const normalized = normalizePhone(e.target.value);
				onChange(normalized);
			},
			[onChange]
		);

		const displayValue = formatPhone(value);

		return (
			<div className="w-full">
				<input
					ref={ref}
					id={id}
					type="tel"
					inputMode="numeric"
					data-slot="input"
					value={displayValue}
					onChange={handleChange}
					aria-invalid={!!error}
					aria-describedby={error ? errorId : undefined}
					className={cn(
						'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
						'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
						'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
						className
					)}
					{...props}
				/>
				{error && (
					<p id={errorId} className="mt-1.5 text-destructive text-sm">
						{error}
					</p>
				)}
			</div>
		);
	}
);

PhoneInput.displayName = 'PhoneInput';
