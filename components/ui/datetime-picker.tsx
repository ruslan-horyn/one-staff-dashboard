'use client';

import { format, setHours, setMinutes } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';

export interface DateTimePickerProps {
	value?: Date;
	onChange: (value: Date | undefined) => void;
	minDate?: Date;
	maxDate?: Date;
	disabled?: boolean;
	placeholder?: string;
	clearable?: boolean;
	error?: string;
	className?: string;
	timeStep?: number;
}

const DEFAULT_PLACEHOLDER = 'Select date and time...';
const DEFAULT_TIME_STEP = 15;

/**
 * Generate hour options (0-23).
 */
function generateHours(): string[] {
	return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
}

/**
 * Generate minute options based on time step.
 */
function generateMinutes(step: number): string[] {
	const minutes: string[] = [];
	for (let i = 0; i < 60; i += step) {
		minutes.push(i.toString().padStart(2, '0'));
	}
	return minutes;
}

/**
 * DateTimePicker component with calendar and time selection.
 *
 * @example
 * <Controller
 *   name="startAt"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <DateTimePicker
 *       value={field.value ? new Date(field.value) : undefined}
 *       onChange={(date) => field.onChange(date?.toISOString())}
 *       minDate={new Date()}
 *       error={fieldState.error?.message}
 *     />
 *   )}
 * />
 */
export function DateTimePicker({
	value,
	onChange,
	minDate,
	maxDate,
	disabled = false,
	placeholder = DEFAULT_PLACEHOLDER,
	clearable = true,
	error,
	className,
	timeStep = DEFAULT_TIME_STEP,
}: DateTimePickerProps) {
	const id = useId();
	const errorId = `${id}-error`;

	const [isOpen, setIsOpen] = useState(false);
	const [tempDate, setTempDate] = useState<Date | undefined>(value);
	const [tempHour, setTempHour] = useState<string>(
		value ? format(value, 'HH') : '12'
	);
	const [tempMinute, setTempMinute] = useState<string>(
		value ? format(value, 'mm') : '00'
	);

	const hours = useMemo(() => generateHours(), []);
	const minutes = useMemo(() => generateMinutes(timeStep), [timeStep]);

	// Reset temp state when popover opens
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				setTempDate(value);
				setTempHour(value ? format(value, 'HH') : '12');
				setTempMinute(value ? format(value, 'mm') : '00');
			}
			setIsOpen(open);
		},
		[value]
	);

	const handleDateSelect = useCallback((date: Date | undefined) => {
		setTempDate(date);
	}, []);

	const handleApply = useCallback(() => {
		if (tempDate) {
			let result = setHours(tempDate, Number.parseInt(tempHour, 10));
			result = setMinutes(result, Number.parseInt(tempMinute, 10));
			onChange(result);
		}
		setIsOpen(false);
	}, [tempDate, tempHour, tempMinute, onChange]);

	const handleClear = useCallback(() => {
		onChange(undefined);
		setIsOpen(false);
	}, [onChange]);

	const displayValue = value ? format(value, 'd MMM yyyy, HH:mm') : null;

	// Determine if a date should be disabled
	const isDateDisabled = useCallback(
		(date: Date) => {
			if (minDate) {
				const minStart = new Date(
					minDate.getFullYear(),
					minDate.getMonth(),
					minDate.getDate(),
					0,
					0,
					0,
					0
				);
				if (date < minStart) {
					return true;
				}
			}
			if (maxDate) {
				const maxEnd = new Date(
					maxDate.getFullYear(),
					maxDate.getMonth(),
					maxDate.getDate(),
					23,
					59,
					59,
					999
				);
				if (date > maxEnd) {
					return true;
				}
			}
			return false;
		},
		[minDate, maxDate]
	);

	return (
		<div className={cn('w-full', className)}>
			<Popover open={isOpen} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<button
						type="button"
						id={id}
						disabled={disabled}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
						aria-haspopup="dialog"
						aria-expanded={isOpen}
						className={cn(
							'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
							'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
							'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
							!displayValue && 'text-muted-foreground'
						)}
					>
						<span className="flex items-center gap-2">
							<CalendarIcon
								className="size-4 text-muted-foreground"
								aria-hidden="true"
							/>
							{displayValue ?? placeholder}
						</span>
						{clearable && displayValue && !disabled && (
							// biome-ignore lint/a11y/useSemanticElements: span used to avoid button styles
							<span
								role="button"
								tabIndex={0}
								onClick={(e) => {
									e.stopPropagation();
									handleClear();
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										handleClear();
									}
								}}
								aria-label="Clear date"
								className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<X className="size-4" />
							</span>
						)}
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="p-3">
						<Calendar
							mode="single"
							selected={tempDate}
							onSelect={handleDateSelect}
							disabled={isDateDisabled}
							initialFocus
						/>
					</div>
					<div className="flex items-center gap-2 border-t px-3 py-2">
						<span className="text-muted-foreground text-sm">Time:</span>
						<Select value={tempHour} onValueChange={setTempHour}>
							<SelectTrigger className="w-16" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{hours.map((h) => (
									<SelectItem key={h} value={h}>
										{h}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="text-muted-foreground">:</span>
						<Select value={tempMinute} onValueChange={setTempMinute}>
							<SelectTrigger className="w-16" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{minutes.map((m) => (
									<SelectItem key={m} value={m}>
										{m}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex justify-end gap-2 border-t px-3 py-2">
						{clearable && (
							<Button variant="ghost" size="sm" onClick={handleClear}>
								Clear
							</Button>
						)}
						<Button size="sm" onClick={handleApply} disabled={!tempDate}>
							Apply
						</Button>
					</div>
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
